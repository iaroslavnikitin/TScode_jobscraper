const { shouldExcludeTitle } = require('../utils/JobUtils');

describe('JobUtils', () => {
    test('shouldExcludeTitle() should return true for excluded titles', () => {
        expect(shouldExcludeTitle('Apply Now')).toBe(true);
        expect(shouldExcludeTitle('Job Posting')).toBe(true);
    });

    test('shouldExcludeTitle() should return false for valid titles', () => {
        expect(shouldExcludeTitle('QA Engineer')).toBe(false);
    });
});