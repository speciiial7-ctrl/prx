export default function handler(req, res) {
  const ts = req.query.ts;
  if (!ts) return res.status(400).send("Missing ?ts= parameter");

  // Construct m3u8 content dynamically
  const content = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-ALLOW-CACHE:NO

#EXTINF:10.0, LIVE
https://prx-roan.vercel.app/api/proxy?url=${encodeURIComponent(ts)}
`;

  res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send(content);
}
