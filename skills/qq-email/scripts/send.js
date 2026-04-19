#!/usr/bin/env node
"use strict";

const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const os = require("os");

function loadEnv() {
  const envFile = path.join(os.homedir(), ".swat", ".env");
  if (!fs.existsSync(envFile)) return;
  const lines = fs.readFileSync(envFile, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

loadEnv();

function output(obj) {
  process.stdout.write(JSON.stringify(obj) + "\n");
}

function fail(message) {
  output({ status: "error", message });
  process.exit(1);
}

function parseArgs(argv) {
  const args = { attach: [] };
  let i = 2;
  while (i < argv.length) {
    const flag = argv[i];
    const val = argv[i + 1];
    switch (flag) {
      case "--to":
        args.to = val;
        i += 2;
        break;
      case "--subject":
        args.subject = val;
        i += 2;
        break;
      case "--body":
        args.body = val;
        i += 2;
        break;
      case "--html":
        args.htmlFile = val;
        i += 2;
        break;
      case "--from":
        args.from = val;
        i += 2;
        break;
      case "--attach":
        args.attach.push(val);
        i += 2;
        break;
      default:
        fail("Unknown argument: " + flag);
    }
  }
  return args;
}

async function main() {
  const user = process.env.QQ_EMAIL_USER;
  const authCode = process.env.QQ_EMAIL_AUTH_CODE;

  if (!user) fail("Environment variable QQ_EMAIL_USER is not set");
  if (!authCode) fail("Environment variable QQ_EMAIL_AUTH_CODE is not set");

  const args = parseArgs(process.argv);

  if (!args.to) fail("Missing required argument: --to");
  if (!args.subject) fail("Missing required argument: --subject");
  if (!args.body && !args.htmlFile) {
    fail("At least one of --body or --html is required");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.qq.com",
    port: 465,
    secure: true,
    auth: {
      user: user,
      pass: authCode,
    },
  });

  const mailOptions = {
    from: args.from || user,
    to: args.to,
    subject: args.subject,
  };

  if (args.body) {
    mailOptions.text = args.body;
  }

  if (args.htmlFile) {
    const htmlPath = path.resolve(args.htmlFile);
    if (!fs.existsSync(htmlPath)) {
      fail("HTML file not found: " + args.htmlFile);
    }
    mailOptions.html = fs.readFileSync(htmlPath, "utf-8");
  }

  if (args.attach.length > 0) {
    mailOptions.attachments = args.attach.map((filePath) => {
      const resolved = path.resolve(filePath);
      if (!fs.existsSync(resolved)) {
        fail("Attachment file not found: " + filePath);
      }
      return { filename: path.basename(resolved), path: resolved };
    });
  }

  const info = await transporter.sendMail(mailOptions);
  output({
    status: "success",
    messageId: info.messageId,
    to: args.to,
    subject: args.subject,
  });
}

main().catch((err) => {
  const msg = err.message || String(err);
  if (/invalid login|auth|535/i.test(msg)) {
    fail(msg + " — check QQ_EMAIL_USER and QQ_EMAIL_AUTH_CODE (授权码, not password)");
  }
  fail(msg);
});
