describe('Activate Octopus Offer and Save to Simplenote', () => {

    it('Should activate Café Nero offer and save the QR code to Simplenote', () => {
      
      // Visit Octopus Energy offers page
    //   cy.visit('https://octopus.energy/dashboard/new/accounts/A-32A59FE1/octoplus/');


      cy.visit('https://octopus.energy/login/');

      cy.get('#id_username').clear().type('kvbalasatish@gmail.com');

      cy.get('#id_password').clear().type('Platform@21');

      cy.get('#loginForm > div.form-group > button').click();


      cy.wait(9000);

      cy.get("a[href*='octoplus'] button").should('be.visible').click();


      cy.wait(9000);

      cy.get("a[href*='octoplus/partner/offers']").should('be.visible').click();

      cy.wait(9000);

  
      cy.contains('h3', 'hot or cold drink').parent().parent().within(() => {

        // Find the "Claim Reward" button within the selected card
        cy.get('a[href*="/octoplus/partner/rewards/"]').then(($button) => {
          if ($button.length > 0 && !$button.hasClass('disabled')) {
            // If the button exists and is enabled, click it
            cy.wrap($button).click();
            cy.log('✅ Claimed the Hot Drinks Offer.');
          } else {
            // If button is not enabled, log a message
            cy.log('⚠️ Hot Drinks Offer already claimed or unavailable.');
          }
        });
  
      });    

      cy.wait(9000); // Wait for offer page to load

      const screenshotPath = 'cypress/screenshots/qr-code.png';
      cy.get('#barcode-wrapper').screenshot('qr-code');

      cy.wait(9000); // Wait for offer page to load


     // Send Email with Screenshot
     cy.task('sendEmail', { screenshotPath }).then((result) => {
        if (result.success) {
          cy.log('✅ Email sent successfully!');
        } else {
          cy.log('❌ Email failed: ' + result.message);
        }
      });
  });

});

  