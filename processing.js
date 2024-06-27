const { Worker, Queue } = require("bullmq");
const { OpenAI } = require("openai");
const { google } = require("googleapis");
const { getGmailAuth } = require("./Oauth");
const { fetchAICompletion } = require("./open");
const dotenv = require("dotenv");
dotenv.config();

const sendEmailQueue = new Queue("sendEmailQueue", {
  connection: {
    host: "localhost",
    port: 6379,
  },
});

function startProcessing() {
  const processEmailWorker = new Worker(
    "processEmailQueue",
    async (job) => {
      const gmailAuthClient = getGmailAuth();
      
      let emailContent;
      const { email, provider } = job.data;
      if (provider === "gmail") {
        
        try {
          const gmail = google.gmail({ version: "v1", auth: gmailAuthClient });
          const messageDetails = await gmail.users.messages.get({
            userId: "me",
            id: email.id,
          });

          // Extracting email content
          const payload = messageDetails.data.payload;
          const headers = payload.headers;
          const subject = headers.find(
            (header) => header.name === "Subject"
          ).value;
          const from = headers.find((header) => header.name === "From").value;

          let messageBody = "";
          if (payload.body && payload.body.data) {
            // Decode the base64 encoded body
            messageBody = Buffer.from(payload.body.data, "base64").toString();
          } else if (payload.parts && payload.parts.length > 0) {
            // Handle multipart messages
            for (let part of payload.parts) {
              if (
                part.mimeType === "text/plain" &&
                part.body &&
                part.body.data
              ) {
                messageBody = Buffer.from(part.body.data, "base64").toString();
                break;
              }
            }
          }
          //const messageBody = Buffer.from(payload.parts[0].body.data, "base64").toString();

          // console.log("Subject:", subject);
          // console.log("From:", from);
          // console.log("payload",payload)

          // console.log("Message:", messageBody);
          emailContent = messageBody;

          // console.log("\n")
          if (emailContent.length > 0) {
           
            const prompt = `
            const prompt = Classify the intent of the email sender based on their response and also write a reply for the email. You should categorize the response into one of the following options:
            
            Interested
            Not Interested
            More information
            Based of the context email, geberate replies
            a reply. For example -
            a. If the email mentions they are interested to know more, your reply should ask them if they
            are willing to hop on to a demo call by suggesting a time.

            
            your response should be in the form of a JSON object with three fields: intent (which should have one of the given three values) ,subject (subject of the reply) and reply (which should contain the appropriate response based on the email content). Remember not to add any extra sentences.Also dont' write any varaiblke thing in response like [reciever name] you response should be static and also just give json response dont add anything liker heres' your ewpnse ,or anything like that also your response should be of maximum 200 tokens
            Sender Emial:${from}
            Email: ${emailContent}
            myname: Kirtan 
            
            Response:
            ;`;
            const responseData = await fetchAICompletion(prompt);
            await sendEmailQueue.add("sendEmail", {
              id: email.id,
              email: from,
              response: responseData,
            });
            console.log("response added to send mail");
            // console.log(responseData); // Process responseData as needed
          }
        } catch (error) {
          console.log(error);
        }
      }
    },
    {
      connection: {
        host: "localhost",
        port: 6379,
      },
    }
  );
}
//startProcessing();

module.exports = {
  startProcessing,
};
