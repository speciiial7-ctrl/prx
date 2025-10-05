export default function handler(req, res) {
  let tsLinks = req.query.ts;
  if (!tsLinks) {
    return res.status(400).send("Missing ?ts= parameter");
  }

  if (!Array.isArray(tsLinks)) {
    tsLinks = [tsLinks];
  }

  const proxyDomain = 'https://prx-roan.vercel.app';

  let m3u8Content = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-ALLOW-CACHE:NO
`;

  tsLinks.forEach(ts => {
    m3u8Content += `\n#EXTINF:10.0,
${proxyDomain}/api/proxy?url=${encodeURIComponent(ts)}
`;
  });

  // Set headers for HLS playback
  res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.status(200).send(m3u8Content);
}
