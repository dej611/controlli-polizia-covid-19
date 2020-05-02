const cheerio = require('cheerio');

module.exports = async (crawler, mainURL, filteredDates) => {
    // go the page X
    const {html} = await crawler(mainURL);
    const $ = cheerio.load(html);

    // find the link for each missing date
    return $('tbody > tr > td > span.file > a')
        // Note: these are cheerio iterator methods which map old jQuery syntax
        .filter( (i, el) => {
            const $el = $(el);
            return /^(Controlli|Servizi)/.test($el.text())
        })
        .map((i, el) => {
            const $el = $(el);
            return {
                url: $el.attr('href'),
                dateString: $el.text().split(' ')[1]
            }
        })
        // exit cheerio realm
        .get() 
        // This is regular JS filter
        .filter( ({dateString}) => {
            return dateString in filteredDates;
        });
    }
