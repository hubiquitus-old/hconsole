'use strict';

var app = angular.module('hconsoleApp', []).config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'views/connect.html',
            controller: 'ConnectCtrl'
        })
        .when('/node/:sessionid', {
            templateUrl: 'views/node.html',
            controller: 'NodeCtrl'
        })
        .when('/physic/:sessionid', {
            templateUrl: 'views/physicalDistribution.html',
            controller: 'PhysicCtrl'
        })
        .when('/logic/:sessionid', {
            templateUrl: 'views/logicalDistribution.html',
            controller: 'LogicCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });

});

app.factory('highcharts', function ($window) {
    $window.Highcharts.setOptions({
        global: {
            useUTC: false
        }
    });
    return $window.Highcharts;
});

