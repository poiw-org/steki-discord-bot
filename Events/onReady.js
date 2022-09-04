const fetchMessages = require('../Managers/MessageFetcher')
const embedSetupSupport = require('../EmbedSetups/supportChatEmbedSetup')
const embedSetupBeta = require('../EmbedSetups/betatestChatEmbedSetup')
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
require('ffmpeg-inject');
const IceParser = require("../Utils/IceParser")

module.exports = {
    name: "ready",
    execute: async (bot) => {
        bot.on('ready', async () => {

            let fm1Channel = bot.channels.cache.get("1015948363197321309");
            playMusic(fm1Channel, "http://fm1.hmu.gr:8000/live", 200)
            fetchMessages.fetch(bot).then(fetchedMessages =>{
                let loaded = fetchedMessages.reduce((a, b) => a + b, 0)
                console.log(`Successfully fetched ${loaded} Messages`)
                embedSetupSupport.setup(bot)
                embedSetupBeta.setup(bot)
            })

            let i = 0
            let instance

            let getUsers = () => new Promise(resolve => {
                bot.guilds.cache.forEach(async guild => {
                    resolve(guild.roles.cache.get("886993717725102103").members.size)
                });
            })



            setInterval(async ()=>{
                if(instance) clearInterval(instance)

                if(i === 0) instance = setInterval(() => bot.user.setActivity(`Επεξεργασμένα μηνύματα: ${process.env.processedMessages || 0}`), 1000)
                else if(i === 1) bot.user.setActivity(`Μέλη στον σέρβερ: ${await getUsers()}`)
                else if(i === 2) instance = setInterval(() => bot.user.setActivity(`Κακόβουλα μηνύματα που έχουν μπλοκαριστεί: ${process.env.blockedMessages || 0}`), 1000)


                if(i < 2) i++
                else i = 0

            },10000)




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
                                    "💁🏻 Αν αντιμετωπίζεις κάποιο πρόβλημα ή δεν ξέρεις τι να κάνεις, στείλε στο <#939177847933780018>." +
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

function playMusic(channel, track, volume) {
    try{
        let radio = new IceParser(track);

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
        });


        const player = createAudioPlayer();
        connection.subscribe(player);
        radio.on("stream", stream => {
            let resource = createAudioResource(stream,{
                inlineVolume: true
            });
            resource.volume.setVolume(volume/100);
            player.play(resource)

        })
    }catch (e) {
        console.log(e)
    }

}