'use strict';

angular.module('hconsoleApp').controller('PhysicCtrl', function ($rootScope, $scope, dataTree, TreeGraph) {
	dataTree.testConnect();

    // Initialisation du graphique
    var Graph = new TreeGraph('#graphSpace', dataTree.physical.data).draw();

    dataTree.physical.on('update', Graph.draw);

    $scope.$on('$destroy', function () {
        dataTree.physical.onUpdate = null;
    });
});