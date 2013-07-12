'use strict';

angular.module('hconsoleApp').factory('CircleGraph', function ($rootScope, $window) {

    // Prototypes
    /*var Arguments = (function () {
        return arguments.constructor;
    })();
    Arguments.prototype.toArray = function () {
        return Array.prototype.slice.call(this);
    };*/


    // Classe de graphique en cercles
    var CircleGraph = function (nodeId, dataTree) {
        var diameter = 500,
            format = d3.format(",d"),
            margin = 4,
            padding = 0.1,
            graph;

            // Creation de la racine
            var layout = d3.layout.pack()
                .size([diameter - margin, diameter - margin])
                .value(function(d) { return d.size * 0.9; });

            var svg = d3.select(nodeId).append("svg")
                .attr("width", diameter)
                .attr("height", diameter)
            .append("g")
                .attr("transform", "translate(2,2)");

            svg.datum(dataTree);

        return graph = {
        	getRatio : function (d) {
        		return Math.pow(1 - padding, d.depth - 1);
        	},
        	getRadius : function (d) {
        		return Math.round(d.r * graph.getRatio(d));
        	},
        	getCoord : function (d) {
        		d.original = { x : d.x, y : d.y};

        		var decal = d.parent ? d.parent.decal : { "x" : 0, "y" : 0 },
        			center = d.parent ?
	        			{ x : d.parent.x + decal.x, y : d.parent.y + decal.y } :
	        			{ x : (diameter - margin) / 2, y : (diameter - margin) / 2 },

        			x = Math.round((d.x + decal.x - center.x) * graph.getRatio(d) + center.x),
        			y = Math.round((d.y + decal.y - center.y) * graph.getRatio(d) + center.y);

        			d.decal = { "x" : x - d.x, "y" : y - d.y };

        		return "translate(" + x + "," + y + ")";
        	},
            draw : function () {
                var node = svg.selectAll(".node").data(layout.nodes);

                // UPDATE NODES
                node.select('title')
                    .text(function(d) { return d.title ? d.title : d.name; });

                node.select("circle")
                    .transition()
                    .attr("r", graph.getRadius);

                node.transition()
                    .attr("class", function(d) { return "node" + (d.children ?  '' : " leaf") + (d.className ? ' ' + d.className : ''); })
                    .attr("transform", graph.getCoord);

                node.select("text").remove()
                    .text(function(d) { return d.name.substring(0, d.r / 3); });

                node.filter(function(d) { return !d.children; }).append("text")
                    .attr("dy", ".3em")
                    .style("text-anchor", "middle")
                    .text(function(d) { return d.name.substring(0, d.r / 3); });

                // CREATE NEW NODES
                var newNode = node.enter().append("g")
                    .attr("class", function(d) { return "node" + (d.children ?  '' : " leaf") + (d.className ? ' ' + d.className : ''); })
                    .attr("transform", graph.getCoord)
                    .filter(function(d) { return typeof d.parent != 'undefined'; });

                newNode.append("title")
                    .text(function(d) { return d.title ? d.title : d.name; });

                newNode.append("circle")
                    .attr("r", function (d) { return graph.getRadius(d) / 2; })
                    .on('click', function(d) {
                    	console.log(d.name, d);
                    })
                    .transition()
                    .attr("r", graph.getRadius);

                newNode.filter(function(d) { return !d.children; }).append("text")
                    .attr("dy", ".3em")
                    .style("text-anchor", "middle")
                    .text(function(d) { return d.name.substring(0, d.r / 3); });

                // REMOVE OLD NODES
                node.exit().remove();

                return this;
            }
        };
    };


    return CircleGraph;
});