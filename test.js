const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');
const { exec } = require('child_process');

dotenv.config();
const ai = new GoogleGenAI({});

function main() {
    console.log("fetching models...");
    (async () => {
        console.log("Called");
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "How does AI work?",
        });
        console.log(response);
    })();
};

// const seeds = ["pwd", "whoami"];

const seeds = [
  "curl -X POST -d 'key_hP9ZtJ4oX6=value_mK3vY1qS8bG2' https://httpbin.org/post",
  "curl -X POST -d 'name=user_G8qW2oL4tD&email=emJ4dX8fK5@dN9rX7gM6O.com' https://httpbin.org/forms/post",
  "curl -X POST -H 'Content-Type: application/json' -d '{\"data_field_pA7tF3cV6z\":\"data_val_sW9zE1oL5u\"}' https://httpbin.org/anything",
  "curl -X POST -d 'message_fM8aP0dX6vZ2h4c1qE9Y3' https://httpbin.org/delay/7",
  "curl -X POST https://httpbin.org/status/400",
  "curl -X POST -u 'authuser_oR7fY1aW2m:authpass_uQ6nZ3cH4xB2' https://httpbin.org/basic-auth/authuser_oR7fY1aW2m/authpass_uQ6nZ3cH4xB2",
  "curl -X POST --digest -u 'digestuser_fK8wV2pZ9e:digestpass_eM1gS5yT3q' https://httpbin.org/digest-auth/auth/digestuser_fK8wV2pZ9e/digestpass_eM1gS5yT3q",
  "curl -X POST -H 'Authorization: Bearer e3d5b0a2c1f4e6d8a7c9b0a1c2e4f6d8a9b0c1e2f3d4a5b6c7d8e9f0' https://httpbin.org/bearer",
  "curl -X POST -d 'K5eY2zV0lU7pN4bQ8wD1oA9rJ6hX3cT4uS2eP0fL9iG1mO7jC5sE8dZ0kR4a6Y9v1x3qB5n' https://httpbin.org/bytes/50",
  "curl -X POST -H 'Content-Type: text/plain; charset=utf-8' -d 'world你好random😊text🌟here' https://httpbin.org/encoding/utf8",
  "curl -X POST -H 'X-CustomF7u2n5_Header: HeaderVal_X3yW7zP1mV' https://httpbin.org/headers",
  "curl -X POST https://httpbin.org/ip",
  "curl -X POST https://httpbin.org/user-agent"
];
let failedCommands = [];

const execAsync = (command) =>
    new Promise((resolve) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${command}\n`, error);
                failedCommands.push({ command, error: error.message });
            }
            else {
                console.log(stdout);
            }
            resolve();
        });
    });

(async () => {
    await Promise.all(seeds.map((command) => execAsync(command)));
    console.log('Failed commands:', failedCommands);
})();