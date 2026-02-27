import 'dotenv/config';
import yaml from 'js-yaml';
import { readFileSync } from 'fs';
import { createWpPost } from './src/publishers/wordpress.js';
import { sendMailList } from './src/publishers/email.js';
import { sendSlackMessage } from './src/publishers/slack.js';
import { createTitle, createContent } from './src/news.js';

const config = yaml.load(readFileSync('./config.yaml', 'utf8'));

async function main() {
  const mode = process.env.MODE;
  const title = createTitle();
  const content = await createContent(config.newspapers);

  if (mode === 'terminal') {
    console.log(`\n${title}\n\n${content}\n`);
  } else if (mode === 'wordpress') {
    await createWpPost(title, content);
  } else if (mode === 'email') {
    await sendMailList(config.email.recipients, title, content);
  } else if (mode === 'slack') {
    await sendSlackMessage(process.env.SLACK_CHANNEL, `${title}\n\n${content}`);
  } else {
    console.error(`지원하지 않는 MODE입니다: "${mode}". terminal, wordpress, email, slack 중 하나를 설정해주세요.`);
    process.exit(1);
  }
}

main();
