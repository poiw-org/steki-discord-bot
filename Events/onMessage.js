const {smtp_password,salt, mailgun_apitok} = require('../Configs/botconfig.json')
const discord = require('discord.js')
const config = require('../Managers/configManager')()
const {SMTPClient} = require("emailjs")
const error = require('../Utils/error')
const path = require('path')
const request = require(`request`);
const fs = require(`fs`);
const emojis = require('../Configs/emojis.json')
const {sha256} = require("hash.js")
const { customAlphabet } = require('nanoid/async')
const nanoid = customAlphabet('1234567890', 6)
const mongo = require("../Classes/Database")
const botLogs = require("../Utils/botLogs")
let db = mongo.db("steki")
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

var mailgun = require('mailgun-js')({
    apiKey: mailgun_apitok,
    domain: 'poiw.org',
    host: "api.eu.mailgun.net"
});

module.exports = {
    name: "message",
    execute: async(bot) => {
        bot.on('message', async (msg, user) => {
            await mongo.connect();
            let channel = msg.channel;
            if(channel.id == "939180081857839174"){
                let author = msg.guild.members.cache.get(msg.author.id)
                if(author._roles.includes("886976948172124160")){
                    if(msg.content.startsWith("addEmail")){
                        msg.delete()
                        let _message = msg.content.split(" ");

                        if(_message.length !== 2) return botLogs(bot, "Εντολή addEmail: προσθέτει ένα email στην db με hashed μορφή. Χρήση: ```addEmail th00000@edu.hmu.gr```");

                        let hashedEmail = sha256().update(_message[1]).digest('hex')
                        let exists = await db.collection("usedEmails").findOne({email: hashedEmail})
                        if(exists) return botLogs(bot, `Αυτό το email υπάρχει ήδη στην db.`)

                        await mongo.db("steki").collection("usedEmails").insertOne({
                            email: hashedEmail
                        })

                        botLogs(bot, `Το email \`Hash: ${hashedEmail}\` προστέθηκε στην db.`)
                    }

                    if(msg.content.startsWith("removeEmail")){
                        msg.delete()
                        let _message = msg.content.split(" ");

                        if(_message.length !== 2) return botLogs(bot, "Εντολή removeEmail: αφαιρεί ένα email από την db. Χρήση: ```removeEmail th00000@edu.hmu.gr```");

                        let hashedEmail = sha256().update(_message[1]).digest('hex')
                        let exists = await db.collection("usedEmails").findOne({email: hashedEmail})
                        if(!exists) return botLogs(bot, `Αυτό το email δεν υπάρχει στην db.`)

                        await mongo.db("steki").collection("usedEmails").deleteOne({
                            email: hashedEmail
                        })

                        botLogs(bot, `Το email \`Hash: ${hashedEmail}\` αφαιρέθηκε από την db.`)
                    }

                    if(msg.content.startsWith("removeHash")){
                        msg.delete()
                        let _message = msg.content.split(" ");

                        if(_message.length !== 2) return botLogs(bot, "Εντολή removeHash: αφαιρεί ένα hash από την db. Χρήση: ```removeHash d4f92d348254ca39fd4d85400194acce59ae294eab802ef7befd9b5fd2e3d28b```");

                        let exists = await db.collection("usedEmails").findOne({email: _message[1]})
                        if(!exists) return botLogs(bot, `Αυτό το hash δεν υπάρχει στην db.`)

                        await mongo.db("steki").collection("usedEmails").deleteOne({email: _message[1]})

                        botLogs(bot, `Το hash \`Hash: ${_message[1]}\` αφαιρέθηκε από την db.`)
                    }
                }
            }

            if(msg.channel.name === `register-${msg.author.id}`){
                const verificationCode = await nanoid();

                let registration = await db.collection("activeRegistrations").findOne({
                    user: msg.author.id
                })

                if(!registration) registration = {
                    user: msg.author.id,
                    step: "sendEmail"
                }

                switch (registration.step){
                    case "sendEmail":
                                let tester = new RegExp("th[0-9]+@edu.hmu.gr$");
                                if(tester.test(msg.content)) {
                                    let hashedEmail = sha256().update(msg.content).digest('hex')

                                    botLogs(bot, `Ο χρήστης <@${msg.author.id}> έστειλε το εξής mail για εγγραφή: \`\`\`Hash: ${hashedEmail}\`\`\``)

                                    let exists = await db.collection("usedEmails").findOne({email: hashedEmail})
                                    if(exists){
                                        botLogs(bot, `Το ${msg.content} έχει ήδη χρησιμοποιηθεί για εγγραφή. Αναγνωριστικό για αφαίρεση απο db: \`\`\`${hashedEmail}\`\`\``)
                                        channel.send(`Αυτό το email έχει ήδη χρησιμοποιηθεί για εγγραφή στο Steki. Αν θεωρείς ότι έχει γίνει κάποιο λάθος, στείλε ένα μήνυμα στο <#939177847933780018>. \n\`Αναγνωριστικό Email: ${hashedEmail}\``);
                                        return;
                                    }
                                    channel.send("Δώσε μου μισό λεπτάκι...")


                                    await mailgun.messages().send({
                                        from: 'Steki <steki@poiw.org>',
                                        to: msg.content,
                                        subject: 'Εγγραφή στο Steki',
                                        text: `Ο κωδικός εγγραφής σου στο Steki είναι: ${verificationCode}\n\nΜΗΝ ΤΟ ΔΩΣΕΙΣ ΣΕ ΚΑΝΕΝΑ ΑΛΛΟ ΦΟΙΤΗΤΗ/ΙΑ, ΦΙΛΟ/Η ΣΟΥ, ΜΕΛΟΣ ΔΕΠ Ή ΓΕΝΙΚΑ ΟΠΟΙΟΔΗΠΟΤΕ ΑΛΛΟ ΣΥΣΤΗΜΑ, ΠΕΡΑ ΑΠΟ ΤΟ STEKIBOT ΣΤΗ ΔΙΑΔΙΚΑΣΙΑ ΕΓΓΡΑΦΗΣ!`
                                    },
                                    async function (err, message) {
                                        if(err){
                                            console.log(err);
                                            channel.send("Υπήρξε ένα σφάλμα. Παρακαλώ προσπάθησε αργότερα...");
                                            botLogs(bot, `Κατά την αποστολή email στον <@${msg.author.id}> προέκυψε σφάλμα το. Now the fun begins...\n \`\`\`${err}\`\`\``)
                                            return;
                                        }
                                        registration.step = "verifyEmail";
                                        registration.email = msg.content;
                                        registration.encryptedVerificationCode = sha256().update((verificationCode+salt).toString()).digest('hex');
                                        await updateRegistration(registration);

                                        channel.send("Τέλεια! Τσέκαρε τα εισερχόμενά σου για ένα μήνυμα με θέμα *\"Εγγραφή στο Steki\"*");
                                        botLogs(bot, `Ο χρήστης <@${msg.author.id}> έλαβε στο inbox του τον κωδικό εγγραφής \`\`\`Hash: ${registration.encryptedVerificationCode}\`\`\` .`)
                                        setTimeout(()=>channel.send("Όταν το λάβεις, στείλε μου τον κωδικό εγγραφής εδώ."),500)
                                    });


                                }else{
                                    botLogs(bot, `Ο χρήστης <@${msg.author.id}> έστειλε κάτι το οποίο δεν μοιάζει με email από το ΗΜΜΥ.`)
                                    channel.send(":see_no_evil: Αυτό που μου έστειλες δεν μοιάζει με φοιτητικό email από το H.M.M.Y. ΕΛ.ΜΕ.ΠΑ.")
                                    setTimeout(()=>channel.send("Ένα ακαδημαϊκό, φοιτητικό email έχει την μορφή thXXXXX@edu.hmu.gr. Αν είσαι πρωτοετής και δεν έχεις γραφτεί στη γραμματεία ακόμη, ολοκλήρωσε την εγγραφή σου και εγώ θα σε περιμένω εδώ για να μου στείλεις το ακαδημαϊκό σου email!"),2000)
                                }
                                break;

                    case "verifyEmail":
                        if(registration.encryptedVerificationCode && sha256().update(msg.content+salt).digest('hex') === registration.encryptedVerificationCode){
                            if(registration.email){
                                mongo.db("steki").collection("usedEmails").insertOne({
                                    email: sha256().update(registration.email).digest('hex')
                                })
                            }
                            let {guild} = msg;
                            let member = guild.members.cache.get(msg.author.id);

                            member.roles.add("886993717725102103")
                            await completeRegistration(channel, registration)
                            botLogs(bot, `Ο χρήστης <@${msg.author.id}> ολοκλήρωσε με επιτυχία την εγγραφή του.`)



                        }else{
                            if(registration.failedAttempts > 2 || ! registration.encryptedVerificationCode){
                                delete registration.encryptedVerificationCode;
                                delete registration.failedAttempts
                                await updateRegistration(registration)
                                botLogs(bot, `Ο χρήστης <@${msg.author.id}> έβαλε 4 φορές λάθος κωδικό εγγραφής. Η διαδικασία πρέπει να επανακινηθεί.`)
                                channel.send("Για λόγους ασφαλείας ο κωδικός εγγραφής σου έχει καταστραφεί. Παρακαλώ επανεκκίνησε τη διαδικασία, πατώντας το :arrows_counterclockwise: που βρίσκεται παραπάνω.")
                                return;
                            }
                            channel.send("Χμμμ... Αυτή δεν ήταν η απάντηση που περίμενα. Χρειάζομαι *μόνο* τον 6-ψήφιο κωδικό εγγραφής που αναγράφει το mail :woozy_face:.")
                            channel.send("*Ενημέρωση από την Ομάδα Διαχείρισης, λόγω πρόσφατων συμβάντων:*\n```Οποιαδήποτε προσπάθεια tampering με το bot (reverse engineering, pen-testing κλπ) καταγράφεται, ενώ επαναλλαμβανόμενοι παραβάτες θα γίνονται ban από τον σέρβερ οριστικά.```")
                            registration.failedAttempts = registration.failedAttempts + 1 || 1
                            await updateRegistration(registration)
                        }
                }

            }
            // parseMiddleware(msg,bot)
            // let message = msg.content
            // if(!message.startsWith(prefix)) return
            // let args = message.slice(prefix.length).trim().split(' ')
            // let cmdName = args.shift().toLowerCase()
            // let commandToExecute = bot.commands.get(cmdName) || Array.from(bot.commands.values()).find(cmdFile => cmdFile.aliases && cmdFile.aliases.map(alias => alias.toLowerCase()).includes(cmdName.toLowerCase()))
            // if(commandToExecute){
            //     msg.delete()
            //     let permissions = db.has("Permissions") ? db.get("Permissions") : {}
            //     if(!permissions[msg.author.id]){
            //         db.set(`Permissions.${msg.author.id}`,{perm:1})
            //     }
            //     let userPerm = db.has(`Permissions.${msg.author.id}`) ? db.get(`Permissions.${msg.author.id}`).perm : 1
            //     if(userPerm >=  commandToExecute.permission){
            //         commandToExecute.execute(bot,msg,args)
            //     }else{
            //         error.send(bot,msg.channel,"You dont have permission to do that")
            //     }
            // }
        })
    }
}

const updateRegistration = async (registration) => {
    if(registration._id){
        await db.collection("activeRegistrations").updateOne({_id: registration._id}, {$set: {...registration}})
    }else{
        await db.collection("activeRegistrations").insertOne(registration)
    }
}

let completeRegistration = async (channel, registration) => {
    try {
        channel.delete()
        await db.collection("activeRegistrations").deleteOne({_id: registration._id})
    }catch (e) {
        console.log(e)
    }
}
