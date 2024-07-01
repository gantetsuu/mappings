const hianimeUrl = process.env.HIANIME_URL || "https://hianime.to";
const axios = require("axios");
const cheerio = require("cheerio");

async function searchOnZoro(title, year, format) {
  try {
    const searchUrl = `${hianimeUrl}/search?keyword=${title?.replaceAll(
      " ",
      "+"
    )}`;
    const { data } = await axios.get(searchUrl);
    const $ = cheerio.load(data);
    const searchResults = [];
    $(".film_list-wrap > .flw-item .film-detail .film-name a").map((i, el) => {
      const name = $(el).text();
      const slug = $(el)
        .attr("href")
        ?.replace("/anime/", "")
        ?.replace("/watch/", "")
        ?.replace("?ref=search", "")
        ?.replaceAll("/", "");

      searchResults.push({ name, matcher: name, slug });
    });
    return searchResults;
  } catch (error) {
    console.error("Error searching on HiAnime:", title, error?.message);
    return [];
  }
}

module.exports = { searchOnZoro };
