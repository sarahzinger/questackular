'use strict';
app.factory('MapFactory', function() {
    return {
        drawMap: function($scope, stepList, $window) {
            $scope.ST = window.pageYOffset || document.body.scrollTop;
            $scope.SL = window.pageXOffset || document.body.scrollLeft;
            $scope.c = document.getElementById('map');
            $scope.cDraw = $scope.c.getContext('2d');
            $scope.lefts = [];
            $scope.tops = [];
            $scope.wRat = $window.innerWidth / 1920; //window width ratio ;
            $scope.hRat = $window.innerHeight / 1080;
            $scope.c.width = 1000*$scope.wRat;
            $scope.c.height = 1000*$scope.hRat;
            var holding = false;
            var num = stepList.length;
            console.log('off',$scope.c.offsetTop);
            $scope.c.addEventListener('mousemove', function(e) {
                console.log(window.pageYOffset)
                x = e.x || e.clientX;
                y = e.y || e.clientY;

                x = x - parseInt(285*$scope.wRat) + $scope.SL;
                y = y - parseInt(205*$scope.hRat) - $scope.ST ;
                if (holding) {
                    var id = parseInt(currDiv.id.split('l')[1]);
                    $scope.lefts[id] = x;
                    $scope.tops[id] = y;
                    $scope.redrawNodes(num);
                }
            });
            /*
            Can we divide 1000 and all other relevant div nums by some ratio btwn that and winduh size?
            $window can be mocked for testing

            "HAHA" -   (^_^)___  [_] .oO ( Q_Q ...)  <--- window being mocked
            */
            $scope.drawNodes = function(num) {
                for (var i = 0; i < num; i++) {
                    var el = document.createElement('div');
                    el.className = 'cov';
                    el.id = 'el' + i;
                    el.innerHTML = '<div class="qExpl">Points: ' + stepList[i].pointValue + '<br/>URL: ' + stepList[i].url + '</div>' + stepList[i].question;
                    var lPos = (Math.random() * parseInt(900*$scope.wRat)) + 25;
                    el.style.left = (lPos + 270) + 'px';
                    var tPos = (i * (parseInt(1000*$scope.hRat) / num));
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
                    document.getElementById('el' + i).style.left = ($scope.lefts[i] + parseInt(270*$scope.wRat)) + 'px';
                    document.getElementById('el' + i).style.top = ($scope.tops[i]) + 'px';
                }
                $scope.c.width = $scope.c.width;
                var img = new Image();
                img.onload = function() {
                    img.src = '/js/create/mapBg.jpg';
                    $scope.cDraw.drawImage(img, 1, 1, parseInt(1000*$scope.wRat), parseInt(1000*$scope.hRat));
                };
                $scope.drawLines();
            };

            $scope.drawLines = function() {

                for (var j = 0; j < num - 1; j++) {
                    var LS = $scope.lefts[j] + 30; 
                    var LE = $scope.lefts[j + 1] + 30;
                    var TS = $scope.tops[j] + 15;
                    var TE = $scope.tops[j + 1]+15;
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