const {drawSeriesChart, drawPunchcardChart} = require('./chart.js');
const {writeChart} = require('./util.js');

module.exports = async (series) => {
    // Time Series charts
    const personeSvg = await drawSeriesChart(series, 'persone', {
        'controllate': 'Totale controlli Persone',
        'sanzionate': 'Persone sanzionate',
        'denunciateFalseDichiarazione': 'Persone denunciate ex art. 495 e 496 C.P.',
        'denunciateQuarantena': 'Persone denunciate ex art. 260 r.d. 27.07.1934 n. 1265'
    });
    writeChart('./charts/series1.png', personeSvg);

    const attivitaSvg = await drawSeriesChart(series, 'attivita', {
        'controllate': 'Totale controlli Attività',
        'sanzionate': 'Attività sanzionate',
        'chiusuraProvvisoria': 'Chiusura provvisoria di attività ex art. 4, comma 4 DL 25.03.2020',
        'chiusuraTotale': 'Chiusura di Attività o esercizi ex art. 4, comma 2, DL 25.03.2020'
    });
    writeChart('./charts/series2.png', attivitaSvg);

    // Punchcard charts here
    for (const type of ["controllate", "sanzionate"]) {
        const punchcard = await drawPunchcardChart(series, type);
        writeChart(`./charts/punchcard_${type}.png`, punchcard);
    }
}