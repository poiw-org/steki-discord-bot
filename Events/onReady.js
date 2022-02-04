const discord = require('discord.js')
const fetchMessages = require('../Managers/MessageFetcher')
const embedSetupSupport = require('../EmbedSetups/supportChatEmbedSetup')
const embedSetupBeta = require('../EmbedSetups/betatestChatEmbedSetup')
// const saffron = require("@poiw/saffron")
const schedule = require('node-schedule');
const config = require("../Configs/botconfig.json")
const {NodeHtmlMarkdown} =  require("node-html-markdown")
const truncate = require('truncate');
const activities = [
    "dead",
    "with your academic data",
    "\"Pistevw pws tha perasw mageiropoulo\" Simulator 2022",
    "pws kanw print stin python?",
    "--insert funny joke here--",
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

            // schedule.scheduleJob('0 10 * * 6', function(){
            //     bot.channels.fetch("887068592363950100").then(channel=>{
            //         // channel.send("Σήμερον η διάθεση είναι: γενική φασίνα στο σπίτι, ακούγοντας τα κλαμπατσίμπανα της βλαχάρας στο <#894205634482954270>. Εμπρός! (*ΣΑΑΑΚΗΗΗΗΗΗΗΗΗΗΗΗΗΗ*)")
            //     })
            //   });
            
            // schedule.scheduleJob('0 18 * * 1,3,5', function(){
            //     bot.channels.fetch("887068592363950100").then(channel=>{
            //             channel.send("Είναι ήδη έξι το βράδυ και ώρα να στροθούμε στο διάβασμα! Το πτυχίο δεν λαμβάνεται δια μέσω βαρεμάρας φίλτατοι. Σι γιού ατ <#887342520651087973> μπίτσεζ... :wink: ")
            //     })
            //   });

                // await saffron.initialize({ 
                //     mode: "main",
                //     database:{
                //         driver: "mongodb",
                //         config: {
                //             url: config.saffron_db, // The mongodb url
                //           }
                //     },
                //     scheduler: {
                //         intervalBetweenJobs: 1000,
                //         heavyJobFailureInterval: 120000,
                //     },
                //     sources:{
                //         "path": "/sources",
                //         "excluded": []
                //       }
                // })
                
                // await saffron.start()

                // saffron.on("workers.articles.new", async articles => {
                //     for(let article of articles){
                //         article.content = NodeHtmlMarkdown.translate(article.content.trim());
                //         config.secretary_channels[article.source.name].forEach(channel=>{
                //             bot.channels.fetch(channel).then(channel=>{
                //                 channel.send(`**${article.title}**\n\n${truncate(article.content,1000)}\n\n**Διάβασε την ανακοίνωση εδώ: ${article.link}**`)
                //             })
                //         })
                //     }
                //     return articles
                // })
   

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

