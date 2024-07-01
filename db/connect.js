const mongoose = require(`mongoose`);

const connectDB = async (uri) => {
  try {
    await mongoose.connect(uri);
  } catch (e) {
    console.log(e);
  }
};
module.exports = connectDB;