const scrapeJobs = require('../tests/main');

jest.mock('playwright', () => ({
    chromium: {
        launch: jest.fn(() => ({
            newContext: jest.fn(() => ({
                newPage: jest.fn(() => ({
                    goto: jest.fn(),
                    close: jest.fn(),
                })),
            })),
            close: jest.fn(),
        })),
    },
}));

describe('Main Script', () => {
    test('scrapeJobs() should run without errors', async () => {
        await expect(scrapeJobs()).resolves.not.toThrow();
    });
});