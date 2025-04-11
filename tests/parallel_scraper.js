const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const { chromium } = require('playwright');
const POManager = require('../pageobject/POManager');
const { shouldExcludeTitle } = require('../utils/JobUtils');
const { saveToCSV } = require('../utils/FileUtils');
const path = require('path');
const os = require('os');

// Number of worker threads to create (default to CPU count)
const NUM_WORKERS = process.env.NUM_WORKERS || os.cpus().length;

// Main thread code
async function runParallel() {
    if (!isMainThread) return;

    const { jobTitles, locations } = require('../utils/config');

    console.log(`Starting job search with ${NUM_WORKERS} workers...`);

    // Prepare work items - each is a combination of job title and location
    const workItems = [];
    for (const jobTitle of jobTitles) {
        for (const location of locations) {
            workItems.push({ jobTitle, location });
        }
    }

    // Distribute work evenly across workers
    const itemsPerWorker = Math.ceil(workItems.length / NUM_WORKERS);
    const workerPromises = [];
    const allJobs = [];

    for (let i = 0; i < NUM_WORKERS; i++) {
        const start = i * itemsPerWorker;
        const end = Math.min(start + itemsPerWorker, workItems.length);
        const workerItems = workItems.slice(start, end);

        if (workerItems.length === 0) continue;

        const promise = new Promise((resolve, reject) => {
            const worker = new Worker(__filename, {
                workerData: { workItems: workerItems }
            });

            worker.on('message', (jobs) => {
                allJobs.push(...jobs);
                resolve();
            });

            worker.on('error', reject);
            worker.on('exit', (code) => {
                if (code !== 0) {
                    reject(new Error(`Worker stopped with exit code ${code}`));
                }
            });
        });

        workerPromises.push(promise);
    }

    await Promise.all(workerPromises);

    // Save all collected jobs to a single CSV
    console.log(`Total jobs found: ${allJobs.length}`);
    saveToCSV(allJobs, path.resolve(__dirname));
    console.log('Job search completed!');
}

// Worker thread code
async function workerProcess() {
    if (isMainThread) return;

    const { workItems } = workerData;
    const jobs = [];

    console.log(`Worker started with ${workItems.length} tasks`);

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

    try {
        for (const { jobTitle, location } of workItems) {
            console.log(`Worker searching Dice for: ${jobTitle} in ${location.name}`);

            try {
                // Navigate to search page
                await dicePage.navigate(jobTitle, location);

                // Check if we have results
                if (await dicePage.hasNoResults()) {
                    console.log(`No results found on Dice for ${jobTitle} in ${location.name}`);
                    continue;
                }

                // Find job cards
                const cardResult = await dicePage.findJobCards();

                if (cardResult.found) {
                    const jobData = await dicePage.scrapeJobsFromCards(cardResult.selector);

                    // Filter job data
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

                    console.log(`Found ${filteredJobData.length} valid jobs`);
                } else {
                    // Fallback method
                    const jobLinks = await dicePage.fallbackJobLinkSearch();
                    const filteredLinks = jobLinks.filter(job => !shouldExcludeTitle(job.title));

                    if (filteredLinks.length > 0) {
                        jobs.push(...filteredLinks.map(job => ({
                            ...job,
                            source: 'Dice',
                            searchLocation: location.name,
                            searchQuery: jobTitle
                        })));
                    }
                }

                await page.waitForTimeout(2000);
            } catch (error) {
                console.error(`Error processing ${jobTitle} in ${location.name}:`, error);
            }
        }
    } finally {
        await browser.close();
    }

    // Send results back to main thread
    parentPort.postMessage(jobs);
}

// Execute the appropriate function based on thread type
if (isMainThread) {
    runParallel().catch(console.error);
} else {
    workerProcess().catch(console.error);
}