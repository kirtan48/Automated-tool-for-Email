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

function getGmailAuth() {
  return oAuthClient;
}

module.exports = {
  getGmailAuth,
};
