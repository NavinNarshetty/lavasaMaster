// FORMAT TABLE FOR INDIVIDUAL SPORTS
myApp.controller('FormatTableCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("formattable");
  $scope.menutitle = NavigationService.makeactive("Draw Format Table");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  $scope.drawType = $stateParams.type;
  console.log($.jStorage.get("detail"), 'JStorage');
  $scope.formData = {};
  $scope.formData.page = 1;
  $scope.formData.type = '';
  $scope.formData.keyword = '';
  $scope.form = {};
  $scope.form.page = 1;
  $scope.form.type = '';
  $scope.form.keyword = '';
  $scope.result = [];



  // SEARCH IN TABLE
  $scope.searchInTable = function (data) {
    console.log(data, "searchtable")
    $scope.form.page = 1;
    if (data.length >= 2) {
      $scope.form.keyword = data;
      $scope.viewTable();

    } else if (data.length == '') {
      $scope.form.keyword = data;
      $scope.viewTable();

    }
  }
  // SEARCH IN TABLE END

  $scope.viewTable = function () {
    console.log("in")
    $scope.result = [];
    // console.log("data in table", formValue);
    $scope.url = "Match/getPerSport"
    // $scope.formData = formValue;
    $scope.form = $.jStorage.get("detail");
    $scope.form.page = $scope.form.page++;
    console.log("form......", $scope.form);
    NavigationService.apiCall($scope.url, $scope.form, function (data) {
      console.log("data.value heat", data);
      $scope.items = data.data.results;
      $scope.totalItems = data.data.total;
      $scope.maxRow = data.data.options.count;
      _.each($scope.items, function (data) {
        // console.log(data, "another console data");
        if (data.resultsCombat) {
          var resultKnockout = {};
          console.log("in combat");
          resultKnockout.set = 0;
          resultKnockout.sportType = "Combat";
          resultKnockout._id = data._id;
          var i = 0;
          _.each(data.resultsCombat.players, function (n) {
            if (i == 0) {
              resultKnockout.set = n.sets[0].point;
              i++;
            } else {
              resultKnockout.set = resultKnockout.set + "-" + n.sets[0].point;
            }
          });

          resultKnockout.matchId = data.matchId;
          resultKnockout.round = data.round;
          if (data.opponentsSingle[0]) {
            if (data.opponentsSingle[0].athleteId.middleName === undefined) {
              resultKnockout.player1 = data.opponentsSingle[0].athleteId.firstName + ' ' + data.opponentsSingle[0].athleteId.surname
            } else {
              resultKnockout.player1 = data.opponentsSingle[0].athleteId.firstName + ' ' + data.opponentsSingle[0].athleteId.middleName + ' ' + data.opponentsSingle[0].athleteId.surname
            }
          } else {
            resultKnockout.player1 = "-";
          }
          if (data.opponentsSingle[1]) {
            if (data.opponentsSingle[1].athleteId.middleName === undefined) {
              resultKnockout.player2 = data.opponentsSingle[1].athleteId.firstName + ' ' + data.opponentsSingle[1].athleteId.surname
            } else {
              resultKnockout.player2 = data.opponentsSingle[1].athleteId.firstName + ' ' + data.opponentsSingle[1].athleteId.middleName + ' ' + data.opponentsSingle[1].athleteId.surname
            }
            // resultKnockout.player2 = data.opponentsSingle[1].athleteId.fullname;
          } else {
            resultKnockout.player2 = "-";
          }
          if (_.isEmpty(data.opponentsSingle)) {
            resultKnockout.isTeam = true;
          } else {
            resultKnockout.isTeam = false;
          }
          // console.log("data", data);
          $scope.result.push(resultKnockout);
          // console.log($scope.result, "check this");
        } else if (data.resultsRacquet) {
          var resultKnockout = {};
          console.log("in Racquet");
          resultKnockout.set = 0;
          var i = 0;
          var count = 0;
          if (data.resultsRacquet.players) {
            var playerLength = data.resultsRacquet.players.length;
            if (playerLength == 2) {
              var player1Set = data.resultsRacquet.players[0].sets.length;
              while (i < player1Set) {
                if (i == 0) {
                  resultKnockout.set = data.resultsRacquet.players[0].sets[i].point + "-" + data.resultsRacquet.players[1].sets[i].point;
                  i++;
                } else {
                  resultKnockout.set = resultKnockout.set + "," + data.resultsRacquet.players[0].sets[i].point + "-" + data.resultsRacquet.players[1].sets[i].point;
                  i++;
                }
              }
            } else {
              var player1Set = data.resultsRacquet.players[0].sets.length;
              while (count < player1Set) {
                if (count == 0) {
                  resultKnockout.set = data.resultsRacquet.players[0].sets[count].point;
                  count++;
                } else {
                  resultKnockout.set = resultKnockout.set + "," + data.resultsRacquet.players[0].sets[count].point;
                  count++;
                }
              }
            }
          }


          resultKnockout.matchId = data.matchId;
          resultKnockout.round = data.round;
          resultKnockout._id = data._id
          if (data.opponentsSingle[0]) {
            if (data.opponentsSingle[0].athleteId.middleName === undefined) {
              resultKnockout.player1 = data.opponentsSingle[0].athleteId.firstName + ' ' + data.opponentsSingle[0].athleteId.surname
            } else {
              resultKnockout.player1 = data.opponentsSingle[0].athleteId.firstName + ' ' + data.opponentsSingle[0].athleteId.middleName + ' ' + data.opponentsSingle[0].athleteId.surname
            }
            // resultKnockout.player1 = data.opponentsSingle[0].athleteId.fullname;
          } else {
            resultKnockout.player1 = "-";
          }
          if (data.opponentsSingle[1]) {
            if (data.opponentsSingle[1].athleteId.middleName === undefined) {
              resultKnockout.player2 = data.opponentsSingle[1].athleteId.firstName + ' ' + data.opponentsSingle[1].athleteId.surname
            } else {
              resultKnockout.player2 = data.opponentsSingle[1].athleteId.firstName + ' ' + data.opponentsSingle[1].athleteId.middleName + ' ' + data.opponentsSingle[1].athleteId.surname
            }
            // resultKnockout.player2 = data.opponentsSingle[1].athleteId.fullname;
          } else {
            resultKnockout.player2 = "-";
          }
          if (_.isEmpty(data.opponentsSingle)) {
            resultKnockout.isTeam = true;
          } else {
            resultKnockout.isTeam = false;
          }
          resultKnockout.sportType = "Racquet";
          // console.log("data", data);
          $scope.result.push(resultKnockout);
          // console.log($scope.result, "reddddddddddd")
        } else if (data.resultQualifyingRound && data.excelType == "qualifying") {
          console.log("in resultQualifyingRound", data);
          var resultKnockout = {};
          resultKnockout.sportType = "Qualifying";
          resultKnockout.matchId = data.matchId;
          resultKnockout.round = data.round;
          if (data.opponentsSingle[0]) {
            if (data.opponentsSingle[0].athleteId.middleName === undefined) {
              resultKnockout.player2 = "-";
              resultKnockout.player1 = data.opponentsSingle[0].athleteId.firstName + ' ' + data.opponentsSingle[0].athleteId.surname;
            } else {
              resultKnockout.player2 = "-";
              resultKnockout.player1 = data.opponentsSingle[0].athleteId.firstName + ' ' + data.opponentsSingle[0].athleteId.middleName + ' ' + data.opponentsSingle[0].athleteId.surname;
            }
            // resultKnockout.player1 = data.opponentsSingle[0].athleteId.fullname;
          } else {
            resultKnockout.player2 = "-";
            resultKnockout.player1 = "-";
          }

          resultKnockout.set = data.resultQualifyingRound.player.finalScore;

          // resultKnockout.result = data.resultQualifyingRound.player.result;
          // console.log("data", data);
          $scope.result.push(resultKnockout);
          // console.log(resultKnockout, "naavin")
        } else if (data.resultKnockout && data.excelType == "knockout") {
          console.log("in resultQualifyingRound", data);
          var resultKnockout = {};

          resultKnockout.matchId = data.matchId;
          resultKnockout.round = data.round;
          if (data.opponentsSingle[0]) {
            if (data.opponentsSingle[0].athleteId.middleName === undefined) {
              resultKnockout.player2 = data.opponentsSingle[1].athleteId.firstName + ' ' + data.opponentsSingle[1].athleteId.surname;
              resultKnockout.player1 = data.opponentsSingle[0].athleteId.firstName + ' ' + data.opponentsSingle[0].athleteId.surname;
            } else {
              resultKnockout.player2 = data.opponentsSingle[1].athleteId.firstName + ' ' + data.opponentsSingle[1].athleteId.middleName + ' ' + data.opponentsSingle[1].athleteId.surname;
              resultKnockout.player1 = data.opponentsSingle[0].athleteId.firstName + ' ' + data.opponentsSingle[0].athleteId.middleName + ' ' + data.opponentsSingle[0].athleteId.surname;
            }
            // resultKnockout.player1 = data.opponentsSingle[0].athleteId.fullname;
          } else {
            resultKnockout.player2 = "-";
            resultKnockout.player1 = "-";
          }

          resultKnockout.set = data.resultKnockout.finalScore;

          // resultKnockout.result = data.resultQualifyingRound.player.result;
          // console.log("data", data);
          $scope.result.push(resultKnockout);
        } else if (data.resultQualifyingRound) {
          console.log("in resultQualifyingRound", data);
          if (data.resultShooting) {
            console.log('in shooting')
          } else {
            var resultKnockout = {};
            resultKnockout.sportType = "QualifyingRound";
            resultKnockout.matchId = data.matchId;
            resultKnockout.round = data.round;
            if (data.opponentsSingle[0]) {
              if (data.opponentsSingle[0].athleteId.middleName === undefined) {
                resultKnockout.player1 = data.opponentsSingle[0].athleteId.firstName + ' ' + data.opponentsSingle[0].athleteId.surname
              } else {
                resultKnockout.player1 = data.opponentsSingle[0].athleteId.firstName + ' ' + data.opponentsSingle[0].athleteId.middleName + ' ' + data.opponentsSingle[0].athleteId.surname
              }
              // resultKnockout.player1 = data.opponentsSingle[0].athleteId.fullname;
            } else {
              resultKnockout.player1 = "-";
            }
            var i = 0;
            _.each(data.resultQualifyingRound.player.attempt, function (n) {
              if (i == 0) {
                resultKnockout.set = n;
                i++;
              } else {
                resultKnockout.set = resultKnockout.set + "," + n;
              }
            })
            resultKnockout.result = data.resultQualifyingRound.player.result;
            // console.log("data", data);
            $scope.result.push(resultKnockout);
            console.log(resultKnockout, "naavin")
          }

        } else if (data.resultHeat) {
          // var resultKnockout = {};
          // resultKnockout.matchId = data.matchId;
          // resultKnockout.round = data.round;
          // if (data.opponentsSingle[0]) {
          //   if (data.opponentsSingle[0].athleteId.middleName === undefined) {
          //     resultKnockout.player1 = data.opponentsSingle[0].athleteId.firstName + ' ' + data.opponentsSingle[0].athleteId.surname
          //   } else {
          //     resultKnockout.player1 = data.opponentsSingle[0].athleteId.firstName + ' ' + data.opponentsSingle[0].athleteId.middleName + ' ' + data.opponentsSingle[0].athleteId.surname
          //   }
          //   // resultKnockout.player1 = data.opponentsSingle[0].athleteId.fullname;
          // } else {
          //   resultKnockout.player1 = "-";
          // }
          // if (data.opponentsSingle[1]) {
          //   if (data.opponentsSingle[1].athleteId.middleName === undefined) {
          //     resultKnockout.player2 = data.opponentsSingle[1].athleteId.firstName + ' ' + data.opponentsSingle[1].athleteId.surname
          //   } else {
          //     resultKnockout.player2 = data.opponentsSingle[1].athleteId.firstName + ' ' + data.opponentsSingle[1].athleteId.middleName + ' ' + data.opponentsSingle[1].athleteId.surname
          //   }
          //   // resultKnockout.player2 = data.opponentsSingle[1].athleteId.fullname;
          // } else {
          //   resultKnockout.player2 = "-";
          // }
          // resultKnockout.set = "-";
          // resultKnockout.sportType = "H"
          // console.log("data", data);
          // $scope.result.push(resultKnockout);
        } else {
          console.log('result else', data);
          if (data.sport.sportslist.drawFormat.name == 'Knockout') {
            $scope.team = data.sport.sportslist.sportsListSubCategory.isTeam;
            $scope.format = data.sport.sportslist.sportsListSubCategory.sportsListCategory.name
            // if ($scope.team == true) {
            //   data.dummyType = 'TK';
            //   $scope.result.push(data);
            // } 
            if ($scope.format == "Combat Sports") {
              console.log('hello', data);
              var resultKnockout = {};
              console.log("in combat");
              resultKnockout.set = '-';
              resultKnockout.matchId = data.matchId;
              resultKnockout.round = data.round;
              resultKnockout._id = data._id;
              if (data.opponentsSingle[0]) {
                if (data.opponentsSingle[0].athleteId.middleName === undefined) {
                  resultKnockout.player1 = data.opponentsSingle[0].athleteId.firstName + ' ' + data.opponentsSingle[0].athleteId.surname
                } else {
                  resultKnockout.player1 = data.opponentsSingle[0].athleteId.firstName + ' ' + data.opponentsSingle[0].athleteId.middleName + ' ' + data.opponentsSingle[0].athleteId.surname
                }
              } else {
                resultKnockout.player1 = "-";
              }
              if (data.opponentsSingle[1]) {
                if (data.opponentsSingle[1].athleteId.middleName === undefined) {
                  resultKnockout.player2 = data.opponentsSingle[1].athleteId.firstName + ' ' + data.opponentsSingle[1].athleteId.surname
                } else {
                  resultKnockout.player2 = data.opponentsSingle[1].athleteId.firstName + ' ' + data.opponentsSingle[1].athleteId.middleName + ' ' + data.opponentsSingle[1].athleteId.surname
                }
                // resultKnockout.player2 = data.opponentsSingle[1].athleteId.fullname;
              } else {
                resultKnockout.player2 = "-";
              }
              // if (_.isEmpty(data.opponentsSingle)) {
              //   resultKnockout.isTeam = true;
              // } else {
              resultKnockout.isTeam = false;
              // }
              resultKnockout.sportType = "Combat";
              $scope.result.push(resultKnockout);
            } else if ($scope.format == "Racquet Sports") {
              var resultKnockout = {};
              console.log("in Racquet");
              resultKnockout.set = '-';
              // var playerLength = data.resultsRacquet.players.length;
              resultKnockout.matchId = data.matchId;
              resultKnockout.round = data.round;
              resultKnockout._id = data._id
              if (data.opponentsSingle[0]) {
                if (data.opponentsSingle[0].athleteId.middleName === undefined) {
                  resultKnockout.player1 = data.opponentsSingle[0].athleteId.firstName + ' ' + data.opponentsSingle[0].athleteId.surname
                } else {
                  resultKnockout.player1 = data.opponentsSingle[0].athleteId.firstName + ' ' + data.opponentsSingle[0].athleteId.middleName + ' ' + data.opponentsSingle[0].athleteId.surname
                }
                // resultKnockout.player1 = data.opponentsSingle[0].athleteId.fullname;
              } else {
                resultKnockout.player1 = "-";
              }
              if (data.opponentsSingle[1]) {
                if (data.opponentsSingle[1].athleteId.middleName === undefined) {
                  resultKnockout.player2 = data.opponentsSingle[1].athleteId.firstName + ' ' + data.opponentsSingle[1].athleteId.surname
                } else {
                  resultKnockout.player2 = data.opponentsSingle[1].athleteId.firstName + ' ' + data.opponentsSingle[1].athleteId.middleName + ' ' + data.opponentsSingle[1].athleteId.surname
                }
                // resultKnockout.player2 = data.opponentsSingle[1].athleteId.fullname;
              } else {
                resultKnockout.player2 = "-";
              }

              resultKnockout.isTeam = false;

              resultKnockout.sportType = "Racquet";
              $scope.result.push(resultKnockout);
              console.log($scope.result, "CHECK THIS")
            } else {
              toastr.error("something went wrong");
            }

          } else if (data.sport.sportslist.drawFormat.name == 'Heats') {
            data.dummyheat = "heat";
            // $scope.format = data.sport.sportslist.sportsListSubCategory.sportsListCategory.name
            // var resultKnockout = {};
            // resultKnockout.matchId = data.matchId;
            // resultKnockout.round = data.round;
            // if (data.opponentsSingle[0]) {
            //   if (data.opponentsSingle[0].athleteId.middleName === undefined) {
            //     resultKnockout.player1 = data.opponentsSingle[0].athleteId.firstName + ' ' + data.opponentsSingle[0].athleteId.surname
            //   } else {
            //     resultKnockout.player1 = data.opponentsSingle[0].athleteId.firstName + ' ' + data.opponentsSingle[0].athleteId.middleName + ' ' + data.opponentsSingle[0].athleteId.surname
            //   }
            //   // resultKnockout.player1 = data.opponentsSingle[0].athleteId.fullname;
            // } else {
            //   resultKnockout.player1 = "-";
            // }
            // if (data.opponentsSingle[1]) {
            //   if (data.opponentsSingle[1].athleteId.middleName === undefined) {
            //     resultKnockout.player2 = data.opponentsSingle[1].athleteId.firstName + ' ' + data.opponentsSingle[1].athleteId.surname
            //   } else {
            //     resultKnockout.player2 = data.opponentsSingle[1].athleteId.firstName + ' ' + data.opponentsSingle[1].athleteId.middleName + ' ' + data.opponentsSingle[1].athleteId.surname
            //   }
            //   // resultKnockout.player2 = data.opponentsSingle[1].athleteId.fullname;
            // } else {
            //   resultKnockout.player2 = "-";
            // }
            // resultKnockout.set = "-";
            // resultKnockout.sportType = "H";
            // $scope.result.push(resultKnockout);
            // console.log("data", $scope.result);

          } else if (data.sport.sportslist.drawFormat.name == 'League cum Knockout') {

          } else if (data.sport.sportslist.drawFormat.name == 'Qualifying Round') {
            console.log("in again")
            console.log("in resultQualifyingRound", data);
            var resultKnockout = {};
            resultKnockout.sportType = "Qualifying";
            resultKnockout.matchId = data.matchId;
            resultKnockout.round = data.round;
            if (data.opponentsSingle[0]) {
              if (data.opponentsSingle[0].athleteId.middleName === undefined) {
                resultKnockout.player2 = "-";
                resultKnockout.player1 = data.opponentsSingle[0].athleteId.firstName + ' ' + data.opponentsSingle[0].athleteId.surname;
              } else {
                resultKnockout.player2 = "-";
                resultKnockout.player1 = data.opponentsSingle[0].athleteId.firstName + ' ' + data.opponentsSingle[0].athleteId.middleName + ' ' + data.opponentsSingle[0].athleteId.surname;
              }
              // resultKnockout.player1 = data.opponentsSingle[0].athleteId.fullname;
            } else {
              resultKnockout.player2 = "-";
              resultKnockout.player1 = "-";
            }

            resultKnockout.set = '-';

            // resultKnockout.result = data.resultQualifyingRound.player.result;
            // console.log("data", data);
            $scope.result.push(resultKnockout);


          } else if (data.sport.sportslist.drawFormat.name == 'Qualifying Knockout') {
            console.log("in resultQualifyingRound", data);
            var resultKnockout = {};

            resultKnockout.matchId = data.matchId;
            resultKnockout.round = data.round;
            if (data.opponentsSingle[0]) {
              if (data.opponentsSingle[0].athleteId.middleName === undefined) {
                resultKnockout.player2 = data.opponentsSingle[1].athleteId.firstName + ' ' + data.opponentsSingle[1].athleteId.surname;
                resultKnockout.player1 = data.opponentsSingle[0].athleteId.firstName + ' ' + data.opponentsSingle[0].athleteId.surname;
              } else {
                resultKnockout.player2 = data.opponentsSingle[1].athleteId.firstName + ' ' + data.opponentsSingle[1].athleteId.middleName + ' ' + data.opponentsSingle[1].athleteId.surname;
                resultKnockout.player1 = data.opponentsSingle[0].athleteId.firstName + ' ' + data.opponentsSingle[0].athleteId.middleName + ' ' + data.opponentsSingle[0].athleteId.surname;
              }
              // resultKnockout.player1 = data.opponentsSingle[0].athleteId.fullname;
            } else {
              resultKnockout.player2 = "-";
              resultKnockout.player1 = "-";
            }

            resultKnockout.set = '-';
            resultKnockout.sportType = "QualifyingKnockout"

            // resultKnockout.result = data.resultQualifyingRound.player.result;
            // console.log("data", data);
            $scope.result.push(resultKnockout);

          } else if (data.sport.sportslist.drawFormat.name == 'Swiss League') {
            _.each(data.opponentsSingle, function (key, index) {
              console.log(key, "key in each")
              if (key.athleteId.middleName == undefined) {
                key.athleteId.fullName = key.athleteId.firstName + ' ' + key.athleteId.surname;
              } else {
                key.athleteId.fullName = key.athleteId.firstName + key.athleteId.middleName + key.athleteId.surname;
              }
              data.resultSwiss.players[index].fullName = key.athleteId.fullName;

            })
          }
        }
      });
    });
  }
  $scope.viewTable();



  $scope.remove = function () {
    console.log("enter")
    // $.jStorage.flush();
    // $state.go('matches');

    // NavigationService.removeDetail();
    // $state.go('matches');
    // $.jStorage.set("detail", null);
    $.jStorage.deleteKey('detail');
    $state.go('matches');

  }
  $scope.confDel = function (data) {
    console.log(data, "modal id")
    $scope.id = data;
    console.log(data, "delete")
    $scope.modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'views/modal/delete.html',
      backdrop: 'static',
      keyboard: false,
      size: 'sm',
      scope: $scope
    });
  };


  $scope.noDelete = function () {
    $scope.modalInstance.close();
  }

  $scope.delete = function (data) {
    console.log(data, "ID");
    $scope.url = "Match/delete";
    $scope.constraints = {};
    $scope.constraints._id = data;
    console.log($scope.constraints, "constraints")
    NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
      if (data.value) {
        console.log(data.value, "in modal")
        toastr.success('Successfully Deleted', 'Age Group Message');
        $scope.modalInstance.close();
        $state.reload();
        // console.log($scope.viewTable());
        // $scope.viewTable();
      } else {
        toastr.error('Something Went Wrong while Deleting', 'Age Group Message');
      }

    });
  }

  $scope.specificFormat = function (data) {
    console.log("click")
    console.log("data", data);
    if (data.isTeam || data.resultHeat || data.sportType) {
      console.log('enter');
      if (data.isTeam == false) {
        console.log("team fasle")
        if (data.sportType == "Combat" || data.sportType == "Racquet") {
          $state.go('detailplayer', {
            id: data.matchId
          });
        } else {
          toastr.error("Something went wrong")
        }
      } else if (data.isTeam == true) {
        if (data.sportType == "Combat" || data.sportType == "Racquet") {
          $state.go('detailteam', {
            id: data.matchId
          });
        } else {
          toastr.error("team error")
        }
      } else if (data.resultHeat) {
        $state.go('detail-heats', {
          id: data.matchId
        });
      } else if (data.sportType == "QualifyingRound") {
        console.log(data.sportType, "data.sportType")
        $state.go('detail-qualifying', {
          id: data.matchId
        });
      } else if (data.sportType == "Qualifying") {
        console.log(data.sportType, "data.sportType")
        $state.go('detail-qualifying', {
          id: data.matchId
        });
      } else if (data.sportType == "QualifyingKnockout") {
        console.log(data.sportType, "data.sportType")
        $state.go('detail-qualifying', {
          id: data.matchId
        });
      }
    } else {
      console.log("i am in ");
      console.log(data.dummyheat, "type equal ");
      if (data.dummyheat == "heat") {
        console.log("in");
        $state.go('detail-heats', {
          id: data.matchId
        });
      } else if (data.sport.sportslist.drawFormat.name == "Swiss League") {
        console.log("i am in swiss");
        $state.go('detailplayer', {
          id: data.matchId
        });
      } else if (data.sport.sportslist.drawFormat.name == "League cum Knockout") {
        console.log("in league cum knockout")
        $state.go('detailplayer', {
          id: data.matchId
        });
      } else if (data.sport.sportslist.sportsListSubCategory.name === 'Shooting') {
        console.log("in shooting")
        $state.go('detail-qualifying', {
          id: data.matchId
        });

      }
    }

  }
})
// FORMAT TABLE END



