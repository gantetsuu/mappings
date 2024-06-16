const gogoUrl = process.env.GOGO_URL || "https://anitaku.so";
const axios = require("axios");
const cheerio = require("cheerio");
const gogoTypes = {
  TV: "1",
  MOVIE: "3",
  OVA: "2",
  SPECIAL: "2",
  MUSIC: "32",
  ONA: "30",
};
async function searchOnGoGo(title, year, format) {
  try {
    const searchUrl = `${gogoUrl}/search.html?keyword=${title}`;

    const { data } = await axios.get(searchUrl);
    const $ = cheerio.load(data);
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
      searchResults.push({ name, released, href });
    });

    return searchResults;
  } catch (error) {
    console.error("Error searching on GoGoAnime:", error);
    throw error;
  }
}
module.exports = { searchOnGoGo };
