const { Queue } = require("bullmq");
const { google } = require("googleapis");
const dotenv = require("dotenv");
dotenv.config();

const CLIENT_Id = process.env.CLIENT_Id;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuthClient = new google.auth.OAuth2(
  CLIENT_Id,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuthClient.setCredentials({ refresh_token: REFRESH_TOKEN });

const fetchEmailQueue = new Queue("fetchEmailQueue", {
  connection: {
    host: "localhost",
    port: 6379,
  },
});
async function addFetchEmailJob() {
  try {
    await fetchEmailQueue.add("fetchGmailEmails", {
      clientId: CLIENT_Id,
      clientSecret: CLIENT_SECRET,
      redirectUri: REDIRECT_URI,
      refreshToken: REFRESH_TOKEN,
      provider: "gmail",
    });
    console.log(`Job added to queue`);
  } catch (error) {
    console.error("Error adding job to queue:", error);
  }
}
function startProducer() {
  try {
    addFetchEmailJob();
    setInterval(() => {
      addFetchEmailJob();
    }, 10 * 60 * 1000); 
  } catch (error) {
    console.error("Error starting producer:", error);
  }
}

module.exports = {
  startProducer,
};
