async function test() {
  const epRes = await fetch('https://luciferdonghua.org/apotheosis-season-2-episode-54-english-subtitle/', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const epPageHtml = await epRes.text();
  const options = Array.from(epPageHtml.matchAll(/<option[\s\S]*?value=["']([\s\S]*?)["'][^>]*>([\s\S]*?)<\/option>/gi));
  console.log(`Found ${options.length} server options in Apotheosis Ep 54:`);
  for (const [, val, label] of options) {
    try {
      const decoded = Buffer.from(val.trim(), 'base64').toString('utf8');
      const srcMatch = decoded.match(/src=["']([^"']+)["']/i);
      console.log(`Server: ${label.trim()} -> Embed: ${srcMatch ? srcMatch[1] : decoded}`);
    } catch (e) {}
  }
}
test();
