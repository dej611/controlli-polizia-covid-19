const { CanvasRenderService } = require('chartjs-node-canvas');
const dayjs = require('dayjs');

const width = 600;
const height = 400;
const canvasRenderService = new CanvasRenderService(width, height);

module.exports = (series, root, titles) => {
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