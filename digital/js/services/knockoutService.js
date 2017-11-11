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
          }
          if (tempNoshow) {
            value.noShow = tempNoshow.noShow;

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
              }
              if (tempNoshow) {
                value.noShow = tempNoshow.noShow;
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

  //for league-knockout
  this.sortLeagueKnockoutResult = function (result) {
    if (result.opponentsTeam.length > 0) {
      _.each(result.opponentsTeam, function (team, index) {
        if (result.resultFootball !== undefined) {
          if (team._id === result.resultFootball.winner.player) {
            team.isWinner = true;
          }
        } else if (result.resultHockey !== undefined) {
          if (team._id === result.resultHockey.winner.player) {
            team.isWinner = true;
          }
        }
        if (result.resultFootball !== undefined && result.resultFootball.teams) {
          _.each(result.resultFootball.teams, function (n) {
            n.walkover = NavigationService.Boolean(n.walkover);
            n.noShow = NavigationService.Boolean(n.noShow);
            team.finalPoint = result.resultFootball.teams[index].teamResults.finalPoints;

          });
          var tempWakover = _.find(result.resultFootball.teams, ['walkover', true]);
          var tempNoshow = _.find(result.resultFootball.teams, ['noShow', true]);
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

        if (result.resultHockey !== undefined && result.resultHockey.teams) {
          _.each(result.resultHockey.teams, function (n) {
            n.walkover = NavigationService.Boolean(n.walkover);
            n.noShow = NavigationService.Boolean(n.noShow);
            team.finalPoint = result.resultHockey.teams[index].teamResults.finalPoints;

          });
          var tempWakover = _.find(result.resultHockey.teams, ['walkover', true]);
          var tempNoshow = _.find(result.resultHockey.teams, ['noShow', true]);
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
    } else if (result.opponentsSingle.length > 0) {
      console.log(result.resultFencing, "result.resultFencing ");
      _.each(result.opponentsSingle, function (player, index) {
        if (player && player.athleteId != null) {
          player.fullName = player.athleteId.firstName + ' ' + player.athleteId.surname;
          if (player.athleteId.school && player.athleteId.school != null) {
            player.schoolName = player.athleteId.school.name;
          } else {
            player.schoolName = player.athleteId.atheleteSchoolName;
          }

        }
        if (result.resultFencing !== undefined) {
          if (player._id === result.resultFencing.winner.opponentsSingle) {
            player.isWinner = true;
          } else {
            player.isWinner = false;
          }
        }
        if (result.resultFencing !== undefined && result.resultFencing.players) {
          _.each(result.resultFencing.players, function (n) {
            n.walkover = NavigationService.Boolean(n.walkover);
            n.noShow = NavigationService.Boolean(n.noShow);
            player.finalPoint = result.resultFencing.players[index].finalPoints;

          });
          var tempWakover = _.find(result.resultFencing.players, ['walkover', true]);
          var tempNoshow = _.find(result.resultFencing.players, ['noShow', true]);
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
    }
    if (result.resultFootball) {
      console.log("im in resultfootball");
      result.isNoMatch = result.resultFootball.isNoMatch;
      result.isDraw = result.resultFootball.isDraw;
      result.status = result.resultFootball.status;
    } else if (result.resultFencing) {
      console.log("im in result fencing");
      result.isNoMatch = result.resultFencing.isNoMatch;
      result.isDraw = result.resultFencing.isDraw;
      result.status = result.resultFencing.status;

    } else if (result.resultHockey) {
      result.isNoMatch = result.resultHockey.isNoMatch;
      result.isDraw = result.resultHockey.isDraw;
      result.status = result.resultHockey.status;
    }

    return result;
  };

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
