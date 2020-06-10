const cheerio = require('cheerio');
const {dayjsExtended} = require('./dates.js');

function extractDateString($el){
    // try with the split technique first
    let dateString = $el.text().split(' ')[1];
    // is it a date?
    if(dayjsExtended(dateString, 'DD.MM.YYYY').isValid()){
        return dateString;
    }
    // otherwise try with some regexp and localization technique
    const matches = $el.text().match(/(.*)del(l\'|\s)(.*)/)
    if(matches){
        const normalizedString = matches[2].replace('°', '');
        dateString = dayjsExtended(normalizedString, 'D MMMM YYYY', 'it');
        if(dateString.isValid()){
            return dateString.format('D.MM.YYYY');
        }
    }
    return null;
}

module.exports = async (crawler, mainURL, filteredDates) => {
    // go the page X
    const {html} = await crawler(mainURL);
    const $ = cheerio.load(html);

    // find the link for each missing date
    return $('tbody > tr > td > span.file > a')
        // Note: these are cheerio iterator methods which map old jQuery syntax
        .filter( (i, el) => {
            const $el = $(el);
            return /^(Controlli|Servizi)/.test($el.text()) && 
                  // skip cumulative reports
                  !/^report/.test($el.attr('title'))
        })
        .map((i, el) => {
            const $el = $(el);
            return {
                url: $el.attr('href'),
                dateString: extractDateString($el)
            }
        })
        // exit cheerio realm
        .get() 
        // This is regular JS filter
        .filter( ({dateString}) => {
            return dateString in filteredDates;
        });
    }
