const {writeFileSync, existsSync} = require('fs');

function cheapClone(json){
    return JSON.parse(JSON.stringify(json));
}

const ENABLE_LOGGER = !process.env.DISABLE_LOGGER;

function logger(string){
    if(ENABLE_LOGGER){
        console.log(string);
    }
}

function getJSON(path){
    let currentJSON;
    try {
        currentJSON = require(path);
    } catch(e){
        logger(`Problem encountered when parsing the JSON file: ${e.toString()}`);
        // In case there's a problem with the file, create a JSON on the fly
        currentJSON = { series: {} };
    }
    return currentJSON;
}

function writeJSON(JSON_PATH, json){
    return writeFileSync(JSON_PATH, JSON.stringify(json, null, 2));
}

function writeCSV(CSV_PATH, csv){
    return writeFileSync(CSV_PATH, csv);
}

function writeChart(PATH, chart){
    return writeFileSync(PATH, chart);
}

function createCSV(json){
    const header = Object.keys(json[0]).flatMap( (root) => {
        return Object.keys(json[0][root]).map( prop => `${root}.${prop}`);
    }).join(', ');
    const rows = json.map( row => {
        return Object.keys(row).flatMap( (root) => {
            return Object.keys(row[root]).map( prop => row[root][prop]);
        }).join(', ');
    });
    return [header, ...rows].join('\n');
}

function fileExists(URI){
    return existsSync(URI);
}

module.exports.clone = cheapClone;
module.exports.logger = logger;
module.exports.getJSON = getJSON;
module.exports.writeJSON = writeJSON;
module.exports.writeCSV = writeCSV;
module.exports.writeChart = writeChart;
module.exports.createCSV = createCSV;
module.exports.fileExists = fileExists;