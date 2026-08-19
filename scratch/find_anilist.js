async function findMore() {
  const query = `
    query ($search: String) {
      Page(perPage: 3) {
        media(search: $search, type: ANIME) {
          id
          title { romaji english native }
          seasonYear
          format
          status
        }
      }
    }
  `;

  const terms = [
    'Perfect World',
    'Wanmei Shijie',
    'Shrouding the Heavens',
    'Zhe Tian',
    'Lord of the Universe',
    'Wan Jie Shen Zhu',
    'Peerless Martial Spirit',
    'Supreme God Emperor',
    'Soul Land 2',
    'Martial Universe',
    'Wu Dong Qian Kun'
  ];

  for (const term of terms) {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { search: term } }),
    });
    const json = await res.json();
    const item = json.data?.Page?.media?.[0];
    if (item) {
      console.log(`${item.id}: ${item.title.romaji || item.title.english} (${item.title.native})`);
    }
  }
}
findMore();
