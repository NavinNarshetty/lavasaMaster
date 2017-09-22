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
    if (result.opponentsTeam) {
      _.each(result.opponentsTeam, function (team, index) {
        if (result.resultFootball !== undefined) {
          if (team._id === result.resultFootball.winner.player) {
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
          }
          if (tempNoshow) {
            result.noShow = tempNoshow.noShow;
          }

        }

      });
    }
    if (result.resultFootball) {
      result.isNoMatch = result.resultFootball.isNoMatch;
      result.isDraw = result.resultFootball.isDraw;
      result.status = result.resultFootball.status;
    } else {
      console.log("im in else");
    }

    return result;
  };



});