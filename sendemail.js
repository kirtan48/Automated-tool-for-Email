const { Worker, Queue } = require("bullmq");
const { google } = require("googleapis");
const nodemailer = require("nodemailer");

const { getGmailAuth } = require("./Oauth");
const gmailAuthClient = getGmailAuth();
const dotenv = require("dotenv");
dotenv.config();

const CLIENT_Id = process.env.CLIENT_Id;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const sendEmailQueue = new Queue("sendEmailQueue", {
  connection: {
    host: "localhost",
    port: 6379,
  },
});
async function getOrCreateLabel(gmail, labelName) {
  try {
    // List all labels
    const res = await gmail.users.labels.list({ userId: 'me' });
    const labels = res.data.labels;

    // Check if the label exists
    const existingLabel = labels.find(label => label.name.toLowerCase() === labelName.toLowerCase());

    if (existingLabel) {
      return existingLabel.id;
    } else {
      // Create the label if it doesn't exist
      const newLabel = await gmail.users.labels.create({
        userId: 'me',
        requestBody: {
          name: labelName,
          labelListVisibility: 'labelShow',
          messageListVisibility: 'show',
        },
      });
      return newLabel.data.id;
    }
  } catch (error) {
    console.error('Error getting or creating label:', error);
    throw error;
  }
}
function extractJsonString(text) {
  const start = text.indexOf("{");
  let end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && start < end) {
    return text.substring(start, end + 1);
  } else if (end == -1) {
    text += "}";
    end = text.lastIndexOf("}");
    return text.substring(start, end + 1);
  }
  throw new Error("No valid JSON found in the input text.");
}

function convertTextToJson(text) {
  try {
    const jsonString = extractJsonString(text);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing JSON:", error.message);
    return null;
  }
}

// Example usage:

async function modifyGmail(id, labelName) {
  // This should return an authenticated OAuth2 client
  const gmail = google.gmail({ version: "v1", auth: gmailAuthClient });
  try {
    // Step 1: Get the email details
    const labelId = await getOrCreateLabel(gmail, labelName);
    const emailDetails = await gmail.users.messages.get({
      userId: "me",
      id: id,
    });
    await gmail.users.messages.modify({
      userId: "me",
      id: id,
      resource: {
        removeLabelIds: ["UNREAD"],
        addLabelIds: [labelId],
      },
    });

    console.log(`Email marked as read and addedd the label`);
  } catch (error) {
    console.error("Error extracting or marking email as read:", error);
    thr;
  }
}

async function sendMail(toEmail, subject, reply, id,labelname) {
  console.log("Sending Email");
  try {
    const access_token = await gmailAuthClient.getAccessToken();
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "kirtanagarwal007@gmail.com",
        clientId: CLIENT_Id,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: access_token,
      },
    });
    const mailOptions = {
      from: "Kirtan <kirtanagarwal007@gmail.com",
      to: toEmail,
      subject: subject,
      text: reply,
    };
    const result = await transport.sendMail(mailOptions);
    modifyGmail(id,labelname);
    return result;
  } catch (error) {
    console.log(error);
  }
}

function sendEmail(){
  const sendEmailWorker = new Worker(
    "sendEmailQueue",
    async (job) => {
      const { id, email, response } = job.data;
      // console.log(email);
      const json = convertTextToJson(response);
      // console.log(email);
      // console.log(json.subject);
      // console.log(json.reply);
      sendMail(email, json.subject, json.reply, id,json.intent);
     // console.log(json);
    },
    {
      connection: {
        host: "localhost",
        port: 6379,
      },
    }
  );

}
//sendEmail()
module.exports={
  sendEmail
}

