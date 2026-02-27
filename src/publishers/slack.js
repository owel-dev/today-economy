async function getChannelIdByName(channelName, token) {
  const apiUrl = 'https://slack.com/api/conversations.list?limit=1000&types=public_channel,private_channel';

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { Authorization: 'Bearer ' + token }
  });
  const channels = (await response.json()).channels;

  for (const channel of channels) {
    if (channel.name === channelName) {
      return channel.id;
    }
  }

  console.log("채널을 찾지 못했습니다.");
  return null;
}

export async function sendSlackMessage(channelName, text, threadTs = null) {
  const slackBotToken = process.env.SLACK_BOT_TOKEN;
  const channelId = await getChannelIdByName(channelName, slackBotToken);

  var payload = {
    channel: channelId,
    text: text
  };

  if (threadTs) {
    payload.thread_ts = threadTs;
  }

  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + slackBotToken
    },
    body: JSON.stringify(payload)
  });
  return await response.json();
}
