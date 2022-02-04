const discord = require('discord.js')
const fetchMessages = require('../Managers/MessageFetcher')
let Ticket = require("../Classes/Ticket.js")
let Application = require("../Classes/Application")
const emojis = require('../Configs/emojis.json')
const {prefix,footerText,footerIcon,color,version} = require('../Configs/botconfig.json')


const config =  require('../Managers/configManager')()
const mongo = require("../Classes/Database")
let db = mongo.db("steki")

const restartRegistration = async (channel, user) => {
    await channel.bulkDelete(100)
    await db.collection("activeRegistrations").deleteOne({user: user.id})
    channel.send(`**Γειά σου ${user}, καλωσόρισες στο Steki!** \n Για να διασφαλίσουμε την εχεμύθεια και την αποκλειστικότητα του σέρβερ προς τους φοιτητές και φοιτήτριες του ΕΛ.ΜΕ.ΠΑ., θα χρειαστεί να επιβεβαιώσουμε την φοιτητική σου ιδιότητα.\n\nΕίναι πολύ απλό: \n **Θα σου στείλω έναν κωδικό στο ακαδημαϊκό σου email και εσύ θα πρέπει να μου τον στείλεις πίσω.**`);
    setTimeout(()=>channel.send("Αν κολλήσεις σε κάποιο απο τα βήματα (βάλεις λάθος ακαδημαϊκό email, δεν λαμβάνεις κωδικό κλπ.) μπορείς να πατήσεις το :arrows_counterclockwise: κάτω από αυτό το μήνυμα και θα ξανα-αρχίσουμε τη διαδικασία από την αρχή. Εναλλακτικά, στείλε στο <#939177847933780018>.\nΤο email σου θα αποθηκευτεί σε κρυπτογραφημένη βάση δεδομένων μας, για να σιγουρευτούμε ότι κανένας άλλος δεν θα μπορέσει να το χρησιμοποιήσει για να μπεί στον σέρβερ. Χάρη στη μαγεία του :sparkles:hashing:sparkles:, δεν θα μπορούμε να διαβάσουμε το email σου απο το αρχείο μας, μόνο να βεβαιώσουμε ότι υπάρχει/δεν υπάρχει εκεί.").then(message=>message.react("🔄")),1000)
    setTimeout(()=>channel.send(`**Για να συνεχίσουμε, στείλε μου εδώ το ακαδημαϊκό σου email. Θα πρέπει να είναι της μορφής *thXXXXXX@edu.hmu.gr* (αυτό που σου έδωσε η γραμματεία κατά την εγγραφή)**.`),2000);

}

module.exports = {
    name: "messageReactionAdd",
    execute: async (bot) => {
        bot.on('messageReactionAdd',async (reaction,user) => {
            await mongo.connect();
            let {guild} = reaction.message;
            let member = guild.members.cache.get(user.id);
            let emoji = reaction._emoji.name

            if(reaction.message.channel.name === `register-${user.id}` && emoji === "🔄") await restartRegistration(reaction.message.channel, user);
            else if(reaction.message.channel.name === `register-${user.id}`){
                let registration = await db.collection("activeRegistrations").findOne({
                    user: user.id
                })
                        switch (emoji) {
                            case '🖥️':
                                member.roles.add("886993717725102103")
                                await completeRegistration(reaction.message.channel, registration)
                                break;
                            case '🤖':
                                member.roles.add("887198468421083136")
                                await completeRegistration(reaction.message.channel, registration)
                                break;
                            case '⚙️':
                                member.roles.add("887198536360419348")
                                await completeRegistration(reaction.message.channel, registration)
                                break;
                            case '👪':
                                member.roles.add("887198604027101284")
                                await completeRegistration(reaction.message.channel, registration)
                                break;
                            case '🌱':
                                member.roles.add("887198628899356683")
                                await completeRegistration(reaction.message.channel, registration)
                                break;
                            case '💉':
                                member.roles.add("887198656837591041")
                                await completeRegistration(reaction.message.channel, registration)
                                break;
                            case '🎶':
                                member.roles.add("887200015825641542")
                                await completeRegistration(reaction.message.channel, registration)
                                break;
                            case '💼':
                                member.roles.add("887198689372815410")
                                await completeRegistration(reaction.message.channel, registration)
                                break;
                            case '✈️':
                                member.roles.add("887198713628483664")
                                await completeRegistration(reaction.message.channel, registration)
                                break;
                            case '🍎':
                                member.roles.add("887198734209925141")
                                await completeRegistration(reaction.message.channel, registration)
                                break;
                            case '💸':
                                member.roles.add("887198782255661086")
                                await completeRegistration(reaction.message.channel, registration)
                                break;
                            default:
                                await reaction.message.reactions.cache.get(emoji).users.remove(user);
                                break;
                            }
        }
        })
    }
}

let completeRegistration = async (channel, registration) => {
    try {
        channel.delete()
        await db.collection("activeRegistrations").deleteOne({_id: registration._id})
    }catch (e) {
        console.log(e)
    }
}