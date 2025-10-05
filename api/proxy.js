export default async function handler(req, res) {
  const target = req.query.url;
  if (!target) {
    res.status(400).send("Missing ?url= parameter");
    return;
  }

  try {
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

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "*");

    if (response.headers.get("content-type"))
      res.setHeader("Content-Type", response.headers.get("content-type"));
    if (response.headers.get("content-length"))
      res.setHeader("Content-Length", response.headers.get("content-length"));

    const arrayBuffer = await response.arrayBuffer();
    res.status(response.status).send(Buffer.from(arrayBuffer));
  } catch (err) {
    res.status(500).send("Proxy fetch error: " + err.message);
  }
}
