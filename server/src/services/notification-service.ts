import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport"; // <-- ADD THIS LINE
import { secrets } from "../config/config";
import { google } from "googleapis";
let isOnCooldown = false;
let lastNotificationTimestamp: number | null = null;
const COOLDOWN_DURATION = 3600000; // 1 hour in ms

const oAuth2Client = new google.auth.OAuth2(
  secrets.CLIENT_ID,
  secrets.CLIENT_SECRET,
  secrets.REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: secrets.REFRESH_TOKEN });

async function sendEmailNotification(
  users: Array<any>,
  message: string,
  data: any
) {
  if (isOnCooldown) {
    console.log("Email notification is on cooldown. Skipping.");
    return;
  }

  isOnCooldown = true;
  lastNotificationTimestamp = Date.now();

  setTimeout(() => {
    isOnCooldown = false;
    console.log("Email notification cooldown ended.");
  }, COOLDOWN_DURATION);

  try {
    const { token } = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport(<SMTPTransport.Options>{
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        type: "OAuth2",
        user: "smartpot50@gmail.com",
        clientId: secrets.CLIENT_ID,
        clientSecret: secrets.CLIENT_SECRET,
        refreshToken: secrets.REFRESH_TOKEN,
        accessToken: token,
      },
    });

    for (const user of users) {
      const userMail = user.email;
      const notification = await transporter.sendMail({
        from: "Smartpot alert 🌼 <smartpot50@gmail.com>",
        to: userMail,
        subject: `${data.flower.name} notification`,
        text: message,
      });
      console.log("Message sent: %s", notification.messageId);
    }
  } catch (error) {
    console.error(error);
  }
}

import axios from "axios";

let discordOnCooldown = false;

async function sendDiscordNotification(message: string, data: any) {
  if (discordOnCooldown) {
    console.log("Discord notification is on cooldown. Skipping.");
    return;
  }

  discordOnCooldown = true;

  setTimeout(() => {
    discordOnCooldown = false;
    console.log("Discord notification cooldown ended.");
  }, COOLDOWN_DURATION);

  try {
    await axios.post(secrets.DISCORD_WEBHOOK_URL!, {
      embeds: [
        {
          title: `${data.flower.name} Notification`,
          description: message,
          color: 0x00ff00,
        },
      ],
    });
    console.log("Message sent to Discord!");
  } catch (error) {
    console.error("Error sending message to Discord:", error);
  }
}

export default {
  sendEmailNotification,
  sendDiscordNotification,
};
