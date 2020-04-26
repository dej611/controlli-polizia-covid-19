const crawler = require("crawler-request");
// Local deps
const getLinksFromPage = require('./page.js');
const getContentFromRemoteURL = require('./pdfParser.js');
const {INDEX_URL, JSON_PATH, CSV_PATH} = require('./constants.js');
const {getDaysToCheck, getMissingDates, sortByDate} = require('./dates.js');
const drawSeriesChart = require('./chart.js');
const {clone, logger, getJSON, writeJSON, writeCSV, writeChart, createCSV, fileExists} = require('./util.js');

const currentJSON = getJSON('../jsons/' + JSON_PATH);

// Look in the cache and workout the missing dates
const daysToCheck = getDaysToCheck();
logger(`Days to check: ${daysToCheck.length}`);

const missingDates = getMissingDates(daysToCheck, currentJSON);
logger(`Missing dates to fetch: 
    ${Object.keys(missingDates).join(', ') || 'All updated'}
`);

// Clone the JSON file to write
const newJson = clone(currentJSON);

(async () => {
    const links = await getLinksFromPage(
        crawler,
        INDEX_URL,
        missingDates
    );

    // fetch each URL now
    for ( const {url, dateString} of links){
        logger(`Fetching data for the day ${dateString}`);
        const json = await getContentFromRemoteURL(crawler, url);
        logger(`Fetching data for the day ${dateString} completed`);

        // save the JSON
        const date = missingDates[dateString];
        newJson.lookup[date.format('DD/MM/YYYY')] = json;
    }

    // put all the series into an array
    newJson.series = Object.keys(newJson.lookup)
        .map( dateString => ({...newJson.lookup[dateString], meta: { date: dateString}}))
        .sort( (dt1, dt2) => {
            return sortByDate(dt1.meta.date, dt2.meta.date);
        });
    
    // write the total here
    writeJSON('./jsons/' + JSON_PATH, newJson);
    writeCSV('./csvs/' + CSV_PATH, createCSV(newJson.series));
    logger(`${JSON_PATH} and ${CSV_PATH} files updated`);

    for( const {meta, ...rest} of newJson.series){
        const camelCaseDateString = `data_${meta.date.replace(/\//g, '_')}`;
        if(!fileExists(`./jsons/${camelCaseDateString}.json`)){
            // now for each entry in the series write a json file
            writeJSON(`./jsons/${camelCaseDateString}.json`, rest);

            // same for csvs
            writeCSV(`./csvs/${camelCaseDateString}.csv`, createCSV([rest]));
        }
    }

    // Produce a couple of charts to attach to the README file

    const personeSvg = await drawSeriesChart(newJson.series, 'persone', {
        'controllate': 'Totale controlli',
        'sanzionate': 'Persone sanzionate',
        'denunciateFalseDichiarazione': 'Persone denunciate ex art. 495 e 496 C.P.',
        'denunciateQuarantena': 'Persone denunciate ex art. 260 r.d. 27.07.1934 n. 1265'
    });
    writeChart('./charts/series1.png', personeSvg);

    const attivitaSvg = await drawSeriesChart(newJson.series, 'attivita', {
        'controllate': 'Totale controlli',
        'sanzionate': 'Attività sanzionate',
        'chiusuraProvvisoria': 'Chiusura provvisoria di attività ex art. 4, comma 4 DL 25.03.2020',
        'chiusuraTotale': 'Chiusura di Attività o esercizi ex art. 4, comma 2, DL 25.03.2020'
    });
    writeChart('./charts/series2.png', attivitaSvg);

    logger(`All updated`);
})();