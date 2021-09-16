const discord = require('discord.js')
const fetchMessages = require('../Managers/MessageFetcher')
let Ticket = require("../Classes/Ticket.js")
let Application = require("../Classes/Application")
const emojis = require('../Configs/emojis.json')
const {prefix,footerText,footerIcon,color,version} = require('../Configs/botconfig.json')


const config =  require('../Managers/configManager')()
const db = require('quick.db');


module.exports = {
    name: "messageReactionAdd",
    execute: async (bot) => {
        bot.on('messageReactionAdd',(reaction,user) => {
            let {guild} = reaction.message;
            let member = guild.members.cache.get(user.id);
            let emoji = reaction._emoji.name

            if(reaction.message.channel.id == "886981920108478526"){
                        switch (emoji) {
                            case '🖥️':
                                member.roles.add("886993717725102103")
                                break;
                            case '🤖':
                                member.roles.add("887198468421083136")
                                break;
                            case '⚙️':
                                member.roles.add("887198536360419348")
                                break;
                            case '⚖️':
                                member.roles.add("887198604027101284")
                                break;
                            case '🌱':
                                member.roles.add("887198628899356683")
                                break;
                            case '💉':
                                member.roles.add("887198656837591041")
                                break;
                            case '🎶':
                                member.roles.add("887200015825641542")
                                break;
                            case '💼':
                                member.roles.add("887198689372815410")
                                break;
                            case '✈️':
                                member.roles.add("887198713628483664")
                                break;
                            case '🍎':
                                member.roles.add("887198734209925141")
                                break;
                            case '💸':
                                member.roles.add("887198782255661086")
                                break;
                            default:
                                break;
                            }
                            reaction.message.reactions.cache.get(emoji).users.remove(user);
        }
        })
    }
}
