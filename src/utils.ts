import fs from 'fs';
import path from 'path';

export function getKoreanDate({ padZero = true } = {}): { year: string; month: string; day: string } {
  const [year, month, day] = new Date()
    .toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Seoul',
    })
    .split('. ')
    .map((s) => s.replace('.', ''));

  return {
    year,
    month: padZero ? month : String(Number(month)),
    day: padZero ? day : String(Number(day)),
  };
}

export function saveLog(title: string, content: string): void {
  const { year, month, day } = getKoreanDate();
  const dir = path.resolve('logs');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${year}${month}${day}_${title}.txt`), content, 'utf-8');
}
