import * as cheerio from 'cheerio';
import https from 'node:https';

export async function fetchText(url) {
  const response = await fetch(url);
  return response.text();
}

export async function scrapeSelectorUrl(url, selector) {
  const html = await fetchText(url);
  const $ = cheerio.load(html);
  const href = $(selector).attr('href');
  if (!href) throw new Error(`기사 URL을 찾을 수 없습니다 (selector: ${selector})`);
  return href;
}

export async function scrapeBodyText(url) {
  const html = await fetchText(url);
  const $ = cheerio.load(html);
  $('script, style, nav, header, footer').remove();
  return $('body').html();
}

export async function getBase64Image(imageUrl) {
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
    if ((error?.cause?.code ?? error?.code) !== 'ERR_SSL_DH_KEY_TOO_SMALL') {
      throw error;
    }

    const imageBuffer = await new Promise((resolve, reject) => {
      https
        .get(imageUrl, { ciphers: 'DEFAULT@SECLEVEL=1' }, (res) => {
          if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
            res.resume();
            reject(new Error(`이미지 다운로드 실패 (${res.statusCode}): ${imageUrl}`));
            return;
          }

          const chunks = [];
          res.on('data', (chunk) => chunks.push(chunk));
          res.on('end', () => resolve(Buffer.concat(chunks)));
          res.on('error', reject);
        })
        .on('error', reject);
    });

    return imageBuffer.toString('base64');
  }
}

export async function ocrImage(base64Image) {
  const apiKey = process.env.GCP_API_KEY;
  const visionApiUrl = 'https://vision.googleapis.com/v1/images:annotate?key=' + apiKey;

  const requestBody = {
    requests: [
      {
        image: {
          content: base64Image
        },
        features: [
          {
            type: 'TEXT_DETECTION'
          }
        ]
      }
    ]
  };

  const response = await fetch(visionApiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });
  const responseData = await response.json();

  if (!response.ok || !responseData.responses) {
    throw new Error(`Google Vision API 오류: ${JSON.stringify(responseData.error || responseData)}`);
  }

  const textAnnotation = responseData.responses[0].fullTextAnnotation;
  return textAnnotation ? textAnnotation.text : null;
}
