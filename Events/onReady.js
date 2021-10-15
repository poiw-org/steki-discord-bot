const discord = require('discord.js')
const fetchMessages = require('../Managers/MessageFetcher')
const embedSetupSupport = require('../EmbedSetups/supportChatEmbedSetup')
const embedSetupBeta = require('../EmbedSetups/betatestChatEmbedSetup')

const schedule = require('node-schedule');


const activities = [
    "dead",
    "with your data",
    "tavli kai mpiriba vre adelfe"
]

module.exports = {
    name: "ready",
    execute: async (bot) => {
        bot.on('ready', async () => {
            
            fetchMessages.fetch(bot).then(fetchedMessages =>{
                let loaded = fetchedMessages.reduce((a, b) => a + b, 0)
                console.log(`Successfully fetched ${loaded} Messages`)
                embedSetupSupport.setup(bot)
                embedSetupBeta.setup(bot)
            })
            
   
            // Προωθήσεις: 887068592363950100
            // System: 887044231963770901
            schedule.scheduleJob('0 10 * * 6', function(){
                bot.channels.fetch("887068592363950100").then(channel=>{
                        channel.send("Ξημέρωσε Σάββατο, τι όμορφη ημέρα! Λεω να εισέλθω εις το γραφείο μου και να το απολυμάνω με μπενταντίν. Σας συνιστώ να πράξετε ομοίως στο δωμάτιο σας, το οποίο είμαι σίγουρος πως έχει να ξεσκονισθεί από την ημέρα που πρώτο μπήκατε σε αυτό.\nΗ βλαχάρα <@887331122160230451> ως συνήθως ακούει αυτές τις αποτρόπαιες και σατανικές χαζομάρες στο <#894205634482954270>. Αχ, πότε θα έρθει εκείνη η ημέρα που θα ξεκουμπιστεί από το σπίτι να με αφήσει ήσυχο ;!")
                })
              });
            
            schedule.scheduleJob('0 18 * * 1,3,5', function(){
                bot.channels.fetch("887068592363950100").then(channel=>{
                        channel.send("Είναι ήδη έξι και γλυκοχαράζει η νύχτα! Άκουσα πως η δεσποινίς <@887341904830795878> εκπέμπει διά μέσω του καναλιού <#887342520651087973> άκρως χαλαρωτική και γαλήνια μουσική! Θα συντονισθώ και εγώ έως ότου νυχτώσει, καθώς μελετώ και τελειώνω μερικές σελίδες από το σύγγραμμα μου.")
                })
              });

            bot.channels.fetch("886981920108478526").then(channel=>{
                setInterval(() => {
                    const index = Math.floor(Math.random() * (activities.length - 1) + 1)
                    bot.user.setActivity(activities[index])

                    try{
                        bot.channels.cache.forEach(channel=>{
                            if(channel.name) if(channel.name.indexOf("register") > -1){
                                let userId = channel.name.split("-")[1]
                                bot.users.fetch(userId)
                                .then(user=>{
                                    user.send("🆘 Το Steki για εσένα τώρα φαίνεται κενό και αυτό είναι γιατί δεν έχεις γραφτεί.\n" +
                                    "\n" +
                                    `ℹ️ Για να ολοκληρώσεις την εγγραφή σου στο Steki, μπές εδώ → ${channel}!\n` +
                                    "\n" +
                                    "💁🏻 Αν αντιμετωπίζεις κάποιο πρόβλημα ή δεν ξέρεις τι να κάνεις, στείλε σε ένα από αυτά τα άτομα  → <@458700490348429322> , <@690205775448244301>" +
                                    "\n" +
                                    "Έχε υπόψη ότι είμαι απλά ένα πρόγραμμα. Με έχουν προγραμματίσει να σε σπαμάρω μέχρι να γραφτείς στον σέρβερ. Αν θες να σταματήσω, δεν έχεις παρά να βγείς από τον σέρβερ, πατώντας δεξί κλικ (ή παρατεταμένα πάνω) στο εικονίδιο του σέρβερ και \"Leave Server\"")
                                })
        
                            }
                        });
                    }catch(e){
                        console.error(e)
                    }

                }, 1200000)
            })

        })
    }
}

