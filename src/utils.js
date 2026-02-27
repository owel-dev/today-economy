export function getKoreanDate({ padZero = true } = {}) {
  const [year, month, day] = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Seoul',
  }).split('. ').map(s => s.replace('.', ''));

  return {
    year,
    month: padZero ? month : String(Number(month)),
    day: padZero ? day : String(Number(day)),
  };
}