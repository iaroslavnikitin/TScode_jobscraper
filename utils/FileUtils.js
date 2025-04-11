const fs = require('fs');
const path = require('path');

function saveToCSV(jobs, directory) {
    if (jobs.length === 0) {
        console.log('No jobs found!');
        return;
    }

    const headers = ['Job Title', 'Job URL', 'Company', 'Work Type', 'Location', 'Compensation', 'Posted Date', 'Source', 'Search Location', 'Search Query'];
    const rows = jobs.map(job => [
        job.title,
        job.url,
        job.company,
        job.workType,
        job.location,
        job.compensation,
        job.postedDate,
        job.source,
        job.searchLocation,
        job.searchQuery
    ]);

    // Add headers as first row
    rows.unshift(headers);

    // Convert to CSV format
    const csvContent = rows
        .map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
        .join('\n');

    // Get formatted date
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    // Create filename with current date
    const fileName = `qa_jobs_${formattedDate}.csv`;

    // Save file
    fs.writeFileSync(path.join(directory, fileName), csvContent);
    console.log(`Saved ${jobs.length} jobs to ${fileName}`);
}

module.exports = {
    saveToCSV
};