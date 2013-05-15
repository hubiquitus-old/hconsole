'use strict';

describe('Directive: chart', function () {
    beforeEach(module('hconsoleApp'));

    beforeEach(inject(function ($window) {
        $window.Highcharts = {
            Chart: function () {
                return {
                    series: [
                        {}
                    ]
                }
            },
            setOptions: function () {
            }
        };
    }));

    var element;

    it('should make hidden element visible', inject(function ($rootScope, $compile) {
        $rootScope.process = {loadAvg: [0]};

        element = angular.element('<div data-chart="loadAvg"></div>');
        element = $compile(element)($rootScope);
    }));
});