// EDIT PLAYER ONLY FOR RACQUET AND COMBAT
myApp.controller('DetailPlayerCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal) {
  //Used to name the .html file
  $scope.template = TemplateService.changecontent("detailplayer");
  $scope.menutitle = NavigationService.makeactive("Edit Player");
  TemplateService.title = $scope.menutitle;
  $scope.navigation = NavigationService.getnav();
  $scope.formData = {};
  $scope.matchData = {};
  $scope.formData.scorecard = [];



  // STATUS LIST
  $scope.statusList = ["IsLive", "IsPending", "IsCompleted"];
  // STATUS LIST END
  $scope.getOneBackend = function () {
    $scope.matchData.matchId = $stateParams.id;
    console.log($scope.matchData, "match id")
    NavigationService.getOneBackend($scope.matchData, function (data) {
      console.log(data, "get data");
      if (data.value == true) {
        $scope.matchDetails = data.data;
        $scope.matchDetails.matchId = $scope.matchData.matchId;
        $scope.formData = data.data;

        $scope.sportName = $scope.formData.sport.sportslist.sportsListSubCategory.sportsListCategory.name;
        switch ($scope.sportName) {
          case "Combat Sports":
            if ($scope.formData.sport.sportslist.sportsListSubCategory.name === 'Fencing') {
              console.log("in switch fencing")
              $scope.formData.result = $scope.formData.resultFencing;
            } else {
              console.log("in switch")
              $scope.formData.result = $scope.formData.resultsCombat;
            }
            break;
          case "Racquet Sports":
            console.log("in racquet")
            $scope.formData.result = $scope.formData.resultsRacquet;
            break;
          case "Individual Sports":
            console.log("in chess")
            $scope.formData.result = $scope.formData.resultSwiss;
        }

        _.each($scope.formData.opponentsSingle, function (key, index) {
          console.log($scope.formData.opponentsSingle, 'plr');
          if (key.athleteId.middleName == undefined) {
            key.athleteId.fullName = key.athleteId.firstName + ' ' + key.athleteId.surname;
          } else {
            key.athleteId.fullName = key.athleteId.firstName + key.athleteId.middleName + key.athleteId.surname;
          }

          // key.fullName = key.firstName + ' ' + key.surname;

          if ($scope.formData.resultsCombat) {
            _.each($scope.formData.resultsCombat.players, function (value) {
              key.noShow = value.noShow;
              key.walkover = value.walkover;
              _.each(value.sets, function (data) {
                key.point = data.point;
              })
            })
          } else if ($scope.formData.resultSwiss) {

            $scope.formData.resultSwiss.players[index].fullName = key.athleteId.fullName;
            if (key.athleteId.school) {
              $scope.formData.resultSwiss.players[index].schoolName = key.athleteId.school.name;
            }

          } else if ($scope.formData.resultFencing) {
            console.log("in fencing")
            if (key.athleteId.school) {
              $scope.formData.resultFencing.players[index].schoolName = key.athleteId.school.name;
            }
          }

        })

        console.log($scope.formData)

      } else {
        console.log("ERROR IN getOneMatch");
        //redirect back to sportselection page
        // $state.go("sport-selection");
      }
    })
  };
  $scope.getOneBackend();
  console.log($scope.formData, "last");
  $scope.dateOptions = {
    dateFormat: "dd/mm/yy",
    changeYear: true,
    changeMonth: true,
    yearRange: "1900:2050"
  };
  $scope.changeDate = function (data) {
    console.log("ChangeDate Called");
    $scope.formData.scheduleDate = data;
  };
  // GET MATCH END
  // BACK
  $scope.back = function () {
    $scope.obj = $.jStorage.get("detail")
    $state.go('format-table', {
      type: $scope.obj.sportslist.drawFormat.name
    })
  }
  // BACK END
  // CHANGE OPPONENTS SINGLES
  $scope.changeOpponentSingles = function (id) {
    console.log(id, 'oppsingles id');
    console.log('loop for opp singles', $scope.matchDetails);
    _.each($scope.matchDetails.opponentsSingle, function (key) {
      console.log(key, 'in each')
      if (key.athleteId._id == id) {
        $scope.formData.result.winner.opponentsSingle = key._id;
      }

    })
  }
  // CHANGE OPPONENTS SINGLES END

  $scope.addField = function (data) {
    console.log('in add')
    $scope.formData.resultsRacquet.players[data].sets.push({
      'ace': '',
      'doubleFaults': '',
      'point': '',
      'serviceError': '',
      'unforcedError': '',
      'winner': ''

    })
  };

  $scope.removeField = function (data, index) {
    console.log(data, index, 'in remove')
    $scope.formData.resultsRacquet.players[data].sets.splice(index, 1);
  }
  // SAVE
  $scope.saveDataMatch = function () {
    $scope.formData.matchId = $stateParams.id;
    console.log($scope.formData, "save");
    $scope.obj = $.jStorage.get("detail")
    NavigationService.saveMatch($scope.formData, function (data) {
      console.log(data);
      if (data.value == true) {
        toastr.success("Data saved successfully", 'Success');
        $state.go('format-table', {
          type: $scope.obj.sportslist.drawFormat.name
        })
      } else {
        toastr.error("Data save failed ,please try again or check your internet connection", 'Save error');
      }
    })

  }
  // SAVE-END
})
// END EDIT PLAYER

// FOR HEATS AND QUALIFYING SEE heats.js