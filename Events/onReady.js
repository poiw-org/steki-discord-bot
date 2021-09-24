const discord = require('discord.js')
const fetchMessages = require('../Managers/MessageFetcher')
const embedSetupSupport = require('../EmbedSetups/supportChatEmbedSetup')
const embedSetupBeta = require('../EmbedSetups/betatestChatEmbedSetup')




const activities = [
    "dead",
    "with your data",
    "tavli kai mpiriba vre adelfe"
]

module.exports = {
    name: "ready",
    execute: async (bot) => {
        bot.on('ready', () => {
            fetchMessages.fetch(bot).then(fetchedMessages =>{
                let loaded = fetchedMessages.reduce((a, b) => a + b, 0)
                console.log(`Successfully fetched ${loaded} Messages`)
                embedSetupSupport.setup(bot)
                embedSetupBeta.setup(bot)
            })
            //SetupSupport message
            bot.channels.fetch("886981920108478526").then(channel=>{
                setInterval(() => {
                    const index = Math.floor(Math.random() * (activities.length - 1) + 1)
                    bot.user.setActivity(activities[index])

                    channel.send("Το Steki για εσένα τώρα φαίνεται κενό και αυτό είναι γιατί δεν έχεις γραφτεί.\n" +
                        "\n" +
                        "    Για να ολοκληρώσεις την εγγραφή σου στο Steki, βρες σε αυτό το κανάλι/δωμάτιο το μήνυμα που αναφέρει το όνομά σου στο Discord και πάτα στο κανάλι εγγραφής που σου δείχνει (#register-[τυχαίος αριθμός])!\n" +
                        "\n" +
                        "    Αν δεν βρίσκεις το μήνυμα μπορείς να πας στα κανάλια του Steki και να βρεις το κανάλι εγγραφής σου (αν είσαι από κινητό, σύρε από την αριστερή άκρη προς τη μέση του κινητού ή πάτα τις 3 οριζόντιες γραμμές πάνω αριστερά).\n" +
                        "\n" +
                        "Αν αντιμετωπίζεις κάποιο πρόβλημα ή δεν ξέρεις τι να κάνεις, στείλε σε ένα από αυτά τα άτομα  -> <@458700490348429322> , <@690205775448244301> , <@809804139513118781>")
                }, 60000)
            })

        })
    }
}

