'use strict';

angular.module('hconsoleApp').controller('NodeCtrl', function ($rootScope, $location, $routeParams, $scope, hubiquitus) {
    if (!$routeParams.sessionid || !hubiquitus.isConnected()) {
        $location.path('/');
    }

    var pIndexes = {};
    $scope.processes = [];

    hubiquitus.onMessage(function (hMessage) {
        var peerInfo = hMessage.payload;

        var now = new Date().getTime();

        if (typeof pIndexes[peerInfo.peerPID] === 'undefined') {
            pIndexes[peerInfo.peerPID] = $scope.processes.length;
            $scope.processes.push({indexes: {}, actors: []});
        }

        var process = $scope.processes[pIndexes[peerInfo.peerPID]];
        process.pid = peerInfo.peerPID;
        process.memory = peerInfo.peerMemory;
        process.loadAvg = peerInfo.peerLoadAvg;

        if (process.cpuSeries) {
            console.log(process.cpuSeries.data.length);
            process.cpuSeries.addPoint([now, Math.round(peerInfo.peerLoadAvg[0] * 100) / 100], true, process.cpuSeries.data.length > 500);
        }
        if (process.heapSeries) {
            process.heapSeries.addPoint([now, Math.round(((100 / peerInfo.peerMemory.heapTotal) * peerInfo.peerMemory.heapUsed) * 100) / 100], true, process.heapSeries.data.length > 500);
        }

        if (typeof process.indexes[peerInfo.peerId] === 'undefined') {
            process.indexes[peerInfo.peerId] = process.actors.length;
            process.actors.push({});
        }

        var actor = process.actors[process.indexes[peerInfo.peerId]];
        actor.id = peerInfo.peerId;
        actor.status = peerInfo.peerStatus;
    });

});
