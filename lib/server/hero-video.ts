export async function serveHeroVideo(request: Request, assets: Pick<Fetcher, 'fetch'>): Promise<Response> {
  // Static Assets can ignore Range. Buffer only this small, public homepage clip.
  const assetHeaders = new Headers(request.headers);
  assetHeaders.delete('Range');
  assetHeaders.delete('If-Range');
  assetHeaders.set('Accept-Encoding', 'identity');
  const asset = await assets.fetch(new Request(request.url, { method: 'GET', headers: assetHeaders }));
  if (asset.status !== 200) return asset;

  const body = await asset.arrayBuffer();
  const size = body.byteLength;
  const headers = new Headers(asset.headers);
  headers.delete('Content-Encoding');
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Content-Length', String(size));
  if (request.method === 'HEAD') return new Response(null, { headers });

  const validator = request.headers.get('If-Range');
  const useRange = !validator || validator === headers.get('ETag') || validator === headers.get('Last-Modified');
  const match = useRange ? /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('Range') ?? '') : null;
  if (!match || (!match[1] && !match[2])) return new Response(body, { headers });

  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || end < start) {
    headers.set('Content-Range', `bytes */${size}`);
    headers.set('Content-Length', '0');
    return new Response(null, { status: 416, headers });
  }

  const chunk = body.slice(start, end + 1);
  headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
  headers.set('Content-Length', String(chunk.byteLength));
  return new Response(chunk, { status: 206, headers });
}
