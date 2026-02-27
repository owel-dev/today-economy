export async function createWpPost(title, content) {
  const apiUrl = `${process.env.WP_URL}/wp-json/wp/v2/posts`;
  const username = process.env.WP_USERNAME;
  const password = process.env.WP_APP_PASSWORD;
  const credentials = Buffer.from(`${username}:${password}`).toString('base64');

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + credentials
    },
    body: JSON.stringify({
      title: title,
      content: content,
      status: 'publish'
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.log("WordPress 글 작성 실패:", data.message);
    return null;
  }

  console.log("WordPress 글 작성 완료:", data.link);
  return data;
}
