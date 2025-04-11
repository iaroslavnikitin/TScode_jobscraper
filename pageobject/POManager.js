const DicePage = require('./DicePage');

class POManager {
    constructor(page) {
        this.page = page;
        this.dicePage = new DicePage(page);
    }

    getDicePage() {
        return this.dicePage;
    }
}

module.exports = POManager;