async function testEmbeds() {
  const anime = 'Renegade Immortal';
  const ep = 80;
  
  // 1. Filemoon search / embed test
  try {
    const fmUrl = `https://filemoon.sx/e/?search=${encodeURIComponent(anime + ' ' + ep)}`;
    console.log('Testing Filemoon:', fmUrl);
    const fmRes = await fetch(fmUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    console.log('Filemoon status:', fmRes.status);
  } catch(e) { console.error('Filemoon err:', e.message); }

  // 2. StreamWish search / embed test
  try {
    const swUrl = `https://streamwish.to/e/?search=${encodeURIComponent(anime + ' ' + ep)}`;
    console.log('Testing StreamWish:', swUrl);
    const swRes = await fetch(swUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    console.log('StreamWish status:', swRes.status);
  } catch(e) { console.error('StreamWish err:', e.message); }
}
testEmbeds();
