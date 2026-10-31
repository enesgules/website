// Static assets ignore Range requests and always send the full file. Apple's link
// previews (Messages) only play og:video when the server answers byte ranges with 206,
// so the Worker runs first for the OG video (see run_worker_first) and slices it.
type Env = {
  ASSETS: { fetch(request: Request): Promise<Response> };
};

export default {
  async fetch(request: Request, env: Env) {
    const response = await env.ASSETS.fetch(request);
    const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("Range") ?? "");
    if (response.status !== 200 || !range || (!range[1] && !range[2])) {
      const headers = new Headers(response.headers);
      headers.set("Accept-Ranges", "bytes");
      return new Response(response.body, { headers, status: response.status });
    }

    const body = await response.arrayBuffer();
    const size = body.byteLength;
    // "bytes=-N" asks for the last N bytes.
    const start = range[1] ? Number(range[1]) : Math.max(size - Number(range[2]), 0);
    const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start > end) {
      return new Response(null, { headers: { "Content-Range": `bytes */${size}` }, status: 416 });
    }

    const headers = new Headers(response.headers);
    headers.set("Accept-Ranges", "bytes");
    headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
    return new Response(body.slice(start, end + 1), { headers, status: 206 });
  },
};
