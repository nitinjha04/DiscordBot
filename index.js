const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");
const shortid = require("shortid");
const { default: mongoose } = require("mongoose");

const urlRoute = require("./routes/url");
require("dotenv").config();

const app = express();
// const port = 3000;

const urlModel = require("./models/url");

mongoose
  .connect(process.env.MONGODB)
  .then(() => console.log("mongo connected"))
  .catch((err) => console.error(err));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
  console.log("Received a message: " + message.content);
  // Check if the message is from a bot or if the bot has already responded
  if (message.author.bot) {
    console.log("Ignoring bot's own message.");
    return;
  }

  if (message.content.startsWith("Hi")) {
    return message.reply({
      content: "Hi From Bot",
    });
  } else if (message.content.startsWith("create")) {
    const url = message.content.split("create")[1].trim();
    const generateShortId = shortid();

    urlModel
      .findOne({ redirectURL: url })
      .exec()
      .then((existingUrl) => {
        if (existingUrl) {
          message.reply({
            content: `The URL '${url}' already has a shortId: ${existingUrl.shortId} click here to redirect https://discord-lpswdfy10-nitinjha04.vercel.app/${existingUrl.shortId}`,
          });
        } else {
          message.reply({
            content: "Generating Short url id for " + url,
          });

          return urlModel
            .create({ shortId: generateShortId, redirectURL: url })
            .then(() => {
              message.reply({
                content: `Your shortId for url ${url} is created your id is ${generateShortId} , click here https://discord-lpswdfy10-nitinjha04.vercel.app/${generateShortId}`,
              });
            })
            .catch((error) => {
              if (error.code === 11000) {
                // This code represents a duplicate key error (duplicate 'redirectURL')
                // Handle the duplicate key error, e.g., provide a user-friendly message
                message.reply({
                  content: "The provided URL already has a short URL.",
                });
                return;
              } else {
                console.error(error);
                message.reply({
                  content:
                    "An error occurred while generating the short URL. Please try again later.",
                });
              }
            });
        }
      });

    // Proceed to create a new short URL
  }
  console.log("Finished processing message.");
  // console.log(message);
});

client.on("interactionCreate", (interaction) => {
  console.log(interaction);
  interaction.reply("Pong!");
});
client.login(process.env.LOGIN_TOKEN);

app.use(express.urlencoded({ extended: false }));

app.use(urlRoute);

// app.listen(port, () => console.log(`server started ${port}`));
app.listen(() => console.log(`server started`));
