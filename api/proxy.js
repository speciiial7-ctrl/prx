export default async function handler(req, res) {
  const target = req.query.url;
  if (!target) {
    res.status(400).send("Missing ?url= parameter");
    return;
  }

  try {
    // Pass Range headers if player requests partial content
    const rangeHeader = req.headers['range'];
    const headers = {
      "User-Agent": "VLC/3.0.19 LibVLC/3.0.19",
      "Referer": "http://localhost/",
      "Accept": "*/*",
      ...(rangeHeader ? { "Range": rangeHeader } : {}),
    };

    const response = await fetch(target, { headers });

    // Forward headers from original response
    if (response.headers.get("content-type"))
      res.setHeader("Content-Type", response.headers.get("content-type"));
    if (response.headers.get("content-length"))
      res.setHeader("Content-Length", response.headers.get("content-length"));
    if (response.headers.get("content-range"))
      res.setHeader("Content-Range", response.headers.get("content-range"));

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");

    // If partial content, set status
    if (response.status === 206) res.status(206);

    // Stream directly without buffering
    const reader = response.body.getReader();
    const stream = new ReadableStream({
      start(controller) {
        function push() {
          reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            controller.enqueue(value);
            push();
          });
        }
        push();
      }
    });

    const responseStream = new Response(stream);
    const reader2 = responseStream.body.getReader();

    function sendChunks() {
      reader2.read().then(({ done, value }) => {
        if (done) {
          res.end();
          return;
        }
        res.write(Buffer.from(value));
        sendChunks();
      });
    }

    sendChunks();

  } catch (err) {
    res.status(500).send("Proxy error: " + err.message);
  }
}
