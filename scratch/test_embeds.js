async function testNewServers() {
  const anime = '100.000 Years of Refining Qi';
  const ep = 1;

  // Keyrafara
  try {
    const kUrl = `https://www.keyrafara.com/streaming/donghub?query=${encodeURIComponent(anime)}`;
    console.log('Testing Keyrafara:', kUrl);
    const kRes = await fetch(kUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    console.log('Keyrafara status:', kRes.status);
  } catch(e) { console.error('Keyrafara err:', e.message); }

  // DonghuaStream
  try {
    const dsUrl = `https://donghuastream.org/?s=${encodeURIComponent(anime + ' episode ' + ep)}`;
    console.log('Testing DonghuaStream:', dsUrl);
    const dsRes = await fetch(dsUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    console.log('DonghuaStream status:', dsRes.status);
  } catch(e) { console.error('DonghuaStream err:', e.message); }
}
testNewServers();
