'use strict';
app.factory('MapFactory', function() {
    return {
        drawMap: function($scope,stepList) {
            $scope.c = document.getElementById('map');
            $scope.cDraw = $scope.c.getContext('2d');
            $scope.lefts = [];
            $scope.tops = [];
            var holding = false;
            var num = stepList.length;


            $scope.c.addEventListener('mousemove', function(e) {
                x = e.x || e.clientX;
                y = e.y || e.clientY;

                x = x - 285 + $('body').scrollLeft();
                y = y - 205 + $('body').scrollTop();
                if (holding) {
                    var id = parseInt(currDiv.id.split('l')[1]);
                    $scope.lefts[id] = x;
                    $scope.tops[id] = y;
                    $scope.redrawNodes(num);
                }
            });

            $scope.drawNodes = function(num) {
                for (var i = 0; i < num; i++) {
                    var el = document.createElement('div');
                    el.className = 'cov';
                    el.id = 'el' + i;
                    el.innerHTML = '<div class="qExpl">Points: ' + stepList[i].pointValue + '<br/>URL: '+stepList[i].url+'</div>' + stepList[i].question;
                    var lPos = (Math.random() * 900) + 25;
                    el.style.left = (lPos + 270) + 'px';
                    var tPos = (i * (1000 / num));
                    el.style.top = (tPos + 110) + 'px';
                    $scope.lefts.push(lPos);
                    $scope.tops.push(tPos);
                    el.onclick = function(e) {
                        $scope.moveThis(e);
                    };
                    $('#mapCont').append(el);
                }
                $scope.drawLines();
            };

            $scope.redrawNodes = function(num) {
                for (var i = 0; i < num; i++) {
                    var el = document.getElementById('el' + i);
                    document.getElementById('el' + i).style.left = ($scope.lefts[i] + 270) + 'px';
                    document.getElementById('el' + i).style.top = ($scope.tops[i] + 110) + 'px';
                }
                $scope.c.width = $scope.c.width;
                var img = new Image();
                img.onload = function() {
                    console.log(img);
                    img.src = '/js/create/mapBg.jpg';
                    $scope.cDraw.drawImage(img, 1, 1, 1000, 1000);
                };
                $scope.drawLines();
            };

            $scope.drawLines = function() {

                for (var j = 0; j < num - 1; j++) {
                    var LS = $scope.lefts[j] + 30;
                    var LE = $scope.lefts[j + 1] + 30;
                    var TS = $scope.tops[j] + 15;
                    var TE = $scope.tops[j + 1] + 15;
                    $scope.cDraw.moveTo(LS, TS);
                    $scope.cDraw.lineTo(LE, TE);
                    $scope.cDraw.stroke();
                }


            };

            $scope.moveThis = function(e) {
                var banner = e.target.children[0];
                if (!holding) {
                    //not currently holding, so can pick something up;
                    currDiv = e.target;
                    currDiv.style.zIndex = 5;
                    banner.style.height = '100px';
                    holding = true;
                } else {
                    banner.style.height = 0;
                    currDiv.style.zIndex = 3;
                    holding = false;
                }

            };

            $scope.drawNodes(num);
            var x,
                y,
                currDiv;
        }
    };
});