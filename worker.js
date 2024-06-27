const { google } = require("googleapis");
const { Worker, Queue } = require("bullmq");
const { getGmailAuth } = require("./Oauth");



const processEmailQueue = new Queue("processEmailQueue", {
  connection: {
    host: "localhost",
    port: 6379,
  },
});


function startWorker() {
  const gmailAuthClient = getGmailAuth();
  try {
    const fetchEmailWorker = new Worker(
      "fetchEmailQueue",
      (job) => {
        const { clientId, clientSecret, redirectUri, refreshToken, provider } =
          job.data;
        console.log("Worker received job");

        let emails;
        if (provider === "gmail") {
          console.log("Processing Gmail");

          const gmail = google.gmail({ version: "v1", auth: gmailAuthClient });
          gmail.users.messages
            .list({
              userId: "me",
              labelIds: ["INBOX"],
              q: "is:unread",
            })
            .then((res) => {
              const messages = res.data.messages;
              if (messages && messages.length > 0) {
                emails = messages;

                if (emails.length > 0) {
                  emails.forEach(async (email) => {
                    try {
                      await processEmailQueue.add("processEmail", {
                        email,
                        provider,
                      });
                      console.log("Added email to processing queue");
                    } catch (error) {
                      console.error(
                        "Error adding email to processing queue:",
                        error
                      );
                    }
                  });
                }
              }
            })
            .catch((error) => {
              console.error("Error processing Gmail:", error);
            });
        } else if (provider === "outlook") {
        }
      },
      {
        connection: {
          host: "localhost",
          port: 6379,
        },
      }
    );

    fetchEmailWorker.on("completed", (job, result) => {
     // console.log(`Job completed for ${job.id}`);
    });

    fetchEmailWorker.on("failed", (job, err) => {
      console.error(`Job ${job.id} failed with error: ${err.message}`);
    });
  } catch (error) {
    console.error("Error starting worker:", error);
  }
}
//startWorker();

module.exports = {
  startWorker,
};
