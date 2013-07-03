'use strict';

angular.module('hconsoleApp').factory('hubiquitus', function ($rootScope, $window) {

    $rootScope.safeApply = function (fn) {
        var phase = this.$root.$$phase;
        if (phase === '$apply' || phase === '$digest') {
            if (fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    var hClient,
        connected = false,
        currentChannel = undefined,
        onConnectedCallback, onConnectingCallback, onErrorCallback, onDisconnectedCallback, onMessageCallback;

    function init() {
        hClient = $window.hClient;

        hClient.onStatus = function (hStatus) {
            //console.debug('onStatus', hStatus);
            switch (hStatus.status) {
            case hClient.statuses.CONNECTED:
                connected = true;
                if (typeof onConnectedCallback === 'function') {
                    $rootScope.safeApply(onConnectedCallback);
                }
                break;
            case hClient.statuses.CONNECTING:
                if (typeof onConnectingCallback === 'function') {
                    $rootScope.safeApply(onConnectingCallback);
                }
                break;
            case hClient.statuses.DISCONNECTED:
                connected = false;
                if (typeof onDisconnectedCallback === 'function') {
                    $rootScope.safeApply(onDisconnectedCallback);
                }
                break;
            }

            if (typeof onErrorCallback === 'function') {
                switch (hStatus.errorCode) {
                case hClient.errors.NO_ERROR:
                    break;
                case hClient.errors.URN_MALFORMAT:
                    $rootScope.safeApply(function () {
                        onErrorCallback.call(this, 'URN Malformat');
                    });
                    break;
                case hClient.errors.CONN_TIMEOUT:
                    $rootScope.safeApply(function () {
                        onErrorCallback.call(this, 'Connection timed out');
                    });
                    break;
                case hClient.errors.AUTH_FAILED:
                    $rootScope.safeApply(function () {
                        onErrorCallback.call(this, 'Authentication failed');
                    });
                    break;
                case hClient.errors.ALREADY_CONNECTED:
                    $rootScope.safeApply(function () {
                        onErrorCallback.call(this, 'A connection is already opened');
                    });
                    break;
                case hClient.errors.TECH_ERROR:
                    $rootScope.safeApply(function () {
                        onErrorCallback.call(this, 'Technical Error: ' + hStatus.errorMsg);
                    });
                    break;
                case hClient.errors.NOT_CONNECTED:
                    $rootScope.safeApply(function () {
                        onErrorCallback.call(this, 'Not connected');
                    });
                    break;
                case hClient.errors.CONN_PROGRESS:
                    $rootScope.safeApply(function () {
                        onErrorCallback.call(this, 'A connection is already in progress');
                    });
                    break;
                }
            }

            hClient.onMessage = function (hMessage) {
                //console.debug('onMessage', hMessage);

                // Alimentation de l'arbre de ressource
                resourceTree.add(hMessage);

                if (typeof onMessageCallback === 'function') {
                    $rootScope.safeApply(function () {
                        onMessageCallback.call(this, hMessage);
                    });
                }
            };
        };
    }


    // Prototypes
    /*var Arguments = (function () {
        return arguments.constructor;
    })();
    Arguments.prototype.toArray = function () {
        return Array.prototype.slice.call(this);
    };*/
    Array.prototype.remove =  function (value) {
        for (var i = 0; i < this.length && this[i] != value; ++i);
        if (i < this.length) {
            return this.splice(i, 1);
        }
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
        // Si pas de taille, c'est une branche.
        // Donc peut avoir des enfants.
        if (!this.data.size) {
            this.data.children = [];
        }

        this.getDico = function () {
            return childDico;
        };
    };
    // Créer ou retrouver un élément générique enfant
    TreeElmt.prototype.elmt = function (childKey, childData) {
        var childElmt,
            childDico = this.getDico();

        if (!childDico[childKey]) {
            childElmt = new TreeElmt(childKey, childData);
            childDico[childKey] = childElmt;
            this.data.children.push(childElmt.data);
        }
        else {
            childElmt = childDico[childKey];
        }

        return childElmt;
    };
    // Créer ou retrouver une branche enfant
    TreeElmt.prototype.branch = function (childKey, childData) {
        if (childData && childData.size) {
            childData.size = undefined;
        }
        return this.elmt(childKey, childData);
    };
    // Créer ou retrouver une feuille enfant
    TreeElmt.prototype.leaf = function (childKey, childData) {
        if (!childData) {
            childData = {size :  1};
        }
        else if (!childData.size) {
            childData.size = 1;
        }
        return this.elmt(childKey, childData);
    };
    // Couper une branche ou une feuille
    TreeElmt.prototype.cut = function ( /* Leaf path in data tree */ ) {
        var args = Array.prototype.slice.call(arguments),
            childKey = args.shift(),
            childDico = this.getDico(),
            childElmt = childDico[childKey];

        if (childElmt) {
            if (childElmt.data.size || !childElmt.cut.apply(childElmt, args)) {
                console.log('cut', childKey);
                childDico[childKey] = undefined;
                this.data.children.remove(childElmt.data);
            }
        }

        return this.data.children.length > 0;
    };

    var treeTest = new TreeElmt('Test');
    treeTest
        .branch('Domain')
        .branch('A')
        .leaf('1');
    treeTest
        .branch('Domain')
        .branch('A')
        .leaf('2');
    treeTest
        .branch('Domain')
        .branch('A')
        .leaf('3');

    console.log(treeTest.data);

    treeTest
        .cut('Domain', 'A', '2');
    treeTest
        .cut('Domain', 'A', '1');
    treeTest
        .cut('Domain', 'A', '3');
    console.log(treeTest.data);


    // Classe de graphique en cercles
    var CircleGraph = function (nodeId, dataTree) {
        var diameter = 700,
            format = d3.format(",d"),
            svg = undefined;

        return {
            "draw" : function () {
                if (dataTree.children.length) {
                    if (svg) {
                        d3.select(svg[0][0].parentNode).remove();
                        svg = undefined;
                    }

                    // Creation de la racine
                    var pack = d3.layout.pack()
                        .size([diameter - 4, diameter - 4])
                        .value(function(d) { return d.size; });

                    svg = d3.select(nodeId).append("svg")
                        .attr("width", diameter)
                        .attr("height", diameter)
                    .append("g")
                        .attr("transform", "translate(2,2)");

                    // Dessin des enfants
                    var node = svg.datum(dataTree).selectAll(".node")
                        .data(pack.nodes)
                    .enter().append("g")
                        .attr("class", function(d) { return "node" + (d.children ?  '' : " leaf") + (d.className ? ' ' + d.className : ''); })
                        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

                    node.append("title")
                        .text(function(d) { return d.title ? d.title : d.name; });

                    node.append("circle")
                        .attr("r", function(d) { return d.r; });

                    node.filter(function(d) { return !d.children; }).append("text")
                        .attr("dy", ".3em")
                        .style("text-anchor", "middle")
                        .text(function(d) { return d.name.substring(0, d.r / 3); });
                }
                return this;
            }
        };
    };

    // Root de l'arbre des ressources
    var resourceTree = new TreeElmt("Ubiquitus");
    resourceTree.add = (function () {
        var actorTypeRef = {
            "session" : 'session',
            "channel" : 'channel',
            "gateway" : 'gateway',
            "auth" : 'auth'
        };

        return function (hMessage) {
            var payload = hMessage.payload;

            if (hMessage.type === 'peer-info') {
                var peerId = payload.peerId,
                    domain = peerId.substr(0, peerId.lastIndexOf(':')),
                    actor = peerId.substr(peerId.lastIndexOf(':') + 1),
                    ressource = payload.peerRessource,
                    type = payload.peerType.toLowerCase(),
                    className = actorTypeRef[type] ? actorTypeRef[type] : 'generic';

                this.branch(domain)
                    //.branch(type, { "className" : className })
                    .branch(actor, { "className" : className })
                    .leaf(ressource, { "name" : actor, "className" : className, "title" : domain + ':' + actor + ':' + ressource});
                
                console.log('ADD : ', domain, actor, ressource);
                console.log(this.data);
            }
            else if (hMessage.type === 'peer-stop') {
                console.log('peer-stop : ', hMessage);

                var arr = payload.split(':'),
                    domain = arr[0] + ':' + arr[1],
                    arr2 =  arr[2].split('/'),
                    actor = arr2[0],
                    ressource = arr2[1];

                this.cut(domain, actor, ressource);

                console.log('CUT : ', domain, actor, ressource);
                console.log(this.data);
            }

            return this;
        };
    })();


    return {
        isConnected: function () {
            return connected;
        },
        connect: function (login, password, endpoint) {
            if (!hClient) {
                init();
            }
            hClient.connect(login, password, {
                transport: 'socketio',
                endpoints: [endpoint]
            });
        },
        subscribe: function (actor, callback) {
            hClient.subscribe(actor, function (hMessage) {
                //console.debug('subscribe', hMessage);
                $rootScope.safeApply(function () {
                    if (hMessage.payload.status === 0) {
                        currentChannel = actor;
                    }
                    callback(hMessage.payload);
                });
            });
        },
        disconnect: function () {
            hClient.disconnect();
        },
        onConnected: function (callback) {
            onConnectedCallback = callback;
        },
        onConnecting: function (callback) {
            onConnectingCallback = callback;
        },
        onError: function (callback) {
            onErrorCallback = callback;
        },
        onDisconnected: function (callback) {
            onDisconnectedCallback = callback;
        },
        onMessage: function (callback) {
            onMessageCallback = callback;
        },
        getChannel: function () {
            return currentChannel;
        },
        createCircleGraph : function (nodeId, dataTree) {
            return new CircleGraph(nodeId, dataTree).draw();
        },
        ressourceTree : resourceTree
    };

});
