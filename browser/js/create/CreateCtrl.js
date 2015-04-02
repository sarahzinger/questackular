'use strict';
app.controller('CreateCtrl', function($scope, QuestFactory, AuthService, $state, catFactory) {
    //the following scope vars are 'parental' to the child scopes. 
    sessionStorage.removeItem('newQuest');
    sessionStorage.removeItem('stepStr');
    //We need them here so that clicking 'save' on any page saves the entire quest+steps group
    $scope.currState = 'quest';
    $scope.quest = {}; //curent quest object, via ng-change
    $scope.quest.cat = {
        cat: 'Miscellaneous',
        url: 'http://i.imgur.com/jFkV2.jpg'
    };
    $scope.quest.actInact = 'active';
    $scope.stepList = []; //list of current steps.
    $scope.questExists = false;
    $scope.tabs = [{
        label: "New Quest",
        state: "create.quest"
    }, {
        label: "New Step",
        state: "create.step",
        disabled: $scope.noQuest
    }, {
        label: "Quest Map",
        state: "create.map",
        disabled: $scope.noQuest
    }];

    //  ^-^
    // (o o) - meow


    $scope.cats = catFactory.cats;

    if (sessionStorage.newQuest) {
        $scope.questExists = true;
    }
    $scope.saveFullQuest = function() {
        //this will save the full quest.
        console.log("$scope.stepList", $scope.stepList)
        if ($scope.stepList.length < 1) {
            //no steps yet. Alert user!
            bootbox.confirm('This quest has no steps! Are you sure you wanna save it?', function(result) {
                if (result == false) {
                    return;
                }
            });
        }
        //parse and readjust quest
        ($scope.quest.actInact === 'active') ? $scope.quest.active = true: $scope.quest.active = false;
        ($scope.quest.pubPriv === 'private') ? $scope.quest.privacy = true: $scope.quest.privacy = false;
        delete $scope.quest.actInact;
        delete $scope.quest.pubPriv;
        //final-presave stuff: get the current user ID
        AuthService.getLoggedInUser().then(function(user) {
            console.log("user from AuthService", user);
            $scope.quest.owner = user._id;
            //save the quest
            QuestFactory.sendQuest($scope.quest)
                .then(function(questId) {
                    console.log('questId item:', questId);

                    // questId = questId.toString();
                    if (questId == "duplicateQuest") {
                        bootbox.alert("This quest already exists! Please create your steps in the 'edit' page.");
                    } else {
                        console.log("questId !== duplicateQuest");
                        $scope.stepList.forEach(function(item) {
                            item.quest = questId;
                            //save this step
                            QuestFactory.sendStep(item).then(function(data) {
                                console.log('Saved quest! Woohoo!');
                                //redirect, clear vars on NEXT PAGE!
                                $state.go('thanks');
                            });
                        });

                    }

                });
        });
    };

    $scope.clearData = function() {
        bootbox.confirm('Are you sure you want to clear this quest? It hasn\'t yet been saved!', function(result) {
            if (result !== false) {
                sessionStorage.removeItem('newQuest');
                $scope.quest = {};
                $scope.stepList = []; //list of current steps.
                $scope.questExists = false;
            }
        });
    };
    $scope.okayToGo = false;
    $scope.$on('$stateChangeStart', function(e, to, n, from) {
        var parentF = from.name.split('.')[0];
        var parentT = to.name.split('.')[0];
        
        if (parentF != parentT && (sessionStorage.stepStr || sessionStorage.newQuest) && parentT !== 'thanks' && !$scope.okayToGo) {
            e.preventDefault();//prevent state change beforehand.
            bootbox.confirm('Are you sure you wanna leave? This quest has not been saved yet!', function (response) {
                if (response === true) {
                    $scope.okayToGo = true;
                    $state.go(to.name);//re-instantiate the go thingy. Wow, that actually sounded all techy and stuff.
                }
            });
        }
    })
    $state.go('create.quest');
});