const {
  securityConfig,
  emailConfig,
  pebblehostConfig,
  urlConfig,
} = require("../Utils/environmentUtils");
const salt = securityConfig.salt;
const mailgun_apitok = emailConfig.mailgunApiToken;
const urls = urlConfig;
const pebblehost = pebblehostConfig;

const config = require("../Managers/configManager")();
const { sha256 } = require("hash.js");
const { customAlphabet } = require("nanoid/async");
const nanoid = customAlphabet("1234567890", 6);
const mongo = require("../Classes/Database");
const botLogs = require("../Utils/botLogs");
let db = mongo.db("steki");
let generalUtils = require("../Utils/generalUtils");
const pebblehostApi = require("../Utils/pebblehost");

var mailgun = require("mailgun-js")({
  apiKey: mailgun_apitok,
  domain: "poiw.org",
  host: "api.eu.mailgun.net",
});

let tester = new RegExp("th[0-9]+@edu.hmu.gr$");
let csdtester = new RegExp("csd[0-9]+@csd.uoc.gr$");

module.exports = {
  name: "message",
  execute: async (bot) => {
    await mongo.connect();

    bot.on("message", async (msg, user) => {
      process.env.processedMessages = process.env.processedMessages
        ? parseInt(process.env.processedMessages) + 1
        : 1;

      msg = await linkCheck(msg, bot).catch((e) => {
        console.log(e);
      });
      if (!msg) return;

      let channel = msg.channel;
      if (channel.id == "939180081857839174") {
        let author = msg.guild.members.cache.get(msg.author.id);
        if (author._roles.includes("886976948172124160")) {
          if (msg.content.startsWith("addEmail")) {
            msg.delete();
            let _message = msg.content.split(" ");

            if (_message.length !== 2)
              return botLogs(
                bot,
                "Εντολή addEmail: προσθέτει ένα email στην db με hashed μορφή. Χρήση: ```addEmail th00000@edu.hmu.gr```"
              );

            let hashedEmail = sha256().update(_message[1]).digest("hex");
            let exists = await db
              .collection("usedEmails")
              .findOne({ email: hashedEmail });
            if (exists)
              return botLogs(bot, `Αυτό το email υπάρχει ήδη στην db.`);

            await mongo.db("steki").collection("usedEmails").insertOne({
              email: hashedEmail,
            });

            botLogs(
              bot,
              `Το email \`Hash: ${hashedEmail}\` προστέθηκε στην db.`
            );
          }

          if (msg.content.startsWith("removeEmail")) {
            msg.delete();
            let _message = msg.content.split(" ");

            if (_message.length !== 2)
              return botLogs(
                bot,
                "Εντολή removeEmail: αφαιρεί ένα email από την db. Χρήση: ```removeEmail th00000@edu.hmu.gr```"
              );

            let hashedEmail = sha256().update(_message[1]).digest("hex");
            let exists = await db
              .collection("usedEmails")
              .findOne({ email: hashedEmail });
            if (!exists)
              return botLogs(bot, `Αυτό το email δεν υπάρχει στην db.`);

            await mongo.db("steki").collection("usedEmails").deleteOne({
              email: hashedEmail,
            });

            botLogs(
              bot,
              `Το email \`Hash: ${hashedEmail}\` αφαιρέθηκε από την db.`
            );
          }

          if (msg.content.startsWith("removeHash")) {
            msg.delete();
            let _message = msg.content.split(" ");

            if (_message.length !== 2)
              return botLogs(
                bot,
                "Εντολή removeHash: αφαιρεί ένα hash από την db. Χρήση: ```removeHash d4f92d348254ca39fd4d85400194acce59ae294eab802ef7befd9b5fd2e3d28b```"
              );

            let exists = await db
              .collection("usedEmails")
              .findOne({ email: _message[1] });
            if (!exists)
              return botLogs(bot, `Αυτό το hash δεν υπάρχει στην db.`);

            await mongo
              .db("steki")
              .collection("usedEmails")
              .deleteOne({ email: _message[1] });

            botLogs(
              bot,
              `Το hash \`Hash: ${_message[1]}\` αφαιρέθηκε από την db.`
            );
          }
          if (msg.content.startsWith("rebootBot")) {
            msg.delete();
            pebblehostApi(
              "restartServer",
              { id: pebblehost.serverId },
              pebblehost.user,
              pebblehost.key
            );
          }
        }
      }

      if (msg.channel.name === `register-${msg.author.id}`) {
        const verificationCode = await nanoid();

        let registration = await db.collection("activeRegistrations").findOne({
          user: msg.author.id,
        });

        if (!registration)
          registration = {
            user: msg.author.id,
            step: "sendEmail",
          };

        switch (registration.step) {
          case "sendEmail":
            if (tester.test(msg.content) || csdtester.test(msg.content)) {
              let hashedEmail = sha256().update(msg.content).digest("hex");

              botLogs(
                bot,
                `Ο χρήστης <@${msg.author.id}> έστειλε το εξής mail για εγγραφή: \`\`\`Hash: ${hashedEmail}\`\`\``
              );

              let exists = await db
                .collection("usedEmails")
                .findOne({ email: hashedEmail });
              if (exists) {
                botLogs(
                  bot,
                  `Το ${msg.content} έχει ήδη χρησιμοποιηθεί για εγγραφή. Αναγνωριστικό για αφαίρεση απο db: \`\`\`${hashedEmail}\`\`\``
                );
                channel.send(
                  `Αυτό το email έχει ήδη χρησιμοποιηθεί για εγγραφή στο Steki. Αν θεωρείς ότι έχει γίνει κάποιο λάθος, στείλε ένα μήνυμα στο <#939177847933780018>. \n\`Αναγνωριστικό Email: ${hashedEmail}\``
                );
                return;
              }
              channel.send("Δώσε μου μισό λεπτάκι...");

              await mailgun.messages().send(
                {
                  from: "Steki <steki@poiw.org>",
                  to: msg.content,
                  subject: "Εγγραφή στο Steki",
                  text: `Ο κωδικός εγγραφής σου στο Steki είναι: ${verificationCode}\n\n** Μην δώσεις τον παραπάνω κωδικό σε κανένα **`,
                  html: `<div style=display:flex;flex-direction:column;background:#f5d4b1;align-items:center><img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDABQODxIPDRQSERIXFhQYHzMhHxwcHz8tLyUzSkFOTUlBSEZSXHZkUldvWEZIZoxob3p9hIWET2ORm4+AmnaBhH//2wBDARYXFx8bHzwhITx/VEhUf39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f39/f3//wAARCAF3AXcDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDpKKKK5zcKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigApks0cIBldUBOAWOMmn1SvgJZ7aEgEZZ2B9ACP5tQCVy7RWeiSWw/0Zt8f/ADyc8D/dPb6dPpVm3u45yUGVkX70bDDD/PqKBtNE9FFFAgooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiqWpara6ZHuuH+Yj5UXlm/CuZuvGF07EW0McS9i3zH/AApqLYnJI7OiuA/4SjVd2fPXHp5a/wCFaFj4wkDBb2FWX+/HwR+HenyMXMjr6Kx9X1oWmmRXtn5cyySBQTnGME/nxR4e1ebVknaaNE8sgDZnnOf8KVna47q9jYooopDCiqerXb2GmzXMaqzRgYDdOoH9a5f/AITK8/594P1/xpqLYm0jtKK4v/hMrz/n3g/X/Gj/AITK8/594P1/xp8jFzI7SiuL/wCEyvP+feD9f8aP+EyvP+feD9f8aORhzI7SiuL/AOEyvP8An3g/X/Gt/wAP6pLqtrJLKiIUfaAufQUnFoFJM1aKKKRQUUUUAIzBVLMQABkk9qzY5SwkvGBzJgRr32/wj8c5/GpbtvtM32Vf9WuGmPr6L+Pf2+tQysZJBsOMZCe3q34dB/8AXoLiuoRMyHaCGywX2J5Ln+n1FSskN0qnuOVYHDL7g9qrggICp2blKof7qDq3+fanBvLUHlA3zsP7qAcD+X5mgsmW4nteJgZov+eij5l+o7/UflV2ORJow8bB0PQg5qnFLuwr4D4GfTJGcCka32uZIHMUh64Hyt9R3/nQS49i/RVOO+CsI7pRE54DZ+Rvof6GrlBmFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFVtQvEsLKW5fkIMgep7D86s1z/jNiNIjAPDTKD+TU0rsT0RyebrWNRAJ3zzNjnoP/rCuysPDNhaxjzoxcS92fp+ArD8GIrapKxxlYTj8xXbVU30RMV1Kp02xK7TZ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AQRVJvnc7juZf7375x+A+VaTzPNyqK8vs0jN/46ny/rTFcsy3UMcpmgfa5++jqVD/AIkcH3qhq1xFctHIjZjKqD7ZJyD+VTrbTEZFrtP+ym0/n5gqDS7AXt7IX4RD82OvUgD8cHn2oRMnYYkiT6nEuG2tL3HUeYT069CK62o4YIoE2xRqi+ijFSUN3ICiiikAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFUNS01bxRJGdlwvKuOM/Wr9FAHLwylDJBPEeDmSLof95ffuR+Iq1IizIizSAhhiG5A+9/st/nn61f1LTlvEDodlwnKuOKx4JnR5IZYsk/62Aj7/AKso9e5HfqKZal0ZPFdzWRMEyqdv3d8m3A9ieo/UdKWa9kdMs5RD/wA8xtH/AH22P0FKHgYBUvLqQD7qRjnHpkDP5moXuIY3zGiI/wDeP72X/AfiaCr2BS6IXRRCjdXJK7vqx+ZvwA+tKYtkf7xliib+/lA30UHc3/Aj+FRRyz3EpNtGzSdDIfncfj91auQaJLI2+4l2k9cHcx/E/wD16du5m59im88CLhIzKB0ab5UH0QU9Pt94Bs80p2CDy1/Pv+dbdvp1rbkMkQZx/G/zH9elWqLpbIl8z3Zz66DM/MhhX65c1f0nTW08ShpFcPjAC4xjP+NaNFJybBJIKKKKQwooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//2Q==" height="100" width="100"><div style="display:flex;flex-direction:column;justify-content:space-around;align-items:center;padding:40px 0 40px 0;font-family:Arial,Helvetica,sans-serif"><p>Ο κωδικός εγγραφής σου στο Steki είναι:<h2>${verificationCode}</h2><p style=color:red>** Μην δώσεις τον παραπάνω κωδικό σε κανένα **</p><i>Πάρε τον copy-paste και στείλε τον στο κανάλι εγγραφής σου. Έπειτα, το Stekibot θα σε βάλει αυτόματα σε όλα τα κανάλια του server.</i><p style=margin-top:40px;opacity:.5>To Stekibot και το Steki είναι project του po/iw hackerspace (<a href=https://github.com/poiw-org>https://poiw.org</a>). Ο κώδικας είναι ανοικτός και ελεύθερος προς οποιοδήποτε ενδιαφερόμενο/η, για έλεγχο, συνεισφορά ή αντιγραφή.</div></div>`,
                },
                async function (err, message) {
                  if (err) {
                    console.log(err);
                    channel.send(
                      "Υπήρξε ένα σφάλμα. Παρακαλώ προσπάθησε αργότερα..."
                    );
                    botLogs(
                      bot,
                      `Κατά την αποστολή email στον <@${msg.author.id}> προέκυψε σφάλμα το. Now the fun begins...\n \`\`\`${err}\`\`\``
                    );
                    return;
                  }
                  registration.step = "verifyEmail";
                  registration.email = msg.content;
                  registration.encryptedVerificationCode = sha256()
                    .update((verificationCode + salt).toString())
                    .digest("hex");
                  await updateRegistration(registration);

                  if (tester.test(registration.email))
                    channel.send(
                      'Τέλεια! Τσέκαρε τα εισερχόμενά σου (https://webmail.edu.hmu.gr) για ένα μήνυμα με θέμα *"Εγγραφή στο Steki"*'
                    );
                  else if (csdtester.test(registration.email))
                    channel.send(
                      'Το email που έστειλες αντιστοιχεί σε εξωτερικό τμήμα. Γι\' αυτό, θα γραφτείς ως Verified Outsider. Τσέκαρε το ακαδημαϊκό σου email για ένα μήνυμα με θέμα *"Εγγραφή στο Steki"*.'
                    );
                  else {
                    botLogs(
                      bot,
                      `Κατά την εγγραφή του <@${msg.author.id}> σε δεύτερο έλεγχο, φάνηκε το mail να μη πληροί τις προϋποθέσεις εγγραφής. Please check.`
                    );
                  }

                  botLogs(
                    bot,
                    `Ο χρήστης <@${msg.author.id}> έλαβε στο inbox του τον κωδικό εγγραφής \`\`\`Hash: ${registration.encryptedVerificationCode}\`\`\` .`
                  );
                  setTimeout(
                    () =>
                      channel.send(
                        "Όταν το λάβεις, στείλε μου τον κωδικό εγγραφής εδώ."
                      ),
                    500
                  );
                }
              );
            } else {
              botLogs(
                bot,
                `Ο χρήστης <@${msg.author.id}> έστειλε κάτι το οποίο δεν μοιάζει με email από το ΗΜΜΥ.`
              );
              channel.send(
                ":see_no_evil: Αυτό που μου έστειλες δεν μοιάζει με φοιτητικό email από το H.M.M.Y. ΕΛ.ΜΕ.ΠΑ."
              );
              setTimeout(
                () =>
                  channel.send(
                    "Ένα ακαδημαϊκό, φοιτητικό email έχει την μορφή thXXXXX@edu.hmu.gr. Αν είσαι πρωτοετής και δεν έχεις γραφτεί στη γραμματεία ακόμη, ολοκλήρωσε την εγγραφή σου και εγώ θα σε περιμένω εδώ για να μου στείλεις το ακαδημαϊκό σου email!"
                  ),
                2000
              );
            }
            break;

          case "verifyEmail":
            if (
              registration.encryptedVerificationCode &&
              sha256()
                .update(msg.content.trim() + salt)
                .digest("hex") === registration.encryptedVerificationCode
            ) {
              if (registration.email) {
                mongo
                  .db("steki")
                  .collection("usedEmails")
                  .insertOne({
                    email: sha256().update(registration.email).digest("hex"),
                  });
              }
              let { guild } = msg;
              let member = guild.members.cache.get(msg.author.id);

              if (tester.test(registration.email))
                member.roles.add("886993717725102103");
              else if (csdtester.test(registration.email))
                member.roles.add("993612908074381352");
              else {
                botLogs(
                  bot,
                  `Κατά την εγγραφή του <@${msg.author.id}> σε δεύτερο έλεγχο, φάνηκε το mail να μη πληροί τις προϋποθέσεις εγγραφής. Please check.`
                );
                channel.send(
                  "Κάτι πήγε στραβά. Δώσε λίγη ώρα για την Ομάδα Διαχείρισης να το ελέγξει..."
                );
                return;
              }
              await completeRegistration(channel, registration);
              botLogs(
                bot,
                `Ο χρήστης <@${msg.author.id}> ολοκλήρωσε με επιτυχία την εγγραφή του.`
              );
            } else {
              if (
                registration.failedAttempts > 2 ||
                !registration.encryptedVerificationCode
              ) {
                delete registration.encryptedVerificationCode;
                delete registration.failedAttempts;
                await updateRegistration(registration);
                botLogs(
                  bot,
                  `Ο χρήστης <@${msg.author.id}> έβαλε 4 φορές λάθος κωδικό εγγραφής. Η διαδικασία πρέπει να επανακινηθεί.`
                );
                channel.send(
                  "Για λόγους ασφαλείας ο κωδικός εγγραφής σου έχει καταστραφεί. Παρακαλώ επανεκκίνησε τη διαδικασία, πατώντας το :arrows_counterclockwise: που βρίσκεται παραπάνω."
                );
                return;
              }
              channel.send(
                "Χμμμ... Αυτή δεν ήταν η απάντηση που περίμενα. Χρειάζομαι *μόνο* τον 6-ψήφιο κωδικό εγγραφής που αναγράφει το mail :woozy_face:."
              );
              channel.send(
                "*Ενημέρωση από την Ομάδα Διαχείρισης, λόγω πρόσφατων συμβάντων:*\n```Οποιαδήποτε προσπάθεια tampering με το bot (reverse engineering, pen-testing κλπ) καταγράφεται, ενώ επαναλαμβανόμενοι παραβάτες θα γίνονται ban από τον σέρβερ οριστικά.```"
              );
              registration.failedAttempts =
                registration.failedAttempts + 1 || 1;
              await updateRegistration(registration);
            }
        }
      }
    });
  },
};

