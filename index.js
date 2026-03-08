import { newspapers, emailRecipients } from './config.js';
import { createWpPost } from './src/publishers/wordpress.js';
import { sendMailList } from './src/publishers/email.js';
import { sendSlackMessage } from './src/publishers/slack.js';
import { createTitle, createContent } from './src/news.js';

async function main() {
  const title = createTitle();
  const content = await createContent(newspapers);

  if (!title || !content) {
    console.error('제목 또는 내용이 비어 있습니다.');
    process.exit(1);
  }

  const mode = process.env.MODE;

  if (mode === 'terminal') {
    console.log(`\n${title}\n\n${content}\n`);
  } else if (mode === 'wordpress') {
    await createWpPost(title, content);
  } else if (mode === 'email') {
    await sendMailList(emailRecipients, title, content);
  } else if (mode === 'slack') {
    await sendSlackMessage(process.env.SLACK_CHANNEL, `${title}\n\n${content}`);
  } else {
    console.error(`지원하지 않는 MODE입니다: "${mode}". terminal, wordpress, email, slack 중 하나를 설정해주세요.`);
    process.exit(1);
  }
}

main();
