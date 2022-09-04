process.env.GOOGLE_APPLICATION_CREDENTIALS = "./gkeys.json"

const Sentry = require("@sentry/node");
// or use es6 import statements
// import * as Sentry from '@sentry/node';

const Tracing = require("@sentry/tracing");
// or use es6 import statements
// import * as Tracing from '@sentry/tracing';

Sentry.init({
    dsn: "https://bd2cb88a443f4de3835c348b91fdfcf5@o350531.ingest.sentry.io/5975518",

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
});

const discord = require('discord.js')
const client = new discord.Client({
    intents: [discord.Intents.FLAGS.GUILDS, discord.Intents.FLAGS.GUILD_MESSAGES, discord.Intents.FLAGS.DIRECT_MESSAGES, discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS, discord.Intents.FLAGS.GUILD_MEMBERS, discord.Intents.FLAGS.GUILD_VOICE_STATES]
})
const {prefix,devToken,token} = require('./Configs/botconfig.json')
const commandHandler = require('./Managers/commandHandler')
const eventHandler = require('./Managers/eventHandler')

const env = process.env.NODE_ENV ? process.env.NODE_ENV.toString().trim() : "development"
const runToken = env === "development" ? devToken : token



//Collections
client.commands = new discord.Collection();
client.events = new discord.Collection();

//Handlers
//todo handle it with error Handler
commandHandler.run(client).catch(e => {console.log(e)});
eventHandler.run(client).catch(e => { console.log(e)});




client.login(runToken).then (() => {
    console.log('Login accepted.')
}).catch(err => {
    console.log(`Error ${err}`)
})