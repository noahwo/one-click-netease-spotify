import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
await import("dotenv/config");

// When using ESM, __dirname is not defined, so we need to create an equivalent if needed.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

async function getCredentialToken(clientId, clientSecret) {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

function updateEnvFile(newAccessToken) {
  const envPath = path.join(__dirname, ".env"); // Adjust the path as needed
  fs.readFile(envPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading .env file:", err);
      return;
    }

    const updatedData = data.replace(
      /(ACCESS_TOKEN=)(.*)/g,
      `$1'${newAccessToken}'`
    );

    fs.writeFile(envPath, updatedData, "utf8", (err) => {
      if (err) {
        console.error("Error writing .env file:", err);
        return;
      }

      console.log("ACCESS_TOKEN updated successfully in .env file.");
    });
  });
}

// Example usage (replace 'your-client-id' and 'your-client-secret' with actual credentials)
getCredentialToken(CLIENT_ID, CLIENT_SECRET)
  .then((token) => {
    console.log("Token:", token);
    updateEnvFile(token);
  })
  .catch(console.error);
