'use strict';

angular.module('hconsoleApp').directive('chart', function (highcharts) {
    return {
        restrict: 'A',
        link: function postLink(scope, element, attrs) {
            if (attrs.chart === 'loadAvg' || attrs.chart === 'memory') {
                var now = new Date().getTime();

                var chart = new highcharts.Chart({
                    chart: {
                        renderTo: element.context,
                        events: {},
                        type: 'spline',
                        width: 360,
                        height: 130
                    },
                    colors: ['#3D96AE'],
                    credits: {enabled: false},
                    legend: {enabled: false},
                    tooltip: {enabled: false},
                    title: {
                        text: attrs.chart === 'loadAvg' ? '% CPU' : '% HEAP',
                        style: {fontSize: '10px'}
                    },
                    yAxis: {
                        title: {text: '', style: {fontSize: 0}},
                        min: 0,
                        gridLineColor: '#dddddd'
                    },
                    xAxis: {
                        type: 'datetime',
                        tickPixelInterval: 150,
                        dateTimeLabelFormats: {month: '%e. %b', year: '%b'},
                        lineColor: '#dddddd'
                    },
                    plotOptions: {
                        spline: {
                            lineWidth: 2,
                            shadow: false,
                            marker: {enabled: false},
                            enableMouseTracking: false
                        }
                    },
                    series: [
                        {data: [
                            attrs.chart === 'loadAvg' ?
                                [now, Math.round(scope.process.loadAvg[0] * 100) / 100] :
                                [now, Math.round(((100 / scope.process.memory.heapTotal) * scope.process.memory.heapUsed) * 100) / 100]
                        ]}
                    ]
                });

                if (attrs.chart === 'loadAvg') {
                    scope.process.cpuSeries = chart.series[0];
                } else {
                    scope.process.heapSeries = chart.series[0];
                }
            }
        }
    };
});
