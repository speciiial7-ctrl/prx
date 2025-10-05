export default async function handler(req, res) {
  const target = req.query.url;
  if (!target) {
    res.status(400).send("Missing ?url parameter");
    return;
  }

  try {
    // Fetch the .ts segment from the IPTV server
    const response = await fetch(target, {
      headers: {
        "User-Agent": "VLC/3.0.19 LibVLC/3.0.19",
        "Referer": "http://localhost/",
        "Origin": "http://localhost/",
        "Accept": "*/*",
        "Connection": "keep-alive",
        "Range": "bytes=0-",
      },
    });

    // Pass through content headers and enable CORS
    res.setHeader("Content-Type", response.headers.get("content-type") || "video/MP2T");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");

    // Stream the response to the client without buffering
    const reader = response.body.getReader();

    function push() {
      reader.read().then(({ done, value }) => {
        if (done) {
          res.end();
          return;
        }
        res.write(Buffer.from(value));
        push();
      });
    }
    push();

  } catch (err) {
    res.status(500).send("Proxy error: " + err.message);
  }
}
