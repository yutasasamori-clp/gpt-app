import fetch from "node-fetch";
import fs from "fs";
import { exec } from "child_process";
import dotenv from "dotenv";

dotenv.config();
let API_KEY = process.env.API_KEY;
let url = "https://api.openai.com/v1/chat/completions";

let fileCount = fs.readdirSync("./messages").length
  ? fs.readdirSync("./messages").length
  : 0;

let saveSendMessage = () => {
  const filename = `./messages/${fileCount + 1}.txt`;
  fs.writeFileSync(filename, fs.readFileSync("prompt.txt", "utf-8").trim());
  fileCount++;
};

let prompts = [];
const createPrompt = () => {
  for (let index = 1; index <= fileCount; index++) {
    const message = fs.readFileSync(`./messages/${index}.txt`, "utf-8").trim();
    const role = index % 2 === 0 ? "assistant" : "user";
    prompts.push({ role: role, content: message });
  }
};

const saveResMassege = (data) => {
  const filename = `./messages/${fileCount + 1}.txt`;
  fs.writeFileSync(filename, data);
};

function openFileInVSCode(filePath) {
  const command = `code ${filePath}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Failed to open file: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Command execution error: ${stderr}`);
      return;
    }
    console.log(`File ${filePath} opened successfully in VS Code.`);
  });
}

export async function sendPrompt(prompt = "") {
  if (!prompt) {
    console.log("👺promptがありません👺");
    return;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: prompts,
    }),
  });
  const data = await response.json();

  if (data.error) {
    console.log(data.error);
  } else {
    console.log(
      `\u001b[32m\n${data.choices[0].message.content.trim()}\n\u001b[0m`
    );
    saveResMassege(data.choices[0].message.content.trim());
    console.log(`🎉success🎉 saved to ${fileCount + 1}.txt`);

    const filePath = `./messages/${fileCount + 1}.txt`;
    openFileInVSCode(filePath);
  }
}

saveSendMessage();
createPrompt();
sendPrompt(prompts);
