const { chromium } = require('playwright');
const POManager = require('../pageobject/POManager');
const { shouldExcludeTitle, getFormattedDate } = require('../utils/JobUtils');
const { saveToCSV } = require('../utils/FileUtils');
const { jobTitles, locations } = require('../utils/config');

// Main function
async function scrapeJobs() {
    const browser = await chromium.launch({
        headless: true,
        slowMo: 100
    });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        viewport: { width: 1600, height: 1200 }
    });
    const page = await context.newPage();
    const poManager = new POManager(page);
    const dicePage = poManager.getDicePage();

    const jobs = [];

    console.log('Starting job search...');

    try {
        await scrapeDice(dicePage, jobs);
    } catch (error) {
        console.error(`Error scraping Dice:`, error);
    }

    // Save results to CSV
    saveToCSV(jobs, __dirname);

    await browser.close();
    console.log('Job search completed!');
}

// Updated Dice scraper function using POM
async function scrapeDice(dicePage, jobs) {
    for (const jobTitle of jobTitles) {
        for (const location of locations) {
            console.log(`Searching Dice for: ${jobTitle} in ${location.name}`);

            try {
                // Navigate to the search page
                await dicePage.navigate(jobTitle, location);

                // Check if we have results
                if (await dicePage.hasNoResults()) {
                    console.log(`No results found on Dice for ${jobTitle} in ${location.name}`);
                    continue;
                }

                // Find job cards
                const cardResult = await dicePage.findJobCards();

                if (cardResult.found) {
                    console.log(`Found job cards with selector: ${cardResult.selector}`);

                    // Extract job data with the working selector
                    const jobData = await dicePage.scrapeJobsFromCards(cardResult.selector);

                    // Filter the job data
                    const filteredJobData = jobData.filter(job =>
                        job.url && !shouldExcludeTitle(job.title)
                    );

                    // Add jobs with source information
                    jobs.push(...filteredJobData.map(job => ({
                        ...job,
                        source: 'Dice',
                        searchLocation: location.name,
                        searchQuery: jobTitle
                    })));

                    console.log(`Found ${filteredJobData.length} valid jobs (filtered from ${jobData.length})`);
                } else {
                    console.log(`No job cards found for ${jobTitle} in ${location.name}`);

                    // Last resort: try to find any links to job details
                    const jobLinks = await dicePage.fallbackJobLinkSearch();

                    // Use the improved filtering function
                    const filteredLinks = jobLinks.filter(job => !shouldExcludeTitle(job.title));

                    if (filteredLinks.length > 0) {
                        console.log(`Found ${filteredLinks.length} valid job links (filtered from ${jobLinks.length})`);
                        jobs.push(...filteredLinks.map(job => ({
                            ...job,
                            source: 'Dice',
                            searchLocation: location.name,
                            searchQuery: jobTitle
                        })));
                    }
                }

                await dicePage.page.waitForTimeout(2000);

            } catch (error) {
                console.error(`Error processing ${jobTitle} in ${location.name}:`, error);
            }
        }
    }
}

// Run the scraper
scrapeJobs().catch(console.error);