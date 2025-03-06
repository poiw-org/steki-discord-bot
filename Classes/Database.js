const { MongoClient } = require("mongodb");
const { services } = require("../Utils/environmentUtils");
const mongo_url = services.mongoUrl;

const client = new MongoClient(mongo_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = client;
