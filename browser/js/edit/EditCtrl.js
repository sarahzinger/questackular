app.controller('editCtrl', function($scope, UserFactory, QuestFactory, AuthService, $state, catFactory) {

    //remove session storage in case there's anything stored from /create or watever
    sessionStorage.removeItem('stepStr');
    sessionStorage.removeItem('newQuest');
    // $scope.alerts = [{
    //     type: 'danger',
    //     msg: 'Warning: This active quest currently has participants! Deactivating it will destroy their hard work! Are you sure you wanna make enemies like this? If not, you may wanna activate it!',
    //     show: false
    // }, {
    //     type: 'danger',
    //     msg: 'Warning: Activating a inactive quest will make it uneditable (unless you close it again). Is your quest awesome enough to activate yet? If not, you may wanna deactivate it!',
    //     show: false
    // }, {
    //     type: 'danger',
    //     msg: 'Warning: This active quest currently does not seem to have any participants. However, deactivating it will make it unplayable to your adoring fanbase! Make sure you only deactivate a quest that you need to work on!',
    //     show: false
    // }];
    $scope.cats = catFactory.cats;


    //We need them here so that clicking 'save' on any page saves the entire quest+steps group

    $scope.currState = 'quest';
    $scope.questList = [];
    $scope.quest = {}; //curent quest object
    $scope.stepList = []; //list of current steps.
    $scope.stepsToRemove = []; //when we run our save function, we loop thru this and 
    //remove any steps on this list.
    $scope.questPicked = false;
    $scope.selectedQuest = {};
    $scope.addForm = false;
    $scope.tabs = [{
        label: "Edit Quest",
        state: "edit.quest"
    }, {
        label: "Edit Step",
        state: "edit.step",
        disabled: $scope.noQuest
    }, {
        label: "View Map",
        state: "edit.map",
        disabled: $scope.noQuest
    }];
    AuthService.getLoggedInUser().then(function(user) {
        $scope.user = user;

        QuestFactory.getQuestsByUser(user._id).then(function(questList) {
            $scope.questList = questList;

            //run thru list of quests, and for those that do not have
            //categories, assign misc 
            $scope.questList.forEach(function(el) {
                el.cat = el.cat || {
                    cat: 'Miscellaneous',
                    url: 'http://i.imgur.com/jFkV2.jpg'
                };
            });
            console.log(questList);
            $scope.selectedQuest = $scope.questList[0];


            $scope.questList.forEach(function(quest) {
                var participants = quest.participants;
                // console.log(participants, 'participants');
                // console.log('quest', quest);
                participants.forEach(function(participant) {
                    console.log('participant', participant);
                    UserFactory.getUserById(participant).then(function(data) {
                        $scope.name = data.google.name;
                    });
                });
            });

        });

    });
    

    $scope.saveFullQuest = function(index) {
        console.log('index', index)
        $scope.quest = $scope.questList[index]
        console.log("quest from front end", $scope.quest)
        //this will save the full quest.
        if ($scope.stepList.length < 1) {
            //no steps yet. Alert user!
            bootbox.confirm('Are you ready to save your changes?', function(result) {
                if (result == false) {
                    return;
                }
            });
        }
        //parse and readjust quest
        ($scope.quest.pubPriv === 'private') ? $scope.quest.privacy = true: $scope.quest.privacy = false;
        delete $scope.quest.pubPriv;
        
            console.log("about to call factory")
            console.log("what we send to the factory", $scope.quest)
            QuestFactory.updateQuest($scope.quest).then(function(questId) {
                console.log('quest item:', questId);
                $scope.stepsToRemove.forEach(function(remItem) {
                    QuestFactory.remStep(remItem).then(function(data) {
                        angular.copy(data, $scope.stepList);
                    });
                });

                $scope.stepList.forEach(function(item) {
                    item.quest = questId;
                    //modify clues and tags.
                    if (item.clueStr) {
                        //step has clues to parse. 
                        item.clues = clueStr.split(',');
                        delete item.clueStr;
                    }
                    if (item.tagStr) {
                        //step has tags to parse. parse dem tagz
                        item.tags = item.tagStr.split(',');
                        delete item.clueStr;
                    }
                    //save this step
                    QuestFactory.updateStep(item).then(function(data) {
                        angular.copy(data, $scope.stepList);
                    });
                });
                bootbox.alert('Your quest has been saved!')
                    //yes, this is and the above foreach are asynchronous, but the completion of the save does not depend upon the removal of stepsToRemove quest (or vice-versa)
                $scope.stepsToRemove = [];
                //clear sesh storage so we can exit without nonsense;
                sessionStorage.removeItem('stepStr');
                sessionStorage.removeItem('newQuest');
            });
    };
    $scope.pickQuest = function(index) {

        //this needs to get a quest by id and then get its associated steps
        $scope.questPicked = true;
        $scope.quest = $scope.questList[index];
        console.log("$scope.quest", $scope.quest)
        $scope.$parent.questIndex = index;

        QuestFactory.getStepListById($scope.quest._id).then(function(data) {
            // $scope.stepList = data;
            console.log("$scope.stepList", $scope.stepList)
            console.log("data", data)
            angular.copy(data, $scope.stepList);
            if ($scope.stepList.length > 0) {
                sessionStorage.stepStr = angular.toJson($scope.stepList);
            } else {
                console.log("session store is removing", sessionStorage.stepStr)
                sessionStorage.removeItem('stepStr');
            }
            $scope.stepList.forEach(function(el) {
                if (el.clues) {
                    el.clueStr = el.clues.join();
                }
                if (el.tags) {
                    el.tagStr = el.tags.join();
                }
            });
        });
    };


    $scope.correctAns = function(ansNum, stepNum) {
        //this function simply chooses the correct answer for the multi-choice answers.
        console.log('Correct: ', ansNum, 'ID: ', stepNum);
        $scope.stepList[stepNum].multiAnsCor = ansNum.toString();

    };

    $scope.checkOpenStatus = function(index) {
        console.log("index from front end", index)
        //if quest is currently ACTIVE and HAS PARTICIPANTS, show ARRAY at 0.
        //if quest is currently INACTIVE, show ARRAY at 1
        //if active and no partis, show ARRAY at 2.
        if ($scope.questList[index].active) {
            console.log("quest is changing to false")
            $scope.questList[index].active = false
            console.log("$scope.questList[index]",$scope.questList[index])
        }else{
            console.log("quest is changing to true")
            $scope.questList[index].active = true;
            console.log("$scope.questList[index]",$scope.questList[index])
        } 
        // console.log('is it really active?', quest.active);
        // if (quest.active && quest.participants.length >= 1) {
        //     bootbox.alert('This active quest currently has participants, deactivating it will destroy their hard work! Are you sure you wanna make enemies like this? If not, you may wanna activate it!')
        //     // $scope.alerts[0].show = true;
        //     // $scope.alerts[1].show = false;
        //     // $scope.alerts[2].show = false;
        // } else if (!quest.active) {
        //     bootbox.alert('After you click save, your quest will be active and people are free to join it! To edit it again, deactive the quest')
        //     // $scope.alerts[0].show = false;
        //     // $scope.alerts[1].show = true;
        //     // $scope.alerts[2].show = false;
        // } else if (quest.active && quest.participants.length < 1) {
        //     bootbox.alert("Your quest is now editable, no one will be able to join until you reactive your quest")
        //     // $scope.alerts[0].show = false;
        //     // $scope.alerts[1].show = false;
        //     // $scope.alerts[2].show = true;
        // }
    };
    $scope.closeAlert = function(index) {
        $scope.alerts[index].show = false;
    };
    $scope.removeStep = function(step) {
        //pop a confirm box and remove a step
        bootbox.confirm('Are you sure you wanna remove this step? Removing a step is permanent (once you click the save button)!', function(delConf) {
            if (delConf) {
                //See if the object to remove has an id. if so, add to the list of objs to remove, since it's stored in db.
                if (step._id) {
                    $scope.stepsToRemove.push(step);
                }
                //now remove the step from the frontEnd. first stepList arr
                for (var r = 0; r < $scope.stepList.length; r++) {
                    if ($scope.stepList[r].question === step.question) {
                        //remove it!
                        $scope.stepList.splice(r, 1);
                    }
                }
                //then sesh storage!
                sessionStorage.stepStr = angular.toJson($scope.stepList);
            }
        })
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
    $state.go('edit.quest');


    $scope.goToInvite = function(title, participants) {
        $scope.$parent.questinvitetitle = title;
        $scope.$parent.questinviteparticipants = participants;
        $state.go('edit.invite');
    };

});