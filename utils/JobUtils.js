function shouldExcludeTitle(title) {
    if (!title) return true;

    const lowerTitle = title.toLowerCase().trim();

    const excludePatterns = [
        'job posting',
        'apply now',
        'apply',
        'quick apply',
        'easy apply',
        'click to apply'
    ];

    return excludePatterns.some(pattern => lowerTitle.includes(pattern) || lowerTitle === pattern);
}

function getFormattedDate() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

module.exports = {
    shouldExcludeTitle,
    getFormattedDate
};