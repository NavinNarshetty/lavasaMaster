myApp.service('knockoutService', function ($http, TemplateService, $state, toastr, $uibModal, NavigationService) {
  //for Knockout-Team opponentsTeam
  this.sortResult = function (roundsList) {
    _.each(roundsList, function (key) {
      _.each(key.match, function (value) {
        if (value && value.finalResult && value.finalResult.teams) {
          value.status = value.finalResult.status;
          value.isNoMatch = value.finalResult.isNoMatch;
          _.each(value.finalResult.teams, function (n) {
            n.walkover = NavigationService.Boolean(n.walkover);
            n.noShow = NavigationService.Boolean(n.noShow);
          });
          var tempWakover = _.find(value.finalResult.teams, ['walkover', true]);
          var tempNoshow = _.find(value.finalResult.teams, ['noShow', true]);
          if (tempWakover) {
            value.walkover = tempWakover.walkover;
          } else {
            value.walkover = false;
          }
          if (tempNoshow) {
            value.noShow = tempNoshow.noShow;

          } else {
            value.noShow = false;
          }
          _.each(value.opponentsTeam, function (team) {
            if (team._id && value.finalResult && value.finalResult.winner) {
              if (team._id === value.finalResult.winner.player) {
                team.isWinner = true;
                value.isWinner = team.isWinner;
                value.reason = value.finalResult.winner.reason;
                value.winnerName = team.schoolName;

              } else {
                team.isWinner = false;
              }
            }

          });
        }

      });
    });
    return roundsList;
  };

  //for Knockout OpponentsSingle

  this.sortKnockoutResult = function (roundsList) {
    _.each(roundsList, function (key) {
      _.each(key.match, function (value) {
        _.each(value.opponentsSingle, function (obj) {
          if (obj && obj.athleteId) {
            obj.athleteId.fullName = obj.athleteId.firstName + '  ' + obj.athleteId.surname;
            if (value && value.finalResult) {
              _.each(value.finalResult.players, function (key) {
                key.walkover = NavigationService.Boolean(key.walkover);
                key.noShow = NavigationService.Boolean(key.noShow);
              });
              var tempWakover = _.find(value.finalResult.players, ['walkover', true]);
              var tempNoshow = _.find(value.finalResult.players, ['noShow', true]);
              if (tempWakover) {
                value.walkover = tempWakover.walkover;
              } else {
                value.walkover = false;
              }
              if (tempNoshow) {
                value.noShow = tempNoshow.noShow;
              } else {
                value.noShow = false;
              }
              value.status = value.finalResult.status;
              value.isNoMatch = value.finalResult.isNoMatch;
              value.video = value.finalResult.video;
              if (value.finalResult.winner) {
                value.reason = value.finalResult.winner.reason;
                if (obj && obj.athleteId && (obj.athleteId._id === value.finalResult.winner.player)) {
                  obj.isWinner = true;
                  value.isWinner = obj.isWinner;
                  value.winnerName = obj.athleteId.fullName;
                } else {
                  obj.isWinner = false;
                }
              }
            }
          }

        });

      });
    });
    return roundsList;

  };

  //===================Start of sorting result of league-cum-knockout==================
  //resutLeagueCumKnockout() for Team Sport
  this.resutLeagueCumKnockout = function (result) {
    console.log("result", result);
    _.each(result.opponentsTeam, function (team, index) {
      if (result.globalResult) {
        if (result.globalResult !== undefined) {
          if (team._id === result.globalResult.winner.player) {
            team.isWinner = true;
          }
          result.status = result.globalResult.status;
          result.isNoMatch = result.globalResult.isNoMatch;
          result.isDraw = result.globalResult.isDraw;
        }
        if (result.globalResult !== undefined && result.globalResult.teams) {
          _.each(result.globalResult.teams, function (n) {
            n.walkover = NavigationService.Boolean(n.walkover);
            n.noShow = NavigationService.Boolean(n.noShow);
            team.finalPoint = result.globalResult.teams[index].teamResults.finalPoints;

          });
          var tempWakover = _.find(result.globalResult.teams, ['walkover', true]);
          var tempNoshow = _.find(result.globalResult.teams, ['noShow', true]);
          if (tempWakover) {
            result.walkover = tempWakover.walkover;
          } else {
            result.walkover = false;
          }
          if (tempNoshow) {
            result.noShow = tempNoshow.noShow;
          } else {
            result.noShow = false;
          }

        }
      }
    });
  };
  //End of resutLeagueCumKnockout() 

  //resutLeagueCumKnockoutIndividual() for Individual Sport
  this.resutLeagueCumKnockoutIndividual = function (result) {
    _.each(result.opponentsSingle, function (player, index) {
      if (player && player.athleteId != null) {
        player.fullName = player.athleteId.firstName + ' ' + player.athleteId.surname;
        if (player.athleteId.school && player.athleteId.school != null) {
          player.schoolName = player.athleteId.school.name;
        } else {
          player.schoolName = player.athleteId.atheleteSchoolName;
        }

      }
      if (result.globalResultIndividual !== undefined) {
        if (player._id === result.globalResultIndividual.winner.opponentsSingle) {
          player.isWinner = true;
        } else {
          player.isWinner = false;
        }
        result.isNoMatch = result.globalResultIndividual.isNoMatch;
        result.isDraw = result.globalResultIndividual.isDraw;
        result.status = result.globalResultIndividual.status;
      }
      if (result.globalResultIndividual !== undefined && result.globalResultIndividual.players) {
        _.each(result.globalResultIndividual.players, function (n) {
          n.walkover = NavigationService.Boolean(n.walkover);
          n.noShow = NavigationService.Boolean(n.noShow);
          player.finalPoint = result.globalResultIndividual.players[index].finalPoints;

        });
        var tempWakover = _.find(result.globalResultIndividual.players, ['walkover', true]);
        var tempNoshow = _.find(result.globalResultIndividual.players, ['noShow', true]);
        if (tempWakover) {
          result.walkover = tempWakover.walkover;
        } else {
          result.walkover = false;
        }
        if (tempNoshow) {
          result.noShow = tempNoshow.noShow;
        } else {
          result.noShow = false;
        }

      }
    });


  };
  //End of resutLeagueCumKnockoutIndividual() 
  this.sortLeagueKnockoutResult = function (result) {
    if (result.opponentsTeam.length > 0) {
      //for opponentsTeam
      if (result.resultFootball) {
        result.globalResult = result.resultFootball;
      } else if (result.resultHockey) {
        result.globalResult = result.resultHockey;
      } else if (result.resultVolleyball) {
        result.globalResult = result.resultVolleyball;
      } else if (result.resultBasketball) {
        result.globalResult = result.resultBasketball;
      } else if (result.resultHandball) {
        result.globalResult = result.resultHandball;
      } else if (result.resultWaterPolo) {
        result.globalResult = result.resultWaterPolo;
      } else if (result.resultKabaddi) {
        result.globalResult = result.resultKabaddi;
      } else {
        toastr.error("New Team Sport Found", 'Error Message');
      }
      //function resutLeagueCumKnockout to  Teamsport result 
      this.resutLeagueCumKnockout(result);

    } else if (result.opponentsSingle.length > 0) {
      //for opponentsSingle
      if (result.resultFencing) {
        result.globalResultIndividual = result.resultFencing;
      } else {
        toastr.error("New Individual Sport found in League-cum-knockout", 'Error Message');
      }
      this.resutLeagueCumKnockoutIndividual(result);

    }


    return result;
  };
  //===================End of sorting result of league-cum-knockout==================
  this.scrollTo = function (destination, type) {
    if (type == 'id') {
      var destination = '#' + destination;
    } else if (type == 'class') {
      var destination = '.' + destination;
    }
    console.log(destination, type, 'in dir')
    $('html,body').animate({
      scrollTop: $(destination).offset().top
    },
      'slow');
  };


});