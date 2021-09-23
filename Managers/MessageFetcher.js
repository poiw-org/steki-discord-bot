const messages = require(`../Configs/fetchMessages.json`)
const db = require('quick.db');
const {log} = require("nodemon/lib/utils");



module.exports.fetch = async function (bot) {
    //PreSet Messages
    let tickets = db.has("Tickets") ? db.get("Tickets") : []
    let applications = db.has("Applications") ? db.get("Applications") : []


    let fetchMessagesPromises = messages.map(message =>fetch(message["channelID"],message["messageID"],bot))
    let registrationChannels = bot.channels.cache.filter(channel=>channel.name.includes("register"))
    await registrationChannels.map(async channel=>{
        await bot.channels.fetch(channel.id).then(async channel=>{
            await channel.messages.fetch({limit: 20}).then(async messages=>{
                await messages.map(async message=>{
                    await message.reactions.cache.filter(async reaction=> {
                        await reaction.users.fetch({limit: 20}).then(users=>{
                            users.map(user=>{
                                if(user.bot){
                                    fetchMessagesPromises = [].concat.apply([],[fetchMessagesPromises, [fetch(channel.id,message.id,bot)]])

                                }
                            })
                        })
                    })
                })
            })
        })
    })
    let ticketPromises = tickets.map(ticket => fetch(ticket["channelID"],ticket["initialMessageID"],bot))
    let applicationPromises = applications.map(ticket => fetch(ticket["channelID"],ticket["initialMessageID"],bot))
    let applicationAcceptPromises = applications.map(ticket => fetch(ticket["channelID"],ticket["acceptMessageID"],bot))
    console.log(fetchMessagesPromises)
    let promises = [].concat.apply([], [ticketPromises,fetchMessagesPromises,applicationPromises,applicationAcceptPromises]);
    return Promise.all(promises)
}

async function fetch(channelID,messageID,bot){
  let channel = await bot.channels.fetch(channelID).catch(e=>{});
  if(!channel) return 0
  let message = await channel.messages.fetch(messageID).catch(e=>{});
  if(!message) return 0;
  return  1
}