import * as cheerio from 'cheerio';
import https from 'node:https';

export async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  return response.text();
}

export async function scrapeSelectorUrl(url: string, selector: string): Promise<string> {
  const html = await fetchText(url);
  const $ = cheerio.load(html);
  const href = $(selector).attr('href');
  if (!href) throw new Error(`기사 URL을 찾을 수 없습니다 (selector: ${selector})`);
  return href;
}

export async function scrapeBodyText(url: string): Promise<string | null> {
  const html = await fetchText(url);
  const $ = cheerio.load(html);
  $('script, style, nav, header, footer').remove();
  return $('body').html();
}

export async function getBase64Image(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`이미지 다운로드 실패 (${response.status}): ${imageUrl}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    if (!base64Image) {
      throw new Error(`이미지 인코딩 실패: ${imageUrl}`);
    }

    return base64Image;
  } catch (error) {
    const err = error as NodeJS.ErrnoException & { cause?: NodeJS.ErrnoException };
    if ((err?.cause?.code ?? err?.code) !== 'ERR_SSL_DH_KEY_TOO_SMALL') {
      throw error;
    }

    const imageBuffer = await new Promise<Buffer>((resolve, reject) => {
      https
        .get(imageUrl, { ciphers: 'DEFAULT@SECLEVEL=1' }, (res) => {
          if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
            res.resume();
            reject(new Error(`이미지 다운로드 실패 (${res.statusCode}): ${imageUrl}`));
            return;
          }

          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => chunks.push(chunk));
          res.on('end', () => resolve(Buffer.concat(chunks)));
          res.on('error', reject);
        })
        .on('error', reject);
    });

    return imageBuffer.toString('base64');
  }
}

interface VisionResponse {
  responses?: Array<{ fullTextAnnotation?: { text: string } }>;
  error?: unknown;
}

export async function ocrImage(base64Image: string): Promise<string | null> {
  const apiKey = process.env.GCP_API_KEY;
  const visionApiUrl = 'https://vision.googleapis.com/v1/images:annotate?key=' + apiKey;

  const requestBody = {
    requests: [
      {
        image: { content: base64Image },
        features: [{ type: 'TEXT_DETECTION' }],
      },
    ],
  };

  const response = await fetch(visionApiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });
  const responseData: VisionResponse = await response.json();

  if (!response.ok || !responseData.responses) {
    throw new Error(`Google Vision API 오류: ${JSON.stringify(responseData.error || responseData)}`);
  }

  const textAnnotation = responseData.responses[0].fullTextAnnotation;
  return textAnnotation ? textAnnotation.text : null;
}
