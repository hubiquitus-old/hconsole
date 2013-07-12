'use strict';

angular.module('hconsoleApp').factory('TreeGraph', function ($rootScope, $window) {

    // Classe de graphique en cercles
    var TreeGraph = function (nodeId, dataTree) {
        var m = [10, 10, 10, 10],
            w = 1280 - m[1] - m[3],
            h = 1000 - m[0] - m[2],
            i = 0,
            ratio = {x : 1, y: 1},
            graph;


        // Creation de la racine
        var layout = d3.layout.tree()
            .size([h, w]);

        var diagonal = d3.svg.diagonal()
            .projection(function(d) { return [d.y, d.x]; });

        var svg = d3.select(nodeId).append("svg:svg")
            .attr("width", w + m[1] + m[3])
            .attr("height", h + m[0] + m[2])
        .append("svg:g")
            .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
        
        dataTree.x0 = h / 2;
        dataTree.y0 = 0;


        return graph = {
            toggle : function (d) {
                d.toggle = !d.toggle;
            },
            toggleAll : function (d) {
                if (d.children) {
                    d.children.forEach(graph.toggleAll);
                    graph.toggle(d);
                }
            },
            draw : function () {
                if (dataTree.children) {
                    var duration = d3.event && d3.event.altKey ? 5000 : 500;

                    // Compute the new tree layout.
                    var nodes = layout.nodes(dataTree).reverse()
                        .filter(function(d) { return !d.parent || !d.parent.toggle; });

                    // Normalize for fixed-depth.
                    nodes.forEach(function(d) { d.y = d.depth * 180 * ratio.y; });

                    // Update the nodes…
                    var node = svg.selectAll("g.node")
                        .data(nodes, function(d) { return d.id || (d.id = ++i); });

                    // Enter any new nodes at the parent's previous position.
                    var nodeEnter = node.enter().append("svg:g")
                        .attr("class", "node")
                        .attr("transform", function(d) { return "translate(" + dataTree.y0 + "," + dataTree.x0 + ")"; })
                        .on("click", function(d) { graph.toggleAll(d); graph.draw(d); });

                    nodeEnter.append("svg:circle")
                        .attr("r", 1e-6)
                        .style("fill", function(d) { return d.toggle ? "lightsteelblue" : "#fff"; });

                    nodeEnter.append("svg:text")
                        .attr("x", function(d) { return d.children ? -10 : 10; })
                        .attr("dy", ".35em")
                        .attr("text-anchor", function(d) { return d.children ? "end" : "start"; })
                        .text(function(d) { return d.name; })
                        .style("fill-opacity", 1e-6);

                    // Transition nodes to their new position.
                    var nodeUpdate = node.transition()
                        .duration(duration)
                        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

                    nodeUpdate.select("circle")
                        .attr("r", 4.5)
                        .style("fill", function(d) { return d.toggle ? "lightsteelblue" : "#fff"; });

                    nodeUpdate.select("text")
                        .attr("x", function(d) { return d.children ? -10 : 10; })
                        .attr("text-anchor", function(d) { return d.children ? "end" : "start"; })
                        .style("fill-opacity", 1);

                    // Transition exiting nodes to the parent's new position.
                    var nodeExit = node.exit().transition()
                        .duration(duration)
                        .attr("transform", function(d) { return "translate(" + d.parent.y + "," + d.parent.x + ")"; })
                        .remove();

                    nodeExit.select("circle")
                        .attr("r", 1e-6);

                    nodeExit.select("text")
                        .style("fill-opacity", 1e-6);


                    // Update the links…
                    var link = svg.selectAll("path.link")
                        .data(layout.links(nodes), function(d) { return d.target.id; });

                    // Enter any new links at the parent's previous position.
                    link.enter().insert("svg:path", "g")
                        .attr("class", "link")
                        .attr("d", function(d) {
                            var o = {x: dataTree.x0, y: dataTree.y0};
                            return diagonal({source: o, target: o});
                        })
                        .transition()
                        .duration(duration)
                        .attr("d", diagonal);

                    // Transition links to their new position.
                    link.transition()
                        .duration(duration)
                        .attr("d", diagonal);

                    // Transition exiting nodes to the parent's new position.
                    link.exit().transition()
                        .duration(duration)
                        .attr("d", function(d) {
                            var o = {x: dataTree.x, y: dataTree.y};
                            return diagonal({source: o, target: o});
                        })
                        .remove();

                    // Stash the old positions for transition.
                    nodes.forEach(function(d) {
                        d.x0 = d.x;
                        d.y0 = d.y;
                    });
                }

                return graph;
            }
        };
    };


    return TreeGraph;
});

