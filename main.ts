import { newspapers, emailRecipients } from './config.ts';
import { createWpPost } from './src/publishers/wordpress.ts';
import { sendMailList } from './src/publishers/email.ts';
import { sendSlackMessage } from './src/publishers/slack.ts';
import { createTitle, createContent } from './src/news.ts';

async function main(): Promise<void> {
  const title = createTitle();
  const content = await createContent(newspapers);
  if (content == null) {
    return;
  }

  const mode = process.env.MODE;

  if (mode === 'terminal') {
    console.log(`\n${title}\n\n${content}\n`);
  } else if (mode === 'wordpress') {
    await createWpPost(title, content);
  } else if (mode === 'email') {
    await sendMailList(emailRecipients, title, content);
  } else if (mode === 'slack') {
    await sendSlackMessage(process.env.SLACK_CHANNEL ?? '', `${title}\n\n${content}`);
  } else {
    console.error(`지원하지 않는 MODE입니다: "${mode}". terminal, wordpress, email, slack 중 하나를 설정해주세요.`);
    process.exit(1);
  }
}

main();
