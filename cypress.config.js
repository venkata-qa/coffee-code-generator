const { defineConfig } = require('cypress');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

module.exports = defineConfig({
  chromeWebSecurity: false,
  fixturesFolder: 'cypress/fixtures',
  screenshotsFolder: 'cypress/screenshots',
  videosFolder: 'cypress/videos',
  e2e: {
    setupNodeEvents(on, config) {

      config.env = {
        SATISH_PASSWORD: process.env.SATISH_PASSWORD,
        NIMMI_PASSWORD: process.env.NIMMI_PASSWORD,
        HARI_PASSWORD: process.env.HARI_PASSWORD,
      };

      on('task', {
        sendEmail({ screenshotName, screenshotsFolder, accountName }) {
          return new Promise((resolve, reject) => {
            // Construct the full screenshot path
            const screenshotPath = path.join(screenshotsFolder, screenshotName + '.png');

            console.log("FILE PATH:", screenshotPath);

            // Check if screenshot exists
            if (!fs.existsSync(screenshotPath)) {
              console.log("❌ Screenshot not found:", screenshotPath);
              return resolve({ success: false, message: "Screenshot not found" });
            }

            // Create email transporter
            let transporter = nodemailer.createTransport({
              service: 'gmail', // Change to your email provider if needed
              auth: {
                user: process.env.EMAIL_USER, // Set in .env file
                pass: process.env.EMAIL_PASS // Set in .env file
              }
            });

            // Email options
            let mailOptions = {
              from: process.env.EMAIL_USER,
              to: "kvbalasatish@gmail.com", // Change to recipient email
              subject: `${accountName} - Cafe Neuro Hot Drinks QR Code`,
              text: `Here is your QR Code for the Hot Drinks offer for ${accountName}.`,
              attachments: [
                {
                  filename: screenshotName.png,
                  path: screenshotPath
                }
              ]
            };

            // Send email
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
      return config; // Make sure to return config after modifying it
    },
    // retries: 2,
    baseUrl: 'https://octopus.energy/',
  },
});