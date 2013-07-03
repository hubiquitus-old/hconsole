'use strict';

angular.module('hconsoleApp').controller('NavbarCtrl', function ($rootScope, $location, $scope, hubiquitus) {
    $scope.disconnect = function ($event) {
        $event.preventDefault();
        hubiquitus.disconnect();
        $location.path('/');
    };
    $scope.nodeView = function ($event) {
        $event.preventDefault();
        $location.path('/node/' + hubiquitus.getChannel());
    };
    $scope.graphView = function ($event) {
        $event.preventDefault();
        $location.path('/graph/' + hubiquitus.getChannel());
    };
});
