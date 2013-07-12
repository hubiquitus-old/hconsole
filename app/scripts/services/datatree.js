'use strict';

angular.module('hconsoleApp').factory('dataTree', function ($rootScope, $routeParams, $location, hubiquitus) {

    // Prototypes
    Array.prototype.each = function (func) {
        for (var i = 0; i < this.length; ++i) {
            func.call(this, this[i]);
        }
    };
    Array.prototype.search = function (testFunc, i) {
        i = (typeof i === 'number' ? i : 0);
        return typeof testFunc != 'function' ?
            null :
            (
                testFunc(this[i], i) ?
                    i :
                    (
                        i + 1 < this.length ?
                            this.search(testFunc, i + 1) :
                            null
                    )
            );
    };
    Array.prototype.searchAll = function (testFunc, i) {
        var ret = [];

        i = this.search(testFunc, i || 0);
        while (i != null) {
            ret.push(i);
            i = this.search(testFunc, i + 1);
        }
        return ret;
    };
    Array.prototype.find = function (value, i) {
        return this.search(function (currentVal) { return currentVal === value }, i);
    };
    Array.prototype.findAll = function (value, i) {
        return this.searchAll(function (currentVal) { return currentVal === value }, i);
    };
    Array.prototype.remove =  function (value, i) {
        return (i = this.find(value, i)) != null ? this.splice(i, 1) : null;
    };
    Array.prototype.removeAll =  function (value, i) {
        var ret = null;
        while ( (i = this.find(value, i)) != null ) ret = this.splice(i, 1)[0];
        return ret;
    };
    Array.prototype.last = function () {
        return this[this.length];
    };
    Array.prototype.exe = function (instance, args) {
        this.each(function (value) {
            if (typeof value === 'function') {
                value.apply(instance, args);
            }
        });
    };
    Function.prototype.caps = function (instance, args) {
        var self = this;
        return function () {
            return self.apply(instance || this, args || arguments);
        };
    };


    var EventSupport = function (instance, params) {
        var bindedHandler = {}, eventName;

        for (eventName in params) {
            bindedHandler[eventName] = [];
            this[eventName] = Array.prototype.exe.caps(bindedHandler[eventName], [instance, arguments]);
        }

        instance.on = function (eventName, handlerFunc) {
            if (this === instance && params[eventName] && typeof handlerFunc === 'function') {
                bindedHandler[eventName].push(handlerFunc);
            }
        };
        instance.off = function (eventName, handlerFunc) {
            if (this === instance && params[eventName] && typeof handlerFunc === 'function') {
                bindedHandler[eventName].remove(handlerFunc);
            }
        };
    };

    // Classe d'arbre de données
    var TreeElmt = function (key, data) {
        var childDico = {};

        this.data = data ? data : {name : key};

        // Valeurs par Défaut.
        if (!this.data.name) {
            this.data.name = key;
        }
        if (!this.data.title) {
            this.data.title = key;
        }

        if (!this.data.size) {
            this.data.size = 1;
        }

        this.getDico = function () {
            return childDico;
        };

        this.eHandler = new EventSupport(this, {
            'update' : true
        });
    };
    // Créer ou retrouver un élément générique enfant
    TreeElmt.prototype.elmt = function (childKey, childData) {
        var childElmt,
            parent = this,
            childDico = this.getDico();

        if (!childDico[childKey]) {
            childElmt = new TreeElmt(childKey, childData);
            childDico[childKey] = childElmt;
            childElmt.on('update', parent.eHandler.update);

            if (!this.data.children) {
                this.data.children = [];
            }
            this.data.children.push(childElmt.data);
            this.eHandler.update();
        }
        else {
            childElmt = childDico[childKey];
        }

        return childElmt;
    };
    // Créer ou retrouver une branche enfant
    TreeElmt.prototype.branch = TreeElmt.prototype.elmt;
    // Créer ou retrouver une feuille enfant
    TreeElmt.prototype.leaf = TreeElmt.prototype.elmt;
    // Couper une branche ou une feuille
    TreeElmt.prototype.cut = function ( /* Leaf path in data tree */ ) {
        var args = Array.prototype.slice.call(arguments),
            childKey = args.shift(),
            childDico = this.getDico(),
            childElmt = childDico[childKey],
            firstCall = false;

        if (args.last() != true) {
            args.push(true);
            firstCall = true;
        }

        if (childElmt) {
            if ((childElmt.data.children && !childElmt.data.children.length) || !childElmt.cut.apply(childElmt, args)) {
                //console.log('cut', childKey);
                childDico[childKey] = undefined;
                this.data.children.remove(childElmt.data);
            }
        }
        this.eHandler.update();

        return (this.data.children && this.data.children.length > 0);
    };


    return {
        init : function () {
            var dataTree = this;
            // Root de l'arbre logique
            dataTree.logical = new TreeElmt("Ubiquitus");
            // Root de l'arbre physique
            dataTree.physical = new TreeElmt("Ubiquitus");


            hubiquitus.onMessage((function () {
                var actorTypeRef = {
                    "session" : 'session',
                    "channel" : 'channel',
                    "gateway" : 'gateway',
                    "auth" : 'auth',
                    getClassName : function (type) {
                        return actorTypeRef[type] ? actorTypeRef[type] : 'generic';
                    }
                };

                return function (hMsg, type) {

                    if (type === 'peer-info') {
                        var className = actorTypeRef.getClassName(hMsg.type);

                        if (hMsg.status === 'ready') {
                            dataTree.logical
                                .branch(hMsg.domain)
                                //.branch(type, { "className" : className })
                                .branch(hMsg.actor, { "className" : className })
                                .leaf(hMsg.ressource, { "name" : hMsg.actor, "className" : className, "title" : hMsg.domain + ':' + hMsg.actor + ':' + hMsg.ressource});
                            
                            dataTree.physical
                                .branch(hMsg.domain)
                                .branch(hMsg.host)
                                .branch(hMsg.process)
                                .leaf(hMsg.actor)
                                .leaf(hMsg.ressource);
                            
                        }
                        else if (hMsg.status === 'stopped') {
                            dataTree.logical.cut(hMsg.domain, hMsg.actor, hMsg.ressource);
                            dataTree.physical.cut(hMsg.domain, hMsg.host, hMsg.process, hMsg.actor);
                        }
                    }
                    else if (type === 'peer-stop') {
                        // Nothing to do actually.
                    }
                };
            })());

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
        },
        testConnect :  function () {
            if (!$routeParams.sessionid || !hubiquitus.isConnected()) {
                $location.path('/');
            }
        }
    };
});