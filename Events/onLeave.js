const config = require('../Managers/configManager')();
const discord = require("discord.js");
const { config } = require('../Utils/environmentUtils');
const {color, version, footerIcon, footerText} = config;
const botLogs = require("../Utils/botLogs")


module.exports = {
    name: "guildMemberRemove",
    execute: async (bot) => {
        bot.on('guildMemberRemove', (user) => {
            let dateJoined = new Date(user.joinedAt).getTime();
            let diff = Date.now() - dateJoined;

            let final = parseInt(diff)/86400000;
        
            botLogs(bot, `Ο χρήστης *${user.user.username}* (<@${user.user.id}>) αποχώρησε απο τον σέρβερ. Ήταν στον σέρβερ για ${final.toFixed(2)} ημέρες.`)
            bot.channels.cache.forEach(channel=>{
                if(channel.name) if(channel.name.indexOf(`register-${user.id}`) > -1) channel.delete()
            })

        })
    }
}