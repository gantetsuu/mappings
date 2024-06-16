const anilistUrl = process.env.ANILIST_URL || "https://graphql.anilist.co";
const axios = require("axios");
async function fetchTitles(id) {
  try {
    const { data } = await axios.post(anilistUrl, {
      query: `
          query media($id: Int, $type: MediaType, $isAdult: Boolean) {
            Media(id: $id, type: $type, isAdult: $isAdult) {
              title {
                romaji
                english
              }
              seasonYear
              format
            }
          }
        `,
      variables: {
        id: id,
        type: "ANIME",
        isAdult: false,
      },
    });
    const title = data?.data?.Media?.title;
    const seasonYear = data?.data?.Media?.seasonYear;
    function cleanTitle(t) {
      return t?.replace(/[^a-zA-Z0-9-]/g, " ");
    }
    function removeYear(t) {
      return t?.replace(/\s*\(\d{4}\)$/, "");
    }
    return [
      cleanTitle(`${title?.romaji} ${seasonYear}`),
      cleanTitle(`${title?.english} ${seasonYear}`),
      cleanTitle(removeYear(title?.english)),
      cleanTitle(removeYear(title?.romaji)),
    ];
  } catch (error) {
    console.error("Error fetching anime info:", error);
    throw error;
  }
}
module.exports = { fetchTitles };
