require("dotenv").config();
const express = require("express");
const { distance } = require("fastest-levenshtein");
const { searchOnGoGo } = require("./provider/Gogo");
const { fetchTitles } = require("./provider/Anilist");
const NodeCache = require("node-cache");
const { searchOnZoro } = require("./provider/Zoro");
const { default: axios } = require("axios");
const cache = new NodeCache();
const app = express();
const PORT = process.env.PORT || 8080;
const mongoose = require(`mongoose`);
const Bottleneck = require("bottleneck");
const connectDB = require("./db/connect");
const { Mapping } = require("./db/schema");
app.use(express.json({ limit: Infinity }));
app.use(express.urlencoded({ extended: true, limit: Infinity }));
// connectDB(
//   "mongodb+srv://zeusgotamassivethang:verypositive@gojo.bgpn3rk.mongodb.net/auth"
// );
function calculateSimilarity(anilistTitles, titles, provider) {
  const similarityScores = [];

  for (const anilistTitle of anilistTitles) {
    for (const title of titles) {
      if (anilistTitle && title?.matcher) {
        const titleDistance = distance(
          anilistTitle
            ?.toLowerCase()
            ?.replaceAll(" ", "-")
            ?.replace(/[^a-zA-Z0-9-]/g, ""),
          title?.matcher?.toLowerCase()
        );
        // const yearSimilarity = anilistTitle?.includes(title.released)
        //   ? 1
        //   : 0;
        // const maxLength = Math.max(anilistTitle.length, title?.matcher?.length);
        const averageLength =
          (anilistTitle?.length + title?.matcher?.length) / 2;
        const titleSimilarity = 1 - titleDistance / averageLength;
        const score = titleSimilarity;
        if (score < 0.01) continue;
        similarityScores.push({
          anilist: anilistTitle?.toLowerCase()?.replaceAll(" ", "-"),
          slug: title?.slug?.toLowerCase(),
          score,
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

  if (!id) {
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
    let titles = [];
    for (const title of anilistTitles) {
      let results = [];
      if (provider === "gogoanime") {
        results = await searchOnGoGo(
          title?.toLowerCase(),
          anilistData.year,
          anilistData.format
        );
      } else {
        results = await searchOnZoro(
          title?.toLowerCase(),
          anilistData.year,
          anilistData.format
        );
      }
      titles = titles?.concat(results);
    }
    // console.log("titles", titles);
    // console.log("anilistTitles", anilistTitles);
    const s = calculateSimilarity(anilistTitles, titles);
    // console.log(similarityScores);
    const closestMatch = s[0];
    // console.log(closestMatch);
    d = {
      id,
      slug: closestMatch?.slug,
      // s,
      // anilistTitles,
      // titles,
    };
    res.json(d);
    if (d?.slug) cache.set(u, d, 18000);
    console.log("sent", JSON.stringify(d));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// app.get("/map", async (req, res) => {
//   try {
//     await MapGogo();
//   } catch (e) {
//     console.log(e);
//   }
// });
// Start the server
mongoose.connection.once("open", () => {
  console.log("mongo connected successfully 🍆");
});
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
process.on("SIGINT", () => {
  mongoose.connection.close();
  process.exit();
});

const MapGogo = async () => {
  try {
    const { data } = await axios.get(
      "https://raw.githubusercontent.com/gantetsuu/anilist_ids/master/anime_ids.txt"
    );
    const anilist_ids = data?.trim()?.split("\n");

    const limiter = new Bottleneck({
      minTime: 6000, // 6 seconds between requests (10 requests per minute)
    });

    const fetchAndSaveMapping = limiter.wrap(async (id) => {
      console.log("mapping", id);
      const anilistData = await fetchTitles(id);
      const anilistTitles = Object.values(anilistData);
      let titles = [];

      const searchPromises = anilistTitles?.map(async (title) => {
        const results = await searchOnGoGo(
          title?.toLowerCase(),
          anilistData.year,
          anilistData.format
        );
        return results;
      });

      const resultsArray = await Promise.all(searchPromises);
      titles = resultsArray.flat();

      const s = calculateSimilarity(anilistTitles, titles);
      const closestMatch = s[0];

      const mapping = await Mapping.create({
        anilist_id: id,
        gogo: closestMatch?.slug,
        title: anilistTitles[0], // Assuming the first title is the main title
      });
      console.log(mapping);
      return mapping;
    });

    for (const id of anilist_ids) {
      await fetchAndSaveMapping(id);
    }
  } catch (error) {
    console.log(error);
  }
};

// const MapGogo = async () => {
//   try {
//     const { data } = await axios.get(
//       "https://raw.githubusercontent.com/gantetsuu/anilist_ids/master/anime_ids.txt"
//     );
//     const anilist_ids = data?.trim()?.split("\n")?.slice(0, 10);
//     // Create an array of promises for fetching anilistData
//     const fetchPromises = anilist_ids?.map(async (id) => {
//       console.log("mapping", id);
//       const anilistData = await fetchTitles(id);
//       const anilistTitles = Object.values(anilistData);
//       let titles = [];

//       // Create an array of promises for parallel execution
//       const searchPromises = anilistTitles?.map(async (title) => {
//         const results = await searchOnGoGo(
//           title?.toLowerCase(),
//           anilistData.year,
//           anilistData.format
//         );
//         return results;
//       });

//       // Wait for all searchPromises to resolve
//       const resultsArray = await Promise.all(searchPromises);

//       // Flatten the results and concatenate them
//       titles = resultsArray.flat();

//       const s = calculateSimilarity(anilistTitles, titles);
//       // console.log(s?.[0]);

//       return { id, ...s?.[0] }; // Or return whatever you need from each iteration
//     });

//     // Wait for all fetchPromises to resolve
//     const d = await Promise.all(fetchPromises);
//     console.log(d);
//     // console.log(anilist_ids?.trim().split("\n"));
//     return d;
//   } catch (error) {
//     console.log(error);
//   }
// };
