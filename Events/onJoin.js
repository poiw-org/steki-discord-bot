const config = require('../Managers/configManager')();
const discord = require("discord.js");
const emojis = require('../Configs/emojis.json');
const {sendMessageForm} = require("../Managers/embedCreator");
const fetcher = require("../Configs/fetchMessages.json");
const {color, version, footerIcon, footerText} = require("../Configs/botconfig.json");
const welcomeEmbed = require('../EmbedSetups/welcomeEmbedSetup')
const {log} = require("nodemon/lib/utils");


module.exports = {
    name: "guildMemberAdd",
    execute: async (bot) => {
        bot.on('guildMemberAdd', (guildMember) => {

            let user = guildMember.user

            let channel = guildMember.guild.channels.create(`register-${guildMember.id}`, {
                    type: "text",
                    topic: `Ολοκλήρωσε την εγγραφή σου για να μπορέσεις να δείς όλα τα κανάλια στο Steki!`,
                    parent: "890021609631531009",
                    permissionOverwrites: [
                        {
                            id: guildMember.guild.roles.everyone,
                            deny: ["VIEW_CHANNEL"]
                        },
                        {
                            id: guildMember.id,
                            allow: ["VIEW_CHANNEL"]
                        },
                        {
                            id: "887348241350402138",
                            allow: ["VIEW_CHANNEL"]
                        },

                    ],
                })

            channel.then(async channel => {
                guildMember.guild.channels.cache.get("886981920108478526").send(`:wave: Γειά σου, ${user}! Πάτα εδώ για να γραφτείς στο Steki → ${channel}.`);
                guildMember.guild.members.cache.get(user.id).send(`:wave: Γειά σου, ${user}! Πάτα εδώ για να γραφτείς στο Steki → ${channel}.`);

                channel.send(`**Γειά σου ${user}, καλωσόρισες στο Steki!** \n Θα χρειαστεί να επιβεβαιώσουμε την φοιτητική σου ιδιότητα.\n\nΕίναι πολύ απλό: \n **Θα σου στείλω έναν κωδικό στο ακαδημαϊκό σου email και εσύ θα πρέπει να μου τον γράψεις εδώ.**`);
                setTimeout(()=>channel.send("Αν κολλήσεις σε κάποιο απο τα βήματα, μπορείς να κάνεις react με :arrows_counterclockwise: στο μήνυμα αυτό και θα αρχίσει η διαδικασία από την αρχή. Εναλλακτικά, στείλε στο <#939177847933780018>\n Το email σου θα ανωνυμοποιηθεί (θα μετατραπεί σε άχρηστη μορφή, βλ. sha256), για αποκλειστική χρήση στην παρούσα διαδικασία.").then(message=>message.react("🔄")),1000)
                setTimeout(()=>channel.send(`**Για να συνεχίσουμε, στείλε μου εδώ το ακαδημαϊκό σου email. Θα πρέπει να είναι της μορφής *thXXXXXX@edu.hmu.gr* (αυτό που σου έδωσε η γραμματεία κατά την εγγραφή)**. \n\n :new: Τώρα φοιτητές από εξωτερικά τμήματα (csd.uoc.gr) μπορούν να γραφτούν ως Verified Outsiders, χρησιμοποιώντας τα ακαδημαϊκά τους email.`),2000);
            })


            // guildMember.roles.add(config.defaultRole)
            // welcomeEmbed.setup(bot,guildMember)
        })
    }
}
