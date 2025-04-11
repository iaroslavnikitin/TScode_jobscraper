// const { Given, When, Then } = require('@cucumber/cucumber');
// const { expect } = require('@playwright/test');

// Given('I set up job search parameters for {string}', async function (platform) {
//     this.platform = platform;
// });
//
// When('I search for jobs on Dice', async function () {
//     const dicePage = this.poManager.getDicePage();
//     await dicePage.navigate('qa engineer', { params: 'filters.workType=REMOTE' });
//     this.jobs = await dicePage.findJobCards();
// });
//
// Then('I should get job listings saved to CSV', async function () {
//     expect(this.jobs.length).toBeGreaterThan(0);
// });