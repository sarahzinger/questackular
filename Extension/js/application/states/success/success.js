'use strict';
app.config(function($stateProvider) {
    $stateProvider.state('success', {
        url: '/success',
        templateUrl: 'js/application/states/success/success.html',
        controller: 'SuccessCtrl'
    });
});


app.controller('SuccessCtrl', function($scope, QuestFactory, UserFactory, $state, storeFactory, $rootScope) {
    
    $scope.allItems = [];
    $scope.userData = {};
    $scope.warn = false;
    $scope.goodResps = ['Good Job!', 'Nice job!', 'Well done!', 'You got it!', 'That\'s it!'];
    $scope.yayMessage = 'Congrats. You broke our app.';
    $scope.pickSuccess = function() {
        var which = Math.floor(Math.random() * $scope.goodResps.length);
        $scope.yayMessage = $scope.goodResps[which];
    };
    $scope.pickSuccess();
    //initial setup: get products and current yoozr data
    storeFactory.getAllProds().then(function(data) {
        $scope.allItems = data;
        storeFactory.getUserData().then(function(uData) {
            console.log(uData);
            angular.copy(uData, $scope.userData)
            $scope.parseItems();
        });
    });
    $scope.buy = function(item) {
        //got a target item and a target price, so check if we can buy
        console.log("$scope.userData.spent", $scope.userData.spent)
        console.log("item.price", item.price)
        var tempPoints = $scope.userData.spent + item.price;
        if (($scope.userData.total - tempPoints) >= 0) {
            console.log("$scope.userData.spent after verification", $scope.userData.spent)
            console.log("item.price after verification", item.price)
            //can afford;
            console.log('Can afford:', item);
            bootbox.confirm('Are you sure you want to buy ' + item.title + ' for ' + item.price + '?', function(result) {
                //this takes the item price and item id. sends them in an obj to backend
                var bought = {
                    itemId: item._id,
                    price: item.price
                };
                storeFactory.userBuy(bought).then(function(data) {
                    console.log("data we get after userBuy", data)
                    angular.copy(data, $scope.userData);
                    //now we need to run the parseItems fn again to find out what items
                    //are bought and append .owned = true to them
                    $scope.parseItems();
                    $rootScope.$emit('updatePoints');
                });
            });
        } else if (($scope.userData.total - tempPoints) < 0) {
            bootbox.alert('Hey! You can\'t afford ' + item.title + ' yet!')
        }
    };
    $scope.parseItems = function(){
        //go thru all items array and append .owned=true to ones in the user's list
        $scope.allItems.forEach(function(el){
            console.log('userData: ',$scope.userData)
            if ($scope.userData.owned.indexOf(el._id)!=-1){
                console.log('found: ',el.title)
                el.owned=true;
            }else{
                el.owned=false;
            }
            console.log('items:',$scope.allItems)
        })
    };
    $scope.continue = function() {
        $state.go('step');
    };
});