const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");
const shortid = require("shortid");
const { default: mongoose } = require("mongoose");

const urlRoute = require("./routes/url");
require("dotenv").config();

const app = express();
const port = 3000;

const urlModel = require("./models/url");

mongoose
  .connect(process.env.MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("mongo connected"))
  .catch((err) => console.error(err));

// const { MongoClient, ServerApiVersion } = require("mongodb");
// const uri = process.env.MONGODB;
// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const databaseClient = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });
// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await databaseClient.connect();
//     // Send a ping to confirm a successful connection
//     await databaseClient.db("admin").command({ ping: 1 });
//     console.log(
//       "Pinged your deployment. You successfully connected to MongoDB!"
//     );
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await databaseClient.close();
//   }
// }
// run().catch(console.dir);

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

    const existingURL = await urlModel
      .findOne({ redirectURL: url })
      .maxTimeMS(20000)
      .exec();
    if (existingURL) {
      message.reply({
        content: `The URL '${url}' already has a shortId: ${existingURL.shortId} click here to redirect https://discord-bot-eight-beta.vercel.app/${existingURL.shortId}`,
      });
    } else {
      message.reply({
        content: "Generating Short url id for " + url,
      });

      try {
        // Proceed to create a new short URL
        const newURL = await urlModel.create({
          shortId: generateShortId,
          redirectURL: url,
        });
        message.reply({
          content: `Your shortId for url ${url} is created, your id is ${generateShortId}, click here https://discord-bot-eight-beta.vercel.app/${generateShortId}`,
        });
      } catch (error) {
        if (error.code === 11000) {
          // Handle the duplicate key error
          message.reply({
            content: "The provided URL already has a short URL.",
          });
        } else {
          console.error(error);
          message.reply({
            content:
              "An error occurred while generating the short URL. Please try again later.",
          });
        }
      }
    }

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

app.listen(port, () => console.log(`server started ${port}`));
