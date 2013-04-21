'use strict';

describe('Controller: ConnectCtrl', function () {

    // load the controller's module
    beforeEach(module('hConsoleApp'));

    var ConnectCtrl,
        scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        ConnectCtrl = $controller('ConnectCtrl', {
            $scope: scope
        });
    }));

});
