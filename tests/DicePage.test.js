const DicePage = require('../pageobject/DicePage');

describe('DicePage', () => {
    let mockPage;
    let dicePage;

    beforeEach(() => {
        mockPage = {
            goto: jest.fn(),
            waitForTimeout: jest.fn(),
            evaluate: jest.fn(),
        };
        dicePage = new DicePage(mockPage);
    });

    test('navigate() should call page.goto with correct URL', async () => {
        const jobTitle = 'qa engineer';
        const location = {
            params: 'adminDistrictCode=CA&countryCode=US&latitude=37.36883&location=Sunnyvale%2C+CA%2C+USA&locationPrecision=City&longitude=-122.0363496',
        };

        await dicePage.navigate(jobTitle, location);

        expect(mockPage.goto).toHaveBeenCalledWith(
            expect.stringContaining('https://www.dice.com/platform/jobs'),
            { waitUntil: 'domcontentloaded' }
        );
        expect(mockPage.waitForTimeout).toHaveBeenCalledWith(5000);
    });

    test('hasNoResults() should return true if no results selector is found', async () => {
        mockPage.evaluate.mockResolvedValue(true);

        const result = await dicePage.hasNoResults();

        expect(result).toBe(true);
        expect(mockPage.evaluate).toHaveBeenCalledWith(expect.any(Function), dicePage.selectors.noResults);
    });
});