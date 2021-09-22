const {smtp_password,salt} = require('../Configs/botconfig.json')
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

module.exports = {
    name: "message",
    execute: async(bot) => {
        bot.on('message', async (msg) => {
            let channel = msg.channel;
            if(msg.channel.name === `register-${msg.author.id}`){
                const verificationCode = await nanoid();
                let db = JSON.parse(msg.channel.topic)

                switch (db.step){
                    case "sendEmail":
                        let tester = new RegExp("^\\w+([-+.']\w+)*@edu.hmu.gr$");
                                if(tester.test(msg.content)) {
                                    channel.send("Δώσε μου μισό λεπτάκι...")
                                    const client = new SMTPClient({
                                        user: 'prism@poiw.org',
                                        password: smtp_password,
                                        host: 'mailer.poiw.org',
                                        ssl: true,
                                    });
                                    console.log(verificationCode)
                                    client.send(
                                        {
                                            text: `Ο κωδικός εγγραφής σου στο Steki είναι: ${verificationCode} \n\nΜΗΝ ΤΟ ΔΩΣΕΙΣ ΣΕ ΚΑΝΕΝΑ ΑΛΛΟ ΦΟΙΤΗΤΗ/ΙΑ, ΦΙΛΟ/Η ΣΟΥ, ΜΕΛΟΣ ΔΕΠ Ή ΓΕΝΙΚΑ ΟΠΟΙΟΔΗΠΟΤΕ ΑΛΛΟ ΣΥΣΤΗΜΑ, ΠΕΡΑ ΑΠΟ ΤΟ STEKIBOT ΣΤΗ ΔΙΑΔΙΚΑΣΙΑ ΕΓΓΡΑΦΗΣ!`,
                                            from: 'Steki <noreply@poiw.org>',
                                            to: `<${msg.content}>`,
                                            subject: 'Εγγραφή στο Steki',
                                        }, (err, message) => {
                                            if(err){
                                                channel.send("Υπήρξε ένα σφάλμα. Παρακαλώ προσπάθησε αργότερα...")
                                                return;
                                            }
                                            channel.edit({topic: `{"step": "verifyEmail", "encryptedVerificationCode": "${sha256().update((verificationCode+salt).toString()).digest('hex')}"}`})
                                            channel.send("Τέλεια! Τσέκαρε τα εισερχόμενά σου για ένα μήνυμα με θέμα *\"Εγγραφή στο Steki\"*");
                                            setTimeout(()=>channel.send("Όταν το λάβεις, στείλε μου τον κωδικό εγγραφής εδώ."),500)
                                        }
                                    );

                                }else{
                                    channel.send(":see_no_evil: Αυτό που μου έστειλες δεν μοιάζει με φοιτητικό email από το ΕΛ.ΜΕ.ΠΑ.")
                                    setTimeout(()=>channel.send("Ένα ακαδημαϊκό, φοιτητικό email έχει την μορφή XXXXX@edu.hmu.gr. Αν είσαι πρωτοετής και δεν έχεις γραφτεί στη γραμματεία ακόμη, ολοκλήρωσε την εγγραφή σου και εγώ θα σε περιμένω εδώ για να μου στείλεις το ακαδημαϊκό σου email!"),2000)
                                }
                                break;

                    case "verifyEmail":
                        console.log(sha256().update(msg.content+salt).digest('hex'), db.encryptedVerificationCode)
                        if(sha256().update(msg.content+salt).digest('hex') === db.encryptedVerificationCode){
                            channel.edit({topic: '{"step": "chooseDept"}'})
                                .then(()=>{
                                    channel.send(":star_struck:  Ε-ξαι-ρε-τι-κά! Και κάτι τελευταίο: \n\n:desktop:  Hλεκτρολόγων Μηχανικών και Μηχανικών Υπολογιστών (και συγχωνευμένα τμήματα ΤΕΙ) (**ΗΡΑΚΛΕΙΟ**) (ECE)\n" +
                                        "\n" +
                                        ":robot: Ηλεκτρονικών Μηχανικών (**ΧΑΝΙΑ**) (EE)\n" +
                                        "\n" +
                                        ":gear: Μηχανολόγων Μηχανικών (MECH)\n" +
                                        "\n" +
                                        ":scales: Κοινωνικής Εργασίας (SW)\n" +
                                        "\n" +
                                        ":seedling: Γεωπονίας (AGRO)\n" +
                                        "\n" +
                                        ":syringe: Νοσηλευτικής (NURS)\n" +
                                        "\n" +
                                        ":notes: Μουσικής Τεχνολογίας & Ακουστικής (MTA)\n" +
                                        "\n" +
                                        ":briefcase:  Διοικητικής Επιστήμης & Τεχνολογίας (MST)\n" +
                                        "\n" +
                                        ":airplane:  Διοίκησης Επιχειρήσεων & Τουρισμού (BAT)\n" +
                                        "\n" +
                                        ":apple: Επιστημών Διατροφής & Διαιτολογίας (NDA)\n" +
                                        "\n" +
                                        ":money_with_wings:  Λογιστικής και Χρηματοοικονομικής (ACCFIN)\n" +
                                        "\nΠάτα emoji που αντιστοιχεί στη σχολή σου:\n"
                                    )
                                        .then(message=>{
                                            message.react("🖥️")
                                            message.react("🤖")
                                            message.react("⚙️")
                                            message.react("⚖️")
                                            message.react("🌱")
                                            message.react("💉")
                                            message.react("💼")
                                            message.react("✈️")
                                            message.react("🍎")
                                            message.react("💸")
                                        })
                                })

                        }else{
                            channel.send("Χμμμ... Αυτή δεν ήταν η απάντηση που περίμενα. Δοκίμασε πάλι. Μην βάζεις emoji, κενά ή επιπλέον μπιχλιμπίδια στα μηνύματά σου μαζί μου. Θυμίσου: είμαι απλά ένας υπολογιστής και ο,τιδήποτε πέρα από την απάντηση που περιμένω με μπερδεύει...:woozy_face:")
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