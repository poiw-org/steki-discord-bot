const discord = require("discord.js");
const {
  footerText,
  footerIcon,
  color,
  version,
} = require("../Configs/botconfig.json");
const emojis = require("../Configs/emojis.json");

const footerText = process.env.FOOTER_TEXT;
const footerIcon = process.env.FOOTER_ICON;
const color = process.env.COLOR;
const version = process.env.VERSION;

module.exports = {
  send: async (bot, channel, message, time = 0) => {
    let errorEmoji = bot.emojis.resolve(emojis["error"]);
    let error = new discord.MessageEmbed()
      .setColor(color)
      .setDescription(`${errorEmoji} ${message}`)
      .setFooter(footerText.replace("%version%", version))
      .setTimestamp();
    channel
      .send(error)
      .then((msg) => {
        if (time > 0) msg.delete(time);
      })
      .catch((e) => {
        //todo handle error with an error handler
      });
  },
};
