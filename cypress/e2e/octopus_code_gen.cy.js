const dayjs = require('dayjs'); // For date formatting
const yaml = require('js-yaml');

describe('Activate Octopus Coffee Codes', () => {
  let accounts;

  // Load accounts from YAML fixture
  before(() => {
    cy.fixture('accounts.yaml').then((yamlText) => {
      accounts = yaml.load(yamlText).accounts;
    });
  });

  it('Should activate Café Nero offer and send QR code', () => {
    // Loop through each account
    accounts.forEach((account) => {
      const { email, password, name } = account; // Destructure account properties

      cy.visit('https://octopus.energy/login/');

      // Log in using the account credentials
      cy.get('#id_username').clear().type(email);
      cy.get('#id_password').clear().type(password);
      cy.get('#loginForm > div.form-group > button').click();

      cy.wait(9000);

      // Navigate to Octoplus rewards
      cy.get("a[href*='octoplus'] button").should('be.visible').click();

      cy.wait(9000);

      // Navigate to partner offers
      cy.get("a[href*='octoplus/partner/offers']").should('be.visible').click();

      cy.wait(9000);

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

      cy.wait(9000); // Wait for offer page to load

      // Create dynamic screenshot name
      const timestamp = dayjs().format('YYYY-MM-DD-HH');
      const screenshotName = `${name}_${timestamp}`;
      const screenshotsFolder = 'cypress/screenshots'; // Screenshots folder

      // Take a screenshot of the QR code
      cy.get('#barcode-wrapper').screenshot(screenshotName);

      cy.wait(9000); // Wait for offer page to load

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

      // // Clear cookies for all domains
      // cy.clearAllCookies(); 

      // // Verify all cookies are cleared
      // cy.getAllCookies().should('be.empty');
    });
  });
});