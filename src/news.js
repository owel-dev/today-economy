import fs from 'fs';
import { getBase64Image, ocrImage, scrapeBodyText, scrapeSelectorUrl } from './scraper.js';
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

  const totalSteps = newspapers.length + 4;

  for (let i = 0; i < newspapers.length; i++) {
    if (!isWorkingDay(newspapers[i])) {
      console.log(`[${i + 1}/${totalSteps}] ${newspapers[i].name} 기사 건너뜀`);
      continue;
    }
    
    const article = await getRowArticle(newspapers[i]);
    saveLog(`0_${newspapers[i].name}`, article);
    console.log(`[${i + 1}/${totalSteps}] ${newspapers[i].name} 기사 수집 완료`);
    content += article;
  }

  const offset = newspapers.length;

  content = await generateLlmCompletion(PROMPTS.removeUnnecessary, content);
  saveLog('1_removeUnnecessary', content);
  console.log(`[${offset + 1}/${totalSteps}] 불필요한 내용 제거 완료`);

  content = await generateLlmCompletion(PROMPTS.mergeDuplicate, content);
  saveLog('2_mergeDuplicate', content);
  console.log(`[${offset + 2}/${totalSteps}] 중복 기사 병합 완료`);

  content = await generateLlmCompletion(PROMPTS.summary, content);
  saveLog('3_summary', content);
  console.log(`[${offset + 3}/${totalSteps}] 기사 요약 완료`);

  content = await generateLlmCompletion(PROMPTS.addTermsGlossary, content);
  saveLog('4_addTermsGlossary', content);
  console.log(`[${offset + 4}/${totalSteps}] 용어 해설 추가 완료`);

  return content;
}

export function isWorkingDay(newspaper) {
  if (!newspaper.skipDays) return true;
  const dayOfWeek = new Date().getDay();
  return !newspaper.skipDays.includes(dayOfWeek);
}

export async function getRowArticle({ type, url, selector }) {
  const { year, month, day } = getKoreanDate();
  const resolvedUrl = url
    .replace('{year}', year)
    .replace('{month}', month)
    .replace('{day}', day);

  if (type === 'image') {
    const imageBase64 = await getBase64Image(resolvedUrl);
    return ocrImage(imageBase64);
  } else if (type === 'text') {
    if (selector) {
      const articleUrl = await scrapeSelectorUrl(resolvedUrl, selector);
      return scrapeBodyText(articleUrl);
    }
    return scrapeBodyText(resolvedUrl);
  } else {
    throw new Error(`지원하지 않는 뉴스 타입입니다: "${type}".`);
  }
}
