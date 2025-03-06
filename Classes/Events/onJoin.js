const config = require('../Managers/configManager')();
const discord = require("discord.js");
const emojis = require('../Configs/emojis.json');
const {sendMessageForm} = require("../Managers/embedCreator");
const fetcher = require("../Configs/fetchMessages.json");
const { config } = require('../../Utils/environmentUtils');
const {color, version, footerIcon, footerText} = config;
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

                channel.send(`**Γειά σου ${user}, καλωσόρισες στο Steki!** \n Για να διασφαλίσουμε την εχεμύθεια και την αποκλειστικότητα του σέρβερ προς τους φοιτητές και φοιτήτριες του H.M.M.Y. ΕΛ.ΜΕ.ΠΑ., θα χρειαστεί να επιβεβαιώσουμε την φοιτητική σου ιδιότητα.\n\nΕίναι πολύ απλό: \n **Θα σου στείλω έναν κωδικό στο ακαδημαϊκό σου email και εσύ θα πρέπει να μου τον γράψεις εδώ.**`);
                setTimeout(()=>channel.send("Αν κολλήσεις σε κάποιο απο τα βήματα (βάλεις λάθος ακαδημαϊκό email, δεν λαμβάνεις κωδικό κλπ.) μπορείς να πατήσεις το :arrows_counterclockwise: κάτω από αυτό το μήνυμα και θα ξανα-αρχίσουμε τη διαδικασία από την αρχή. Εναλλακτικά, στείλε στο <#939177847933780018>\nΤο email σου θα αποθηκευτεί σε κρυπτογραφημένη βάση δεδομένων μας, για να σιγουρευτούμε ότι κανένας άλλος δεν θα μπορέσει να το χρησιμοποιήσει για να μπεί στον σέρβερ. Χάρη στη μαγεία του :sparkles: hashing :sparkles:, δεν θα μπορούμε να διαβάσουμε το email σου απο το αρχείο μας, μόνο να βεβαιώσουμε ότι υπάρχει/δεν υπάρχει εκεί.").then(message=>message.react("🔄")),1000)
                setTimeout(()=>channel.send(`**Για να συνεχίσουμε, στείλε μου εδώ το ακαδημαϊκό σου email. Θα πρέπει να είναι της μορφής *thXXXXXX@edu.hmu.gr* (αυτό που σου έδωσε η γραμματεία κατά την εγγραφή)**.`),2000);
            })


            // guildMember.roles.add(config.defaultRole)
            // welcomeEmbed.setup(bot,guildMember)
        })
    }
}
