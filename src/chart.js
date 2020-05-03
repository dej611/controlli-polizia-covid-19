const { CanvasRenderService } = require('chartjs-node-canvas');
const {DATA_FORMAT} = require('./constants.js');
const {dayjsExtended} = require('./dates.js');


const width = 600;
const height = 400;
const canvasRenderService = new CanvasRenderService(width, height);

module.exports.drawSeriesChart = (series, root, titles) => {
    const labels = series.map( ({meta}) => meta.date );
    
    const datasets = Object.keys(series[0][root]);

    const colors = [
        'rgba(255,99,132,1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ];
    
    const configuration = {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets.map( (dataset, i) => ({
                label: titles[dataset],
                data: series.map( record => {
                    return record[root][dataset];
                }),
                backgroundColor: colors[i],
                borderColor: colors[i],
                fill: false,
                pointRadius: 3
            }))
        },
        options: {
            scales: {
                xAxes: [{
                    display: true,
                    // ticks: {
                    //     stepSize: 5
                    // }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    };
    
    return canvasRenderService.renderToBuffer(configuration);
}

function createPunchCardConfiguration(data, type){
    const labels = [
        "Lunedì",
        "Martedì",
        "Mercoledì",
        "Giovedì",
        "Venerdì",
        "Sabato",
        "Domenica"
      ];
    return {
        // The type of chart we want to create
        type: "bubble",
    
        // The data for our dataset
        data: {
          labels,
          datasets: data.map((dataset, i) => ({
            label: `${i ? "Attività" : "Persone"} ${type}`,
            backgroundColor: !i ? "#e41a1c" : "#377eb8",
            borderColor: !i ? "red" : "blue",
            data: dataset
          }))
        },
    
        // Configuration options go here
        options: {
          legend: {
            position: "bottom"
          },
          scales: {
            xAxes: [
              {
                type: "category",
                labels,
                color: "white"
              }
            ],
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                  display: false,
                  suggestedMax: 2,
                  color: "white"
                }
              }
            ]
          }
        }
      };
}

function fromSeriesToPunchCard(series, type){
    // for each record workout the week day of it and normalize
  let peopleMax = 0;
  let shopsMax = 0;
  const datasets = [[], []];
  for (const record of series) {
    const day = dayjsExtended(record.meta.date, "DD/MM/YYYY").day();
    const peopleValue = record.persone[type];
    peopleMax = Math.max(peopleMax, peopleValue);
    datasets[0][day] = datasets[0][day] || 0;
    datasets[0][day] += peopleValue;

    const shopsValue = record.attivita[type];
    shopsMax = Math.max(shopsMax, shopsValue);
    datasets[1][day] = datasets[1][day] || 0;
    datasets[1][day] += shopsValue;
  }

  // max bubble size is fixed as max size
  const BUBBLE_SIZE = 200;
  for (let i = 0; i < datasets[0].length; i++) {
    datasets[0][i] = {
      x: i,
      y: 1.5,
      r: (BUBBLE_SIZE * (datasets[0][i] / series.length)) / peopleMax
    };

    datasets[1][i] = {
      x: i,
      y: 0.5,
      r: (BUBBLE_SIZE * (datasets[1][i] / series.length)) / shopsMax
    };
  }
  return createPunchCardConfiguration(datasets, type);
}

module.exports.drawPunchcardChart = (series, type) => {
    return canvasRenderService.renderToBuffer(fromSeriesToPunchCard(series, type));
}