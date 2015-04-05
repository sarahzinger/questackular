angular.module('d3', [])
    .factory('d3Service', ['$document', '$q', '$rootScope', function($document, $q, $rootScope) {
        var d = $q.defer();

        function onScriptLoad() {
                // Load client in the browser
                $rootScope.$apply(function() {
                    d.resolve(window.d3);
                });
            }
            // Create a script tag with d3 as the source
            // and call our onScriptLoad callback when it
            // has been loaded
        var scriptTag = $document[0].createElement('script');
        scriptTag.type = 'text/javascript';
        scriptTag.async = true;
        scriptTag.src = '/d3/d3.min.js';
        scriptTag.onreadystatechange = function() {
            if (this.readyState === 'complete') {
                onScriptLoad();
            }
        };
        scriptTag.onload = onScriptLoad;

        var s = $document[0].getElementsByTagName('body')[0];
        s.appendChild(scriptTag);

        return {
            d3: function() {
                return d.promise;
            }
        };
    }]).directive('bouncyChart', ['d3Service', function(d3Service) {
        return {
            restrict: 'EA',
            link: function(scope, element, attrs) {
                /* Set the diagrams Height & Width */
                var nodes = [];
                var links = [];
                var pointVals = [];
                var adjSiz = [];
                console.log('shtepz!', scope.stepList)
                for (var i = 0; i < scope.stepList.length; i++) {
                    pointVals.push(scope.stepList[i].pointValue);
                }
                var max = Math.max.apply(null, pointVals);
                var min = Math.min.apply(null, pointVals);
                for (var i = 0; i < scope.stepList.length; i++) {
                    nodes.push({
                        name: scope.stepList[i].question
                    })
                }
                for (var i = 0; i < scope.stepList.length - 1; i++) {
                    links.push({
                        source: i,
                        target: i + 1
                    })
                }
                for (var i = 0; i < pointVals.length; i++) {
                    if (pointVals[i]){
                        adjSiz.push(((pointVals[i] - min) * 40 / (max - min)) + 20);//check to see if point val exists. 
                        //if so, go ahead and normalize that and push into our size array
                    }else{
                        adjSiz.push(20);//if for whatever reason the step does not have a point
                        //value, default to lowest size(20);
                    }
                }
                var h = parseInt(window.innerHeight*.9),
                    w = parseInt(window.innerWidth*.7);
                /* Set the color scale we want to use */
                var color = d3.scale.category20();
                /* Establish/instantiate an SVG container object */
                var svg = d3.select("#map")
                    .append("svg")
                    .attr("height", h)
                    .attr("width", w);
                /* Build the directional arrows for the links/edges */
                svg.append("svg:defs")
                    .selectAll("marker")
                    .data(["end"])
                    .enter().append("svg:marker")
                    .attr("id", String)
                    .attr("viewBox", "0 -5 10 10")
                    .attr("refX", 15)
                    .attr("refY", -1.5)
                    .attr("markerWidth", 6)
                    .attr("markerHeight", 6)
                    .attr("orient", "auto")
                    .append("svg:path")
                    .attr("d", "M0,-5L10,0L0,5");

                function makeDiag(error, nodes, links, adjSiz, table) {
                    /* Draw the node labels first */
                    var texts = svg.selectAll("text")
                        .data(nodes)
                        .enter()
                        .append("text")
                        .attr("fill", "black")
                        .attr("font-family", "sans-serif")
                        .attr("font-size", "12px")
                        .text(function(d) {
                            return d.name;
                        });
                    /* Establish the dynamic force behavor of the nodes */
                    var force = d3.layout.force()
                        .nodes(nodes)
                        .links(links)
                        .size([w, h])
                        .linkDistance([250])
                        .charge([-1500])
                        .gravity(0.3)
                        .start();
                    /* Draw the edges/links between the nodes */
                    var edges = svg.selectAll("line")
                        .data(links)
                        .enter()
                        .append("line")
                        .style("stroke", "#ccc")
                        .style("stroke-width", 1)
                        .attr("marker-end", "url(#end)");
                    /* Draw the nodes themselves */
                    var nodes = svg.selectAll("circle")
                        .data(nodes)
                        .enter()
                        .append("circle")
                        .attr("r", function(d, i) {
                            return adjSiz[i];
                        })
                        .attr("opacity", 0.5)
                        .style("fill", function(d, i) {
                            return color(i);
                        })
                        .call(force.drag);
                    /* Run the Force effect */
                    force.on("tick", function() {
                        edges.attr("x1", function(d) {
                                return d.source.x;
                            })
                            .attr("y1", function(d) {
                                return d.source.y;
                            })
                            .attr("x2", function(d) {
                                return d.target.x;
                            })
                            .attr("y2", function(d) {
                                return d.target.y;
                            });
                        nodes.attr("cx", function(d) {
                                return d.x;
                            })
                            .attr("cy", function(d) {
                                return d.y;
                            })
                        texts.attr("transform", function(d) {
                            return "translate(" + d.x + "," + d.y + ")";
                        });
                    }); // End tick func
                }; // End makeDiag worker func
                makeDiag(0, nodes, links, adjSiz);
            }
        };
    }]);
