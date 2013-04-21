'use strict';

angular.module('hconsoleApp').controller('NavbarCtrl', function ($rootScope, $location, $scope, hubiquitus) {
    $scope.disconnect = function ($event) {
        $event.preventDefault();
        hubiquitus.disconnect();
        $location.path('/');
    };
});
