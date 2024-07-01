const { default: mongoose } = require("mongoose");
const Schema = mongoose.Schema;

const mappingSchema = new Schema({
  anilist_id: { type: Number, required: true, unique: true },
  mal_id: { type: Number, required: true, unique: true },
  gogo: { type: String, default: null },
  gogo_dub: { type: String, default: null },
  zoro: { type: String, default: null },
  animepahe: { type: String, default: null },
  nine_anime: { type: String, default: null },
  title: String,
});

const Mapping = mongoose.model("Mapping", mappingSchema, "mappings");
module.exports = { Mapping };
