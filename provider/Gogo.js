const gogoUrl = process.env.GOGO_URL || "https://anitaku.pe";
const axios = require("axios");
const { load } = require("cheerio");
async function searchOnGoGo(title, year, format) {
  try {
    const searchUrl = `${gogoUrl}/search.html?keyword=${title}`;

    const { data } = await axios.get(searchUrl);
    const $ = load(data);
    const searchResults = [];

    $("ul.items li").each((index, element) => {
      const name = $(element).find("p.name a").text();

      const released = $(element)
        .find("p.released")
        .text()
        .trim()
        .replace("Released: ", "");
      const href = $(element)
        ?.find("p.name a")
        ?.attr("href")
        ?.replace("/category/", "");
      if (href?.toLowerCase()?.includes("-dub")) {
        return;
      }
      searchResults.push({ name, released, slug: href, matcher: href });
    });

    return searchResults;
  } catch (error) {
    console.error("Error searching on GoGoAnime:", title, error?.message);
    return [];
  }
}
module.exports = { searchOnGoGo };
