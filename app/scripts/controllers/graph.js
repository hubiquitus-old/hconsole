'use strict';

angular.module('hconsoleApp').controller('GraphCtrl', function ($rootScope, $location, $routeParams, $scope, hubiquitus) {
	if (!$routeParams.sessionid || !hubiquitus.isConnected()) {
        $location.path('/');
    }

	var Graph = hubiquitus.createCircleGraph('#graphSpace', hubiquitus.ressourceTree.data);

    hubiquitus.onMessage(function (hMessage) {
    	Graph.draw();
    });

    hubiquitus.onError(function (message) {
        $rootScope.state = 'error';
        $rootScope.error = message;
        $location.path('/');
    });

    hubiquitus.onDisconnected(function () {
        $rootScope.state = 'disconnected';
        delete $rootScope.error;
        $location.path('/');
    });

    $scope.$on('$destroy', function () {
        hubiquitus.onMessage(undefined);
        hubiquitus.onError(undefined);
        hubiquitus.onDisconnected(undefined);
    });
});