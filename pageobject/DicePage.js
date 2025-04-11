// pageobject/DicePage.js
class DicePage {
    constructor(page) {
        this.page = page;
        this.baseUrl = 'https://www.dice.com/platform/jobs';
        this.selectors = {
            jobCards: [
                '.search-card',
                'dhi-search-card',
                '.search-result',
                '.job-listing'
            ],
            noResults: '.no-results',
            titleSelectors: [
                '[data-cy="card-title-link"]',
                'a[href*="/job-detail/"]',
                '.card-title-link',
                '.title a',
                'h5 a',
                'a.job-title'
            ],
            companySelectors: [
                '[data-cy="search-result-company-name"]',
                '.company-name',
                '.employer',
                '[data-automation="company-name"]'
            ],
            locationSelectors: [
                '[data-cy="search-result-location"]',
                '.location',
                '.search-result-location',
                '[data-automation="job-location"]'
            ],
            dateSelectors: [
                '[data-cy="card-date"]',
                '.posted-date',
                '.date',
                '.time-ago'
            ],
            salarySelectors: [
                '.salary',
                '.compensation',
                '.devflex-salary-container',
                '[data-automation="job-salary"]'
            ]
        };
    }

    async navigate(jobTitle, location) {
        const searchQuery = encodeURIComponent(jobTitle);
        const url = `${this.baseUrl}?${location.params}&filters.postedDate=THREE&pageSize=100&q=${searchQuery}`;
        await this.page.goto(url, {waitUntil: 'domcontentloaded'});
        await this.page.waitForTimeout(5000);
    }

    async hasNoResults() {
        return await this.page.evaluate((sel) => {
            return !!document.querySelector(sel);
        }, this.selectors.noResults);
    }

    async findJobCards() {
        for (const selector of this.selectors.jobCards) {
            const hasCards = await this.page.evaluate((sel) => {
                return document.querySelectorAll(sel).length > 0;
            }, selector);

            if (hasCards) {
                return {
                    found: true,
                    selector
                };
            }
        }
        return { found: false };
    }

    async scrapeJobsFromCards(selector) {
        return await this.page.evaluate((sel, titleSelectors, companySelectors,
                                         locationSelectors, dateSelectors, salarySelectors) => {
                const cards = Array.from(document.querySelectorAll(sel));

                return cards.map(card => {
                    // Title and URL extraction
                    let title = 'Not available';
                    let url = '';

                    for (const titleSel of titleSelectors) {
                        const titleElement = card.querySelector(titleSel);
                        if (titleElement) {
                            title = titleElement.textContent.trim();
                            url = titleElement.href;
                            break;
                        }
                    }

                    if (!url) {
                        const anyJobLink = card.querySelector('a[href*="job-detail"]');
                        if (anyJobLink) {
                            url = anyJobLink.href;
                            if (!title || title === 'Not available') {
                                title = anyJobLink.textContent.trim() || 'Job Posting';
                            }
                        }
                    }

                    // Company extraction
                    let company = 'Not available';
                    for (const companySel of companySelectors) {
                        const element = card.querySelector(companySel);
                        if (element) {
                            company = element.textContent.trim();
                            break;
                        }
                    }

                    // Location extraction
                    let location = 'Not available';
                    for (const locationSel of locationSelectors) {
                        const element = card.querySelector(locationSel);
                        if (element) {
                            location = element.textContent.trim();
                            break;
                        }
                    }

                    // Posted date extraction
                    let postedDate = 'Not available';
                    for (const dateSel of dateSelectors) {
                        const element = card.querySelector(dateSel);
                        if (element) {
                            postedDate = element.textContent.trim();
                            break;
                        }
                    }

                    // Work type detection
                    let workType = 'On-site';
                    const cardText = card.textContent.toLowerCase();
                    if (cardText.includes('remote')) {
                        workType = 'Remote';
                    } else if (cardText.includes('hybrid')) {
                        workType = 'Hybrid';
                    }

                    // Compensation extraction
                    let compensation = 'Not available';
                    for (const salarySel of salarySelectors) {
                        const element = card.querySelector(salarySel);
                        if (element) {
                            compensation = element.textContent.trim();
                            break;
                        }
                    }

                    return {
                        title,
                        url,
                        company,
                        location,
                        workType,
                        compensation,
                        postedDate
                    };
                });
            }, selector,
            this.selectors.titleSelectors,
            this.selectors.companySelectors,
            this.selectors.locationSelectors,
            this.selectors.dateSelectors,
            this.selectors.salarySelectors);
    }

    async fallbackJobLinkSearch() {
        return await this.page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a[href*="job-detail"]'));
            return links.map(link => {
                return {
                    title: link.textContent.trim() || 'Job Posting',
                    url: link.href,
                    company: 'Not available',
                    location: 'Not available',
                    workType: 'Not available',
                    compensation: 'Not available',
                    postedDate: 'Not available'
                };
            });
        });
    }
}

module.exports = DicePage;