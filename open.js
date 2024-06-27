const axios = require("axios");

// Function to perform AI completion request
async function fetchAICompletion(prompt) {
 console.log("Reached openn js");
  //  console.log(`promt ${prompt}`)
  const apiKey = process.env.API_KEY; // Replace with your actual API key
  const endpoint = "https://api.pawan.krd/v1/chat/completions";

  const requestData = {
    model: "pai-001-light",
    max_tokens: 200,
    messages: [
      {
        role: "system",
        content: "You are an helpful assistant.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  };

  try {
    const response = await axios.post(endpoint, requestData, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });
   // console.log("Response", response.data.choices[0].message.content);
   // console.log("\n");
    return response.data.choices[0].message.content; // Return the response data
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
}

//fetchAICompletion("Tell me a joke");
module.exports = {
  fetchAICompletion, // Export the function for use in other files
};
