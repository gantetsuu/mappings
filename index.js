const express = require("express");
const { distance } = require("fastest-levenshtein");
const { searchOnGoGo } = require("./utils/Gogo");
const { fetchTitles } = require("./utils/Anilist");
const NodeCache = require("node-cache");
const cache = new NodeCache();
const app = express();

function calculateSimilarity(anilistTitles, titles) {
  const similarityScores = [];

  for (const anilistTitle of anilistTitles) {
    for (const gogoTitle of titles) {
      if (anilistTitle && gogoTitle?.href) {
        const titleDistance = distance(
          anilistTitle
            ?.toLowerCase()
            ?.replaceAll(" ", "-")
            ?.replace(/[^a-zA-Z0-9-]/g, ""),
          gogoTitle?.href?.toLowerCase()
        );
        // const yearSimilarity = anilistTitle?.includes(gogoTitle.released)
        //   ? 1
        //   : 0;
        // const totalSimilarity = yearSimilarity / (titleDistance + 1);
        const maxLength = Math.max(
          anilistTitle.length,
          gogoTitle?.href?.length
        );
        const titleSimilarity = 1 - titleDistance / maxLength; // Normalized title similarity
        // const yearSimilarity = anilistTitle?.includes(gogoTitle?.released)
        //   ? 1
        //   : 0;
        const totalSimilarity = titleSimilarity / 2;
        similarityScores.push({
          anilist: anilistTitle?.toLowerCase()?.replaceAll(" ", "-"),
          gogo: gogoTitle?.href?.toLowerCase(),
          score: totalSimilarity,
        });
      }
    }
  }
  similarityScores?.sort((a, b) => b.score - a.score);
  return similarityScores;
}

// Endpoint to get GoGoAnime ID based on AniList ID
app.get("/mappings", async (req, res) => {
  const { id, provider = "gogoanime" } = req.query;

  if (!id || provider !== "gogoanime") {
    return res.status(400).json({ error: "ID query parameter is required" });
  }

  try {
    const u = `${id}${provider}`;
    let d = cache.get(u);
    if (d) {
      console.log("found cache", JSON.stringify(d));
      return res.json(d);
    }
    const anilistData = await fetchTitles(id);
    const anilistTitles = Object.values(anilistData);
    let gogoTitles = [];
    for (const title of anilistTitles) {
      const results = await searchOnGoGo(
        title?.toLowerCase(),
        anilistData.year,
        anilistData.format
      );
      gogoTitles = gogoTitles.concat(results);
    }
    // console.log("gogoTitles", gogoTitles);
    // console.log("anilistTitles", anilistTitles);
    const s = calculateSimilarity(anilistTitles, gogoTitles);
    // console.log(similarityScores);
    const closestMatch = s[0];
    // console.log(closestMatch);
    d = {
      id,
      gogoanime: closestMatch?.gogo,
    };
    // s,
    // anilistTitles,
    // gogoTitles,
    res.json(d);
    cache.set(u, d, 18000);
    console.log("sent", JSON.stringify(d));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
