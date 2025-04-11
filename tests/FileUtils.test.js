// tests/FileUtils.test.js
const fs = require('fs');
const path = require('path');
const { saveToCSV } = require('../utils/FileUtils');

jest.mock('fs');

describe('FileUtils', () => {
    test('saveToCSV() should write jobs to a CSV file', () => {
        const jobs = [
            { title: 'QA Engineer', url: 'http://example.com', company: 'Test Company' },
        ];
        const directory = '/test';

        saveToCSV(jobs, directory);

        expect(fs.writeFileSync).toHaveBeenCalledWith(
            expect.stringContaining(path.join(directory, 'qa_jobs_')),
            expect.stringContaining('QA Engineer')
        );
    });
});