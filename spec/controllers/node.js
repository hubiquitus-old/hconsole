'use strict';

describe('Controller: NodeCtrl', function () {

    // load the controller's module
    beforeEach(module('hConsoleApp'));

    var NodeCtrl,
        scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        NodeCtrl = $controller('NodeCtrl', {
            $scope: scope
        });
    }));

});
