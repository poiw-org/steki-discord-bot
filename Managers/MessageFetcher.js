const messages = require(`../Configs/fetchMessages.json`)



module.exports.fetch = async function (bot) {
    //PreSet Messages


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
    let promises = [].concat.apply([], [fetchMessagesPromises]);
    return Promise.all(promises)
}

async function fetch(channelID,messageID,bot){
  let channel = await bot.channels.fetch(channelID).catch(e=>{});
  if(!channel) return 0
  let message = await channel.messages.fetch(messageID).catch(e=>{});
  if(!message) return 0;
  return  1
}