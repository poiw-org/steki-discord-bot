const { MongoClient } = require("mongodb");
const {mongo_url} = require('../Configs/botconfig.json')


dotenv.config()
const client = new MongoClient(mongo_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});



module.exports = client