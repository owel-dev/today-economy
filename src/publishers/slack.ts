interface SlackChannel {
  name: string;
  id: string;
}

interface SlackChannelListResponse {
  channels: SlackChannel[];
}

async function getChannelIdByName(channelName: string, token: string): Promise<string | null> {
  const apiUrl = 'https://slack.com/api/conversations.list?limit=1000&types=public_channel,private_channel';

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { Authorization: 'Bearer ' + token },
  });
  const { channels }: SlackChannelListResponse = await response.json();

  for (const channel of channels) {
    if (channel.name === channelName) {
      return channel.id;
    }
  }

  console.log('채널을 찾지 못했습니다.');
  return null;
}

export async function sendSlackMessage(
  channelName: string,
  text: string,
  threadTs: string | null = null
): Promise<unknown> {
  const channelId = await getChannelIdByName(channelName, process.env.SLACK_BOT_TOKEN ?? '');

  const payload: { channel: string | null; text: string; thread_ts?: string } = {
    channel: channelId,
    text,
  };

  if (threadTs) {
    payload.thread_ts = threadTs;
  }

  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + process.env.SLACK_BOT_TOKEN,
    },
    body: JSON.stringify(payload),
  });
  return response.json();
}
