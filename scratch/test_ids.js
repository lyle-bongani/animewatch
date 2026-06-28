const query = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      idMal
      title { romaji english }
    }
  }
`;

async function test(id) {
  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { id } })
    });
    const json = await res.json();
    console.log(`Anime ID ${id}:`, JSON.stringify(json.data, null, 2));
  } catch (err) {
    console.error(`Error for ${id}:`, err);
  }
}

test(21);
test(16498);
