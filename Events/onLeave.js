const config = require('../Managers/configManager')();
const discord = require("discord.js");
const {color, version, footerIcon, footerText} = require("../Configs/botconfig.json");


module.exports = {
    name: "guildMemberRemove",
    execute: async (bot) => {
        bot.on('guildMemberRemove', (user) => {
            bot.channels.cache.forEach(channel=>{
                if(channel.name) if(channel.name.indexOf(`register-${user.id}`) > -1) channel.delete()
            })

        })
    }
}

function announceLeave(guildMember){
    let dateJoined = guildMember.joinedAt
    let diff = Date.now() - dateJoined
    let final = parseInt(diff)/86400000

    const leaveChannel = guildMember.guild.channels.cache.get(config.leavesChannelId)
    let leaveEmbed =  new discord.MessageEmbed()
        .setAuthor(guildMember.user.tag,guildMember.user.displayAvatarURL())
        .setColor(color)
        .setDescription(`**User: ** ${guildMember.user.tag}\nHas left the server\n\n**He was in the server for: ** ${final.toFixed(0)} days`)
        .setFooter(version)
        .setTimestamp();
     leaveChannel.send(leaveEmbed)
}
