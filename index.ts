#!/usr/bin/env node
import { execSync } from "child_process";

import enquirer from "enquirer";
import ora from "ora";

import { ChatGPTClient } from "./client.js";
import { loadPromptTemplate } from "./config_storage.js";
import childProcess from "child_process";

const debug = (...args: unknown[]) => {
  if (process.env.DEBUG) {
    console.debug(...args);
  }
};

const spinner = ora();

// read parameter from cli
const args = process.argv.slice(2);
const [targetBranch, sourceBranch] = args;

let diff = "";
try {
  diff = execSync(`git diff ${targetBranch ?? "master"}...${sourceBranch ?? "HEAD"}`).toString();
  if (!diff) {
    console.log("No changes to commit.");
    process.exit(0);
  }
} catch (e) {
  console.log("Failed to run git diff master...HEAD");
  process.exit(1);
}

let currentBranch = "";
try {
  currentBranch = execSync("git branch --show-current").toString();
  currentBranch = currentBranch.replace(/[\r\n]/gm, "").trim();
} catch (e) {
  console.log("Failed to run git branch --show-current");
  process.exit(1);
}

run(diff, currentBranch)
  .then(() => {
    process.exit(0);
  })
  .catch((e: Error) => {
    console.log("Error: " + e.message, e.cause ?? "");
    process.exit(1);
  });

async function run(diff: string, currentBranch: string) {
  // TODO: we should use a good tokenizer here
  const diffTokens = diff.split(" ").length;
  if (diffTokens > 5000) {
    console.log(`Diff is way too bug. Truncating to 2000 tokens. It may help`);
    diff = diff.split(" ").slice(0, 2000).join(" ");
  }

  const api = new ChatGPTClient();

  const prompt = loadPromptTemplate()
    .replace(/{{currentBranch}}/g, currentBranch)
    .replace("{{diff}}", ["```", diff, "```"].join("\n"));

  while (true) {
    debug("prompt: ", prompt);
    const choices = await getMessages(api, prompt);

    const result = escapeCommitMessage(choices[0]);

    try {
      const answer = await enquirer.prompt<{ message: string }>({
        type: "select",
        name: "message",
        message: "Copy the message to clipboard",
        choices,
      });

      var proc = childProcess.spawn("pbcopy");
      proc.stdin.write(result);
      proc.stdin.end();
      return;
    } catch (e) {
      console.log("Aborted.");
      console.log(e);
      process.exit(1);
    }
  }
}

async function getMessages(api: ChatGPTClient, request: string) {
  spinner.start("Asking ChatGPT 🤖 for Pull Request messages...");

  // send a message and wait for the response
  try {
    const response = await api.getAnswer(request);
    // find json array of strings in the response
    const messages = response
      .split("\n====\n")
      .map(normalizeMessage)
      .filter((l) => l.length > 1);

    spinner.stop();

    debug("response: ", response);
    return messages;
  } catch (e) {
    spinner.stop();
    if (e.message === "Unauthorized") {
      return getMessages(api, request);
    } else {
      throw e;
    }
  }
}

function normalizeMessage(line: string) {
  return line
    .trim()
    .replace(/^(\d+\.|-|\*)\s+/, "")
    .replace(/^[`"']/, "")
    .replace(/[`"']$/, "")
    .replace(/[`"']:/, ":") // sometimes it formats messages like this: `feat`: message
    .replace(/:[`"']/, ":") // sometimes it formats messages like this: `feat:` message
    .replace(/\\n/g, "")
    .trim();
}

function escapeCommitMessage(message: string) {
  return message.replace(/'/, `''`);
}
