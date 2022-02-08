const discord = require("discord.js");
const botLogs = require("../Utils/botLogs")

module.exports = {
    name: "messageDelete",
    execute: async (bot) => {
        bot.on('messageDelete', async (message) => {
            //Stop commands
            let channel = message.channel;
            let deletedContent = message.content;
            //Code to find who deleted the message
            const fetchedLogs = await message.guild.fetchAuditLogs({
                type: 'MESSAGE_DELETE'
            }).catch(() => ({
                entries: []
            }));
            const auditEntry = fetchedLogs.entries.find(a =>
                a.target.id === message.author.id &&
                a.extra.channel.id === message.channel.id &&
                Date.now() - a.createdTimestamp < 20000
            );

            const executor = auditEntry && auditEntry.executor ? message.guild.members.cache.get(auditEntry.executor.id) : message.member;
            
            botLogs(bot, `Ο χρήστης ${typeof executor === "string" ? executor : executor.user} διέγραψε από το κανάλι ${channel} αυτό το μήνυμα:\n\`\`\`${deletedContent}\`\`\``)

        })
    }
}