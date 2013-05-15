'use strict';

angular.module('hconsoleApp').controller('ConnectCtrl', function ($rootScope, $location, $scope, hubiquitus) {
    delete $rootScope.url;
    $scope.error = $rootScope.error;

    $scope.login = 'urn:localhost:console';
    $scope.password = 'urn:localhost:console';
    $scope.channel = 'urn:localhost:pubChannel';
    $scope.url = '127.0.0.1:8080';

    $scope.visibility = 'show';
    $scope.connecting = false;

    hubiquitus.onConnected(function () {
        hubiquitus.subscribe($scope.channel, function (subscription) {
            if (subscription.status === 0) {
                $rootScope.url = $scope.url;
                $location.path('/node/' + $scope.channel);
            } else {
                $scope.connecting = false;
                $scope.error = subscription.result;
            }
        });
    });
    hubiquitus.onConnecting(function () {
        $scope.connecting = true;
    });
    hubiquitus.onError(function (message) {
        $scope.connecting = false;
        $scope.error = message;
    });
    hubiquitus.onDisconnected(function () {
        $scope.connecting = false;
        $scope.error = 'Disconnected';
    });

    $scope.connect = function () {
        delete $scope.error;
        // TODO filter
        if ($scope.login && $scope.password && $scope.channel && $scope.url) {
            hubiquitus.connect($scope.login, $scope.password, 'http://' + $scope.url);
        }
    };

    $scope.$on('$destroy', function () {
        hubiquitus.onConnected(undefined);
        hubiquitus.onConnecting(undefined);
        hubiquitus.onError(undefined);
        hubiquitus.onDisconnected(undefined);
    });

});
