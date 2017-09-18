myApp.service('knockoutService', function ($http, TemplateService, $state, toastr, $uibModal, NavigationService) {
  //for Knockout-Team opponentsTeam
  this.sortResult = function (roundsList) {
    _.each(roundsList, function (key) {
      _.each(key.match, function (value) {
        if (value && value.finalResult && value.finalResult.teams) {
          value.status = value.finalResult.status;
          value.isNoMatch = value.finalResult.isNoMatch;
          _.each(value.finalResult.teams, function (n) {
            n.walkover = Boolean(n.walkover);
            n.noShow = Boolean(n.noShow);
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
                key.walkover = Boolean(key.walkover);
                key.noShow = Boolean(key.noShow);
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



});