const updateRegistration = async (registration) => {
  if (registration._id) {
    await db
      .collection("activeRegistrations")
      .updateOne({ _id: registration._id }, { $set: { ...registration } });
  } else {
    await db.collection("activeRegistrations").insertOne(registration);
  }
};

let completeRegistration = async (channel, registration) => {
  try {
    channel.delete();
    await db
      .collection("activeRegistrations")
      .deleteOne({ _id: registration._id });
  } catch (e) {
    console.log(e);
  }
};

async function linkCheck(msg, bot) {
  let { guild } = msg;
  let member = guild.members.cache.get(msg.author.id);

  if (!msg) return;
  if (msg.author.bot) return msg;

  var expression =
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
  var regex = new RegExp(expression);

  let sentence_links = msg.content
    .split(regex)
    .filter((word) => regex.test(word));

  if (
    sentence_links.some((link) =>
      urls.blacklist.some((blacklistedLink) => link.includes(blacklistedLink))
    )
  ) {
    if (msg.attachments.length == sentence_links.length) return;

    msg.author.send(
      `<@${msg.author.id}> Το τελευταίο σου μήνυμα:\`\`\` ${msg.content}\`\`\`περιέχει συνδέσμους με μη επιτρεπτές λέξεις. Γι' αυτό, το μήνυμά σου διαγράφτηκε και έγινε καταγραφή του συμβάντος από την Ομάδα Διαχείρισης. Λόγω εξάρσεων επιθέσεων spam σε servers του Discord, σου εφαρμόστηκε προσωρινά timeout. Αν παρατηρηθεί εκτεταμένη ζημιά ή ότι έκανες εκούσια spam, θα αφαιρεθείς μόνιμα από τον server. \n **Αν δεν έστειλες εσύ το μήνυμα, άλλαξε κωδικό άμεσα και ενεργοποίησε 2FA!**`
    );
    botLogs(
      bot,
      `Στο κανάλι ${msg.channel}, ο χρήστης <@${msg.author.id}> έστειλε σύνδεσμο με μη επιτρεπτές λέξεις: \`\`\` ${msg.content}\`\`\``
    );
    try {
      member.timeout(1440 * 60 * 1000, "URL in blacklist");
    } catch (error) {
      console.log(error);
    }
    msg.delete();
    process.env.blockedMessages = process.env.blockedMessages
      ? parseInt(process.env.blockedMessages) + 1
      : 1;
    return;
  }

  let isSafeArray = (
    await Promise.all(
      sentence_links.map((link) => generalUtils.isLinkSafeGoogle(link))
    )
  ).map((array) => {
    let { threat } = array[0];
    return threat ? threat : null;
  });

  if (isSafeArray.some((item) => item != null)) {
    msg.delete();
    let threats = [];
    sentence_links.forEach((link) => {
      if (isSafeArray[sentence_links.indexOf(link)] != null) {
        threats.push(
          Object.assign({}, isSafeArray[sentence_links.indexOf(link)], {
            link: link,
          })
        );
      }
    });

    msg.author.send(
      `<@${msg.author.id}> Στο τελευταίο σου μήνυμα:\`\`\` ${msg.content}\`\`\`εντοπίσαμε γνωστούς κακόβουλους συνδέσμους. Λόγω εξάρσεων επιθέσεων spam σε servers του Discord, διαγράψαμε το μήνυμά σου αυτόματα και σε κάναμε προσωρινά timeout. Αν παρατηρηθεί εκτεταμένη ζημιά ή ότι έκανες εκούσια spam, θα αφαιρεθείς μόνιμα από τον server. \n\n **Αν δεν έστειλες εσύ το μήνυμα, άλλαξε κωδικό άμεσα και ενεργοποίησε 2FA!**`
    );
    try {
      member.timeout(1440 * 60 * 1000, "URL is malware");
    } catch (error) {
      console.log(error);
    }

    botLogs(
      bot,
      `Εντοπίστηκε κακόβουλος σύνδεσμος από <@${msg.author.id}> στο ${
        msg.channel
      }\n\n Κατηγορίες απειλής: \n ${threats
        .map(
          (threat) =>
            `**${threat["link"]}** => \`\`${threat["threatTypes"][0]}\`\`\n`
        )
        .join("")}`
    );
    process.env.blockedMessages = process.env.blockedMessages
      ? parseInt(process.env.blockedMessages) + 1
      : 1;

    return false;
  }

  if (sentence_links.length > 0) {
    if (
      sentence_links.filter((link) =>
        urls.whitelist.some((whitelistedLink) =>
          link.startsWith(`https://${whitelistedLink}`)
        )
      ).length === sentence_links.length
    )
      return;

    if (msg.embeds.length == sentence_links.length) return;

    console.log(msg);

    msg.react("⚠️");
    msg.channel.send(
      `⚠️: Παρ' ότι οι συνδέσμοι του μηνύματος του/ης <@${msg.author.id}> ελέγχθηκαν αυτόματα για γνωστές απειλές, να έχετε τα μάτια σας δεκατέσσερα για τυγχόν phishing ή malware.`
    );
  }

  return msg;
}
