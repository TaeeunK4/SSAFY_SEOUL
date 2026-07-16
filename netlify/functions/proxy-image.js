// Simple Netlify Function to proxy external images and return them (base64)
// Saves client from mixed-content / CORS issues.
export const handler = async (event) => {
  const url = event.queryStringParameters && event.queryStringParameters.url;
  if (!url) return { statusCode: 400, body: 'missing url' };

  // Optional: whitelist domains to avoid open proxy
  const allowed = [ 'upload.wikimedia.org', 'tong.visitkorea.or.kr', 'placehold.co' ];
  try {
    const parsed = new URL(url);
    if (!allowed.some(d => parsed.hostname.endsWith(d))) {
      // still allow but you may choose to reject unknown hosts
      // return { statusCode: 403, body: 'forbidden' };
    }
  } catch (e) {
    return { statusCode: 400, body: 'invalid url' };
  }

  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) return { statusCode: res.status, body: 'upstream error' };
    const contentType = res.headers.get('content-type') || 'image/*';
    const buffer = await res.arrayBuffer();
    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400'
      },
      body: Buffer.from(buffer).toString('base64'),
      isBase64Encoded: true
    };
  } catch (err) {
    return { statusCode: 502, body: 'bad upstream' };
  }
};
