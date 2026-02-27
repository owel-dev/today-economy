import { gcpApiKey } from '../config.js';

export async function fetchText(url) {
  const response = await fetch(url);
  return response.text();
}

export async function getBase64Image(imageUrl) {
  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  const base64Image = Buffer.from(arrayBuffer).toString('base64');

  return base64Image;
}

export async function ocrImage(base64Image) {
  const apiKey = gcpApiKey;
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
