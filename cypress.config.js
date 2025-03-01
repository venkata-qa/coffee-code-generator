const { defineConfig } = require('cypress');
const nodemailer = require('nodemailer');
const fs = require('fs');
require('dotenv').config(); // Load environment variables

module.exports = defineConfig({
  chromeWebSecurity: false,
  fixturesFolder: 'cypress/fixtures',
  screenshotsFolder: 'cypress/screenshots',
  videosFolder: 'cypress/videos',
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        sendEmail({ screenshotPath }) {
          return new Promise((resolve, reject) => {
            let transporter = nodemailer.createTransport({
              service: 'gmail', // Change to your email provider if needed
              auth: {
                user: process.env.EMAIL_USER, // Set in .env file
                pass: process.env.EMAIL_PASS // Set in .env file
              }
            });

            // Check if screenshot exists
            if (!fs.existsSync(screenshotPath)) {
              console.log("❌ Screenshot not found:", screenshotPath);
              return resolve({ success: false, message: "Screenshot not found" });
            }

            let mailOptions = {
              from: process.env.EMAIL_USER,
              to: "ambi.chaliki@gmail.com", // Change to recipient email
              subject: "Your Claimed Hot Drinks QR Code",
              text: "Here is your QR Code for the Hot Drinks offer.",
              attachments: [
                {
                  filename: 'qr-code.png',
                  path: screenshotPath
                }
              ]
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.error("❌ Email sending failed:", error);
                return reject(error);
              }
              console.log("✅ Email sent: " + info.response);
              resolve({ success: true, message: info.response });
            });
          });
        }
      });
    },
    baseUrl: 'https://octopus.energy/',
  },
});
