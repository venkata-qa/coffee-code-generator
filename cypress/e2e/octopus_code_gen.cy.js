const dayjs = require('dayjs'); // For date formatting
const yaml = require('js-yaml');
require('dotenv').config(); // Load environment variables

describe('Activate Octopus Coffee Codes', () => {
  let accounts;


  beforeEach(() => {
    // Intercept and suppress Google Analytics requests
    cy.intercept('https://www.google-analytics.com/**', {}).as('googleAnalytics');
    cy.intercept('https://www.google.com/pagead/**', {}).as('googleAds');
  });

  // Load accounts from YAML fixture
  before(() => {
    cy.fixture('accounts.yaml').then((yamlText) => {
      accounts = yaml.load(yamlText).accounts;
    });
  });



  it('Should activate Café Nero offer and send QR code', () => {
    // Loop through each account
      // cy.wrap(accounts).each((account) => {
      // const { email, password, name } = account; // Destructure account properties

      cy.wrap(accounts).each((account) => {
        const { email, name, env_key } = account; // Destructure account properties

        const password = Cypress.env(env_key); // Retrieve password securely

        if (!password) {
          throw new Error(`❌ Password not found for ${name}. Make sure it's set in .env`);
        }
  
      cy.visit('https://octopus.energy/login/');

      // Log in using the account credentials
      cy.get('#id_username').clear().type(email);
      cy.get('#id_password').clear().type(password);
      // cy.get('#id_password').clear().type(password, { log: false });

      cy.get('#loginForm > div.form-group > button').click();
      // Navigate to Octoplus rewards
      cy.get("a[href*='octoplus'] button").should('be.visible').click();
      // Navigate to partner offers
      cy.get("a[href*='octoplus/partner/offers']").should('be.visible').click();
      // Find the "Claim Reward" button within the selected card
      cy.contains('h3', 'hot or cold drink').parent().parent().within(() => {
        cy.get('a[href*="/octoplus/partner/rewards/"]').then(($button) => {
          if ($button.length > 0 && !$button.hasClass('disabled')) {
            cy.wrap($button).click();
            cy.log(`✅ Claimed the Hot Drinks Offer for ${name}.`);
          } else {
            cy.log(`⚠️ Offer already claimed for ${name}.`);
          }
        });
      });
      // Create dynamic screenshot name
      const timestamp = dayjs().format('YYYY-MM-DD-HH');
      const screenshotName = `${name}_${timestamp}`;
      const screenshotsFolder = 'cypress/screenshots'; // Screenshots folder
      // Take a screenshot of the QR code
      cy.get('#barcode-wrapper').screenshot(screenshotName);
      // Send Email with Screenshot
      cy.task('sendEmail', { 
        screenshotName, 
        screenshotsFolder, 
        accountName: name 
      }).then((result) => {
        if (result.success) {
          cy.log(`✅ Email sent successfully for ${name}!`);
        } else {
          cy.log(`❌ Email failed for ${name}: ${result.message}`);
        }
      });

      cy.get("#logout-form > button").click();

      cy.wait(3000);

      cy.get(".global-header__login").should("be.visible");

      // // Clear cookies for all domains
      // cy.clearAllCookies(); 

      // // Verify all cookies are cleared
      // cy.getAllCookies().should('be.empty');
    });
  });
});