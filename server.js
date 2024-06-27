const dotenv = require("dotenv");
const { Worker, Queue } = require("bullmq");
const { startProcessing } = require("./processing");
const { startProducer } = require("./producer");
const { startWorker } = require("./worker");
const {sendEmail} =require("./sendemail")

dotenv.config();

async function main() {
  try {
    sendEmail();
    startProcessing();
    startWorker();
    startProducer();
    
    
    
    console.log("Initialization complete");
  } catch (error) {
    console.error("Error during initialization:", error);
  }
}

main();
