module.exports = (bot, message) => {
    try{
        bot.channels.cache.get("939180081857839174").send(message);
    }catch(e){
        console.log(e);
    }
}