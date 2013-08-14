'use strict';

angular.module('hconsoleApp').controller('LogicCtrl', function ($rootScope, $scope, dataTree, CircleGraph) {
    dataTree.testConnect();

    // Initialisation du graphique
	var Graph = new CircleGraph('#graphSpace', dataTree.logical.data).draw();
    dataTree.logical.on('update', Graph.draw);

    $scope.$on('$destroy', function () {
        dataTree.logical.onUpdate = null;
    });
});