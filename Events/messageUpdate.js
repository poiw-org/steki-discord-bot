const {logsChannelId} = require('../Managers/configManager')();
const discord = require('discord.js')
const emojis = require('../Configs/emojis.json');
const botLogs = require("../Utils/botLogs")


module.exports = {
    name: "messageUpdate",
    execute: async (bot) => {
        bot.on('messageUpdate', async (oldMessage, newMessage) => {
            if(!oldMessage || !newMessage || oldMessage.author.bot || !oldMessage.content || !newMessage.content) return
            botLogs(bot, `Ο χρήστης ${newMessage.author} επεξεργάστηκε στο κανάλι ${oldMessage.channel} αυτό το μήνυμα:\n\`\`\`${oldMessage.content}\`\`\`*και η νέα έκδοσή του είναι:*\`\`\`${newMessage.content}\`\`\``)
        })
    }
}