# Prerequisites
Before you begin, ensure you have met the following requirements:

You have Node.js installed on your machine.
You have an active Google Cloud account to set up OAuth access to your Gmail account.

# Steps to Run the Application
1. Clone the Repository
```bash
https://github.com/kirtan48/Automated-tool-for-email.git
```

2. Navigate to the Project Directory
```bash
cd Automated-tool-for-email
```

3. Install Dependencies
```bash
npm install bullmq dotenv nodemailer openai googleapis axios
```

4. Set Up OAuth Access to Your Gmail Account
Create OAuth credentials on Google Cloud to obtain 
CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, and REDIRECT_URI.

5. Set Up Environment Variables
Create a .env file in the root directory and add the following variables:

```plaintext
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
REFRESH_TOKEN=your_refresh_token
REDIRECT_URI=your_redirect_uri
API_KEY=your_openai_api_key
```

6. Get OpenAI API Key
For OpenAI, there is no free API key available at the moment. You can refer to this GitHub repository (https://github.com/PawanOsman/ChatGPT) and generate an API key for yourself from the Discord channel linked there (https://discord.gg/pawan).
or You can just go to Discord mentioned in GitHub and then in the server:

- Go to ⁠🤖𝐁𝐨𝐭
- Then do the /key command
  
It will give you a key ,just add them in .env file

8. Run the Application
```bash
node server.js
```

# Usage
Once the application is running, it will parse your Gmail inbox every 10 minutes to check for unread emails. If it finds an unread email, it will send an automated reply to the sender and categorize the email using labels.

Ensure that your Gmail account is correctly linked and authorized to allow the application to fetch and process emails.
