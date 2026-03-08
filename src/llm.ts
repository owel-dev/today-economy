interface LlmOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  reasoningEffort?: string;
}

interface OpenAIResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
}

export async function generateLlmCompletion(
  systemPrompt: string,
  userContent: string,
  options: LlmOptions = {}
): Promise<string | null> {
  const apiKey = process.env.GPT_API_KEY;

  if (!apiKey) {
    throw new Error('GPT_API_KEY가 설정되지 않았습니다');
  }

  const { model = 'gpt-5-mini', temperature, maxTokens, reasoningEffort } = options;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      ...(temperature !== undefined && { temperature }),
      ...(maxTokens !== undefined && { max_completion_tokens: maxTokens }),
      ...(reasoningEffort !== undefined && { reasoning_effort: reasoningEffort }),
    }),
  });

  if (!response.ok) {
    const error: OpenAIResponse = await response.json().catch(() => ({}));
    throw new Error(`API 요청 실패 (${response.status}): ${error.error?.message || '알 수 없는 오류'}`);
  }

  const data: OpenAIResponse = await response.json();
  return data.choices?.[0]?.message?.content ?? null;
}
