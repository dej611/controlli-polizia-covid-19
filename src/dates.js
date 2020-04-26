const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
const {DATE_FORMAT, FIRST_DAY} = require('./constants.js');

// Make dayjs understands various string formats
dayjs.extend(customParseFormat);

module.exports.sortByDate = (d1, d2) => {
    const dd1 = dayjs(d1, DATE_FORMAT);
    const dd2 = dayjs(d2, DATE_FORMAT);
    if(dd1.isSame(dd2)){
        return 0;
    }
    return dd1.isAfter(dd2) ? 1 : -1;
}

module.exports.getDaysToCheck = () => {
    // First dataset is 11 March 2020
    const firstDay = dayjs(FIRST_DAY);
    const lastDay = dayjs(); // today

    const UNIT = 'day';
    return [...Array(lastDay.diff(firstDay, UNIT))].map( (_, i) => firstDay.add(i, UNIT));
}

module.exports.getMissingDates = (daysToCheck, currentJSON) => {
    const datesMissing = [];
    for( const date of daysToCheck){
        const formattedDay = date.format(DATE_FORMAT);

        if(!currentJSON.lookup[formattedDay]){
            datesMissing.push({
                dotted: date.format('D.MM.YYYY'),
                date
            });
        }
    }

    return datesMissing.reduce( (lookup, {dotted, date}) => { 
        lookup[dotted] = date;
        return lookup;
    }, {});
}