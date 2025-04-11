const { Before, After } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const POManager = require('../../pageobject/POManager');
const { jobTitles, locations } = require('../../utils/config');

Before(async function() {
    const browser = await chromium.launch({
        headless: false,
        slowMo: 100
    });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        viewport: { width: 1600, height: 1200 }
    });
    const page = await context.newPage();

    this.browser = browser;
    this.page = page;
    this.poManager = new POManager(page);
    this.jobTitles = jobTitles;
    this.locations = locations;
    this.jobs = [];
});

After(async function() {
    await this.browser.close();
});