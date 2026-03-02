import { fetchText, getBase64Image, ocrImage } from './scraper.js';
import { generateLlmCompletion } from './llm.js';
import { PROMPTS } from './prompts.js';
import { getKoreanDate } from './utils.js';
import { DAY } from './constants.js';
import { saveLog } from './utils.js';

export function createTitle() {
  const { year, month, day } = getKoreanDate({ padZero: false });

  return `${year}년 ${month}월 ${day}일 오늘의 경제뉴스`;
}

export async function createContent(newspapers) {
  let content = "";

  if (new Date().getDay() === DAY.SUN) return;
  const total = newspapers.length + 4;

  for (let i = 0; i < newspapers.length; i++) {
    content += await getRowArticle(newspapers[i]);
    console.log(`[${i + 1}/${total}] ${newspapers[i].name} 기사 수집 완료`);
  }

  const offset = newspapers.length;

  content = await generateLlmCompletion(PROMPTS.removeUnnecessary, content);
  saveLog('1_removeUnnecessary', content);
  console.log(`[${offset + 1}/${total}] 불필요한 내용 제거 완료`);

  content = await generateLlmCompletion(PROMPTS.mergeDuplicate, content);
  saveLog('2_mergeDuplicate', content);
  console.log(`[${offset + 2}/${total}] 중복 기사 병합 완료`);

  content = await generateLlmCompletion(PROMPTS.summary, content);
  saveLog('3_summary', content);
  console.log(`[${offset + 3}/${total}] 기사 요약 완료`);

  content = await generateLlmCompletion(PROMPTS.addTermsGlossary, content);
  saveLog('4_addTermsGlossary', content);
  console.log(`[${offset + 4}/${total}] 용어 해설 추가 완료`);

  return content;
}

export async function getRowArticle({ type, url }) {
  const { year, month, day } = getKoreanDate();
  const resolvedUrl = url
    .replace('{year}', year)
    .replace('{month}', month)
    .replace('{day}', day);

  if (type === 'image') {
    const imageBase64 = await getBase64Image(resolvedUrl);
    return ocrImage(imageBase64);
  } else if (type === 'text') {
    return fetchText(resolvedUrl);
  } else {
    throw new Error(`지원하지 않는 뉴스 타입입니다: "${type}".`);
  }

}
