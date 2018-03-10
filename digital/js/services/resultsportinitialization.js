myApp.factory('ResultSportInitialization', function (toastr) {
    var obj = {

        //for getting TEPLATE for result"Spotname" eg:resultFootball,resultBasketball etc
        getPlayerTemplate: function (sportName, player, flag) {
            console.log(player, "-----------------------");

            if (flag == 'team') {
                var format = {
                    player: player.studentId._id,
                    sfaId: player.studentId.sfaId,
                    jerseyNo: "",
                    isPlaying: false,
                    noShow: false,
                    walkover: false,
                    color: "",
                    playerPoints: {},
                    firstName: player.studentId.firstName,
                    surname: player.studentId.surname,
                    fullName: player.studentId.firstName + " " + player.studentId.surname
                };
                switch (sportName) {
                    case "Basketball":
                        format.playerPoints.freeThrow = [];
                        format.playerPoints.Points2 = [];
                        format.playerPoints.Points3 = [];
                        format.playerPoints.personalFoul = [];
                        format.playerPoints.technicalFoul = [];
                        format.playerPoints.in = [];
                        format.playerPoints.out = [];
                        break;
                    case "Hockey":
                        format.playerPoints.goal = [];
                        format.playerPoints.assist = [];
                        format.playerPoints.redCard = [];
                        format.playerPoints.yellowCard = [];
                        format.playerPoints.greenCard = [];
                        format.playerPoints.penaltyPoint = "";
                        format.playerPoints.in = [];
                        format.playerPoints.out = [];
                        break;
                    case "Kabaddi":
                        format.playerPoints.raids = [];
                        format.playerPoints.bonusPoint = [];
                        format.playerPoints.superRaid = [];
                        format.playerPoints.tackle = [];
                        format.playerPoints.in = [];
                        format.playerPoints.out = [];
                        break;
                    case "Handball":
                        format.playerPoints.goal = [];
                        format.playerPoints.yellowCard = [];
                        format.playerPoints.greenCard = [];
                        format.playerPoints.in = [];
                        format.playerPoints.out = [];
                        break;
                    case "Water Polo":
                        format.playerPoints.goal = [];
                        format.playerPoints.penaltyPoint = "";
                        format.playerPoints.in = [];
                        format.playerPoints.out = [];
                        break;
                    case "Volleyball":
                        format.playerPoints.in = [];
                        format.playerPoints.out = [];
                        break;
                    case "Football":
                        format.playerPoints.goals = [];
                        format.playerPoints.assist = [];
                        format.playerPoints.redCard = [];
                        format.playerPoints.yellowCard = [];
                        format.playerPoints.penaltyPoint = "";
                        format.playerPoints.in = [];
                        format.playerPoints.out = [];
                        break;
                };

                return format;
            } else if (flag == "indi") {
                var format = {
                    player: player.studentId._id,
                    sfaId: player.studentId.sfaId,
                    noShow: false,
                    walkover: false,
                    firstName: player.studentId.firstName,
                    surname: player.studentId.surname,
                    fullName: player.studentId.firstName + " " + player.studentId.surname
                };
                switch (sportName) {
                    case "BOXING":
                    case "JUDO":
                    case "TAEKWONDO":
                    case "KARATE":
                    case "WRESTLING":
                    case "CARROM":
                    case "KHO-KHO":
                        format.sets = [{
                            point: "",
                        }]
                        break;
                    case "TENNIS":
                    case " TABLE-TENNIS":
                    case "BADMINTON":
                        format.sets = [{
                            point: "",
                            ace: "",
                            winner: "",
                            unforcedError: "",
                            serviceError: "",
                            doubleFaults: ""
                        }]
                        break;
                };

                return format;
            }


        },

        getTeamTemplate: function (sportName, team) {
            console.log("getTeamTemplate", team);
            var format = {
                teamId: team.teamId,
                team: team._id,
                noShow: false,
                walkover: false,
                coach: "",
                schoolName: team.schoolName,
                teamResults: {},
                players: []
            };
            switch (sportName) {
                case "Basketball":
                    format.teamResults.quarterPoints = [{
                        basket: '',
                    }, {
                        basket: '',
                    }, {
                        basket: '',
                    }, {
                        basket: '',
                    }];
                    format.teamResults.finalGoalPoints = "";
                    break;
                case "Handball":
                    format.teamResults.halfPoints = "";
                    format.teamResults.finalPoints = "";
                    format.teamResults.shotsOnGoal = "";
                    format.teamResults.penalty = "";
                    format.teamResults.saves = "";
                    break;
                case "Hockey":
                    format.teamResults.halfPoints = "";
                    format.teamResults.finalPoints = "";
                    format.teamResults.shotsOnGoal = "";
                    format.teamResults.totalShots = "";
                    format.teamResults.penalty = "";
                    format.teamResults.penaltyPoints = "";
                    format.teamResults.penaltyCorners = "";
                    format.teamResults.penaltyStroke = "";
                    format.teamResults.saves = "";
                    format.teamResults.fouls = "";

                    break;
                case "Kabaddi":
                    format.teamResults.halfPoints = "";
                    format.teamResults.finalPoints = "";
                    // format.teamResults.goalPoints = [];
                    // format.teamResults.finalGoalPoints = "";
                    format.teamResults.superTackle = "";
                    format.teamResults.allOut = "";
                    break;

                case "Karate Team Kumite":
                    format.teamResults.finalPoints = "";
                    format.teamResults.sets = [];
                    break;

                case "Water Polo":
                    format.teamResults.quarterPoints = [{
                        points: '',
                    }, {
                        points: '',
                    }, {
                        points: '',
                    }, {
                        points: '',
                    }];
                    format.teamResults.finalGoalPoints = "";
                    format.teamResults.shotsOnGoal = "";
                    format.teamResults.totalShots = "";
                    format.teamResults.penalty = "";
                    format.teamResults.penaltyPoints = "";
                    format.teamResults.penalty = "";
                    format.teamResults.saves = "";
                    break;
                case "Volleyball":
                    format.teamResults.sets = [{
                        "points": ''
                    }];
                    format.teamResults.fouls = "";
                    format.teamResults.spike = "";
                    format.teamResults.block = "";
                    break;
                case "Football":
                    format.formation = "";
                    format.teamResults.halfPoints = "";
                    format.teamResults.finalPoints = "";
                    format.teamResults.shotsOnGoal = "";
                    format.teamResults.totalShots = "";
                    format.teamResults.corners = "";
                    format.teamResults.penalty = "";
                    format.teamResults.saves = "";
                    format.teamResults.fouls = "";
                    format.teamResults.offSide = "";
                    format.teamResults.cleanSheet = "";
                    format.teamResults.noShow = "";
                    format.teamResults.walkover = "";
                    break;
                case "Throwball":
                    format.teamResults.sets = [{
                        "points": ''
                    }];
                    format.teamResults.finalPoints = "";
                    break;
            };

            _.each(team.studentTeam, function (player, pk) {
                format.players[pk] = obj.getPlayerTemplate(sportName, player, "team");
            })

            return format;


        },

        initializeTeamAndPlayers: function (sportName, resultSportname, match) {
            // console.log(resultSportname, match);
            _.each(match.teams, function (team, tk) {
                resultSportname.teams[tk] = obj.getTeamTemplate(sportName, team);
            });
            return resultSportname;
        },

        getResultTemplate: function (sportName, match) {

            if (match && match.teams) {
                var format = {
                    "teams": [],
                    "matchPhoto": [],
                    "scoreSheet": [],
                    "status": "",
                    "winner": {},
                    "isNoMatch": false,
                    "isDraw": false
                };
                var returnResult = {};

                switch (sportName) {
                    case "Basketball":
                        returnResult.resultBasketball = format;
                        returnResult.resultBasketball = obj.initializeTeamAndPlayers(sportName, returnResult.resultBasketball, match);
                        return returnResult;

                    case "Football":
                        returnResult.resultFootball = format;
                        obj.initializeTeamAndPlayers(sportName, returnResult.resultFootball, match);
                        return returnResult;

                    case "Hockey":
                        returnResult.resultHockey = format;
                        obj.initializeTeamAndPlayers(sportName, returnResult.resultHockey, match);
                        return returnResult;

                    case "Kabaddi":
                        returnResult.resultKabaddi = format;
                        obj.initializeTeamAndPlayers(sportName, returnResult.resultKabaddi, match);
                        return returnResult;

                    case "Volleyball":
                        returnResult.resultVolleyball = format;
                        obj.initializeTeamAndPlayers(sportName, returnResult.resultVolleyball, match);
                        return returnResult;

                    case "Handball":
                        returnResult.resultHandball = format;
                        obj.initializeTeamAndPlayers(sportName, returnResult.resultHandball, match);
                        return returnResult;

                    case "Throwball":
                        returnResult.resultThrowball = format;
                        obj.initializeTeamAndPlayers(sportName, returnResult.resultThrowball, match);
                        return returnResult;

                    case "Water Polo":
                        returnResult.resultWaterPolo = format;
                        obj.initializeTeamAndPlayers(sportName, returnResult.resultWaterPolo, match);
                        return returnResult;

                    case "Karate Team Kumite":
                        returnResult.resultKumite = format;
                        obj.initializeTeamAndPlayers(sportName, returnResult.resultKumite, match);
                        return returnResult;

                }
            } else {
                $scope.format = {
                    "players": [],
                    "matchPhoto": [],
                    "scoreSheet": [],
                    "winner": {},
                    "isNoMatch": false
                }

                var returnResult = {};

                switch (sportName) {
                    case "BOXING":
                    case "JUDO":
                    case "TAEKWONDO":
                    case "KARATE":
                    case "WRESTLING":
                    case "CARROM":
                    case "KHO-KHO":
                        returnResult.resultsCombat = format;
                        _.each(format.players, function (player, pk) {
                            format.players[pk] = obj.getPlayerTemplate(sportName, player, "indi");
                        })
                        return returnResult;
                    case "TENNIS":
                    case "TABLE-TENNIS":
                    case "BADMINTON":
                        returnResult.resultsRacquet = format;
                        _.each(format.players, function (player, pk) {
                            format.players[pk] = obj.getPlayerTemplate(sportName, player, "indi");
                        })
                        return returnResult;

                }

            }


        },

        getMyResult: function (sportName, match, callback) {
            var template = obj.getResultTemplate(sportName, match);
            console.log("template", template);
            callback(template);
        },
        //for getting TEPLATE for result"Spotname" eg:resultFootball,resultBasketball etc end

        //for getting result variable that sport contains
        getResultVariable: function (sportName, sportType) {

            if (sportType == "Racquet Sports") {
                var arr = _.split(sportName, " ");
                var foundDoubles = _.indexOf(arr, 'Doubles');
                if (foundDoubles == -1) {
                    return {
                        resultVar: "resultsRacquet",
                        opponentsVar: "opponentsSingle"
                    };
                } else {
                    return {
                        resultVar: "resultsRacquet",
                        opponentsVar: "opponentsTeam"
                    };
                }

            } else if (sportType == "Combat Sports") {
                switch (sportName) {
                    case "Karate Team Kumite":
                        return {
                            resultVar: "resultKumite",
                            opponentsVar: "opponentsTeam",
                            html: "score-teamkumite.html",
                            opponentsVar: "opponentsTeam"
                        };
                    default:
                        return {
                            resultVar: "resultsCombat",
                            opponentsVar: "opponentsSingle"
                        };
                }

            } else if (sportType == "Individual Sports") {
                switch (sportName) {
                    case "Carrom":
                        return {
                            resultVar: "resultCombat",
                            opponentsVar: "opponentsSingle"
                        };
                    default:
                        return {
                            resultVar: "resultsCombat",
                            opponentsVar: "opponentsSingle"
                        };
                }
            } else {
                switch (sportName) {
                    case "Basketball":
                        return {
                            resultVar: "resultBasketball",
                            html: "scorebasketball.html",
                            scoringModal: "scoreplayer-basketball.html",
                            opponentsVar: "opponentsTeam"
                        };

                    case "Football":
                        return {
                            resultVar: "resultFootball",
                            html: "scorefootball.html",
                            scoringModal: "scoreplayer-football.html",
                            opponentsVar: "opponentsTeam"
                        };

                    case "Hockey":
                        return {
                            resultVar: "resultHockey",
                            html: "scorehockey.html",
                            scoringModal: "scoreplayer-hockey.html",
                            opponentsVar: "opponentsTeam"
                        };

                    case "Kabaddi":
                        return {
                            resultVar: "resultKabaddi",
                            html: "scorekabaddi.html",
                            scoringModal: "scoreplayer-kabaddi.html",
                            opponentsVar: "opponentsTeam"
                        };

                    case "Volleyball":
                        return {
                            resultVar: "resultVolleyball",
                            html: "scorevolleyball.html",
                            scoringModal: "scoreplayer-volleyball.html",
                            opponentsVar: "opponentsTeam"
                        };

                    case "Handball":
                        return {
                            resultVar: "resultHandball",
                            html: "scorehandball.html",
                            scoringModal: "scoreplayer-handball.html",
                            opponentsVar: "opponentsTeam"
                        };

                    case "Water Polo":
                        return {
                            resultVar: "resultWaterPolo",
                            html: "scorewaterpolo.html",
                            scoringModal: "scoreplayer-waterpolo.html",
                            opponentsVar: "opponentsTeam"
                        };
                    case "Throwball":
                        return {
                            resultVar: "resultThrowball",
                            opponentsVar: "opponentsTeam",
                            html: "scorethrowball.html"
                        };
                    case "Kho Kho":
                        return {
                            resultVar: "resultsCombat",
                            opponentsVar: "opponentsTeam"
                        };
                }
            }


        },
        //for getting result variable that sport contains ends

        getFormattedObject: function (isArray) {
            var obj = {
                isObj: false
            }
            if (isArray) {
                obj.isObj = true;
                obj.obj = {
                    time: ""
                };
            }
            return obj;
        },

        nullOrEmptyTo0: function (sportName, format) {
            var nullScore = false;
            switch (sportName) {
                case "Basketball":

                    var isThereNullBaskets = (_.findIndex(format.teamResults.quarterPoints, ['basket', null]) != -1) || (_.findIndex(format.teamResults.quarterPoints, ['basket', undefined]) != -1) ? true : false;
                    var isThereNulLFinalScore = (_.isNull(format.teamResults.finalGoalPoints) || format.teamResults.finalGoalPoints==undefined || format.teamResults.finalGoalPoints==="");
                    nullScore = (isThereNullBaskets || isThereNulLFinalScore);

                    // nullScore = format.teamResults.quarterPoints[0].basket || true;
                    // nullScore = format.teamResults.quarterPoints[1].basket || true;
                    // nullScore = format.teamResults.quarterPoints[2].basket || true;
                    // nullScore = format.teamResults.quarterPoints[3].basket || true;
                    // nullScore = format.teamResults.finalGoalPoints || true;
                    break;

                case "Handball":


                    nullScore = (_.isNull(format.teamResults.halfPoints) || format.teamResults.halfPoints==undefined || format.teamResults.halfPoints ==="" || _.isNull(format.teamResults.finalPoints) || format.teamResults.finalPoints == undefined || format.teamResults.finalPoints === "" || _.isNull(format.teamResults.shotsOnGoal) ||format.teamResults.shotsOnGoal == undefined || format.teamResults.shotsOnGoal === "" || _.isNull(format.teamResults.penalty) || format.teamResults.penalty == undefined || format.teamResults.penalty === "" || _.isNull(format.teamResults.saves) || format.teamResults.saves == undefined || format.teamResults.saves === "" );


                    // format.teamResults.halfPoints = format.teamResults.halfPoints || 0;
                    // format.teamResults.finalPoints = format.teamResults.finalPoints || 0;
                    // format.teamResults.shotsOnGoal = format.teamResults.shotsOnGoal || 0;
                    // format.teamResults.penalty = format.teamResults.penalty || 0;
                    // format.teamResults.saves = format.teamResults.saves || 0;
                    break;

                case "Hockey":
                    nullScore = (_.isNull(format.teamResults.halfPoints) || format.teamResults.halfPoints==undefined || format.teamResults.halfPoints==="" || _.isNull(format.teamResults.finalPoints) || format.teamResults.finalPoints == undefined || format.teamResults.finalPoints ==="" || _.isNull(format.teamResults.shotsOnGoal) || format.teamResults.shotsOnGoal == undefined || format.teamResults.shotsOnGoal ==="" || _.isNull(format.teamResults.penalty) || format.teamResults.penalty == undefined || format.teamResults.penalty ===""  || _.isNull(format.teamResults.totalShots) || format.teamResults.totalShots == undefined || format.teamResults.totalShots ==="" || _.isNull(format.teamResults.penaltyPoints) || format.teamResults.penaltyPoints == undefined || format.teamResults.penaltyPoints === "" || _.isNull(format.teamResults.penaltyCorners) || format.teamResults.penaltyCorners == undefined || format.teamResults.penaltyCorners ==="" || _.isNull(format.teamResults.penaltyStroke) || format.teamResults.penaltyStroke == undefined || format.teamResults.penaltyStroke === "" || _.isNull(format.teamResults.saves) || format.teamResults.saves == undefined || format.teamResults.saves ===""  ||_.isNull(format.teamResults.fouls) || format.teamResults.fouls == undefined || format.teamResults.fouls === "");

                    // format.teamResults.halfPoints = format.teamResults.halfPoints || 0;
                    // format.teamResults.finalPoints = format.teamResults.finalPoints || 0;
                    // format.teamResults.shotsOnGoal = format.teamResults.shotsOnGoal || 0;
                    // format.teamResults.totalShots = format.teamResults.totalShots || 0;
                    // format.teamResults.penalty = format.teamResults.penalty || 0;
                    // format.teamResults.penaltyPoints = format.teamResults.penaltyPoints || 0;
                    // format.teamResults.penaltyCorners = format.teamResults.penaltyCorners || 0;
                    // format.teamResults.penaltyStroke = format.teamResults.penaltyStroke || 0;
                    // format.teamResults.saves = format.teamResults.saves || 0;
                    // format.teamResults.fouls = format.teamResults.fouls || 0;
                    break;

                case "Kabaddi":
                    nullScore = (_.isNull(format.teamResults.halfPoints) || format.teamResults.halfPoints==undefined || format.teamResults.halfPoints==="" || _.isNull(format.teamResults.finalPoints) || format.teamResults.finalPoints == undefined || format.teamResults.finalPoints === "" || _.isNull(format.teamResults.superTackle) || format.teamResults.superTackle == undefined || format.teamResults.superTackle === "" || _.isNull(format.teamResults.allOut) || format.teamResults.allOut == undefined || format.teamResults.allOut === "");


                    // format.teamResults.halfPoints = format.teamResults.halfPoints || 0;
                    // format.teamResults.finalPoints = format.teamResults.finalPoints || 0;
                    // format.teamResults.superTackle = format.teamResults.superTackle || 0;
                    // format.teamResults.allOut = format.teamResults.allOut || 0;
                    break;

                case "Water Polo":

                    var isThereNullQuarterPoints = (_.findIndex(format.teamResults.quarterPoints, ['points', null]) != -1) || (_.findIndex(format.teamResults.quarterPoints, ['points', undefined]) != -1) ? true : false;
                    var isThereNulLRemainingScore = (_.isNull(format.teamResults.finalGoalPoints) || format.teamResults.finalGoalPoints== undefined || format.teamResults.finalGoalPoints=== "" ||  _.isNull(format.teamResults.shotsOnGoal) ||format.teamResults.shotsOnGoal == undefined || format.teamResults.shotsOnGoal==="" || _.isNull(format.teamResults.totalShots) ||format.teamResults.totalShots == undefined || format.teamResults.totalShots === "" || _.isNull(format.teamResults.penalty) || format.teamResults.penalty == undefined || format.teamResults.penalty === "" || _.isNull(format.teamResults.penaltyPoints) || format.teamResults.penaltyPoints == undefined || format.teamResults.penaltyPoints === "" || _.isNull(format.teamResults.saves) || format.teamResults.saves == undefined || format.teamResults.saves === "");
                    nullScore = (isThereNullQuarterPoints || isThereNulLRemainingScore);


                    // format.teamResults.quarterPoints[0].points = format.teamResults.quarterPoints[0].points || 0;
                    // format.teamResults.quarterPoints[1].points = format.teamResults.quarterPoints[1].points || 0;
                    // format.teamResults.quarterPoints[2].points = format.teamResults.quarterPoints[2].points || 0;
                    // format.teamResults.quarterPoints[3].points = format.teamResults.quarterPoints[3].points || 0;
                    // format.teamResults.finalGoalPoints = format.teamResults.finalGoalPoints || 0;
                    // format.teamResults.shotsOnGoal = format.teamResults.shotsOnGoal || 0;
                    // format.teamResults.totalShots = format.teamResults.totalShots || 0;
                    // format.teamResults.penalty = format.teamResults.penalty || 0;
                    // format.teamResults.penaltyPoints = format.teamResults.penaltyPoints || 0;
                    // format.teamResults.penalty = format.teamResults.penalty || 0;
                    // format.teamResults.saves = format.teamResults.saves || 0;
                    break;

                case "Volleyball":
                    _.each(format.teamResults.sets, function (n) {
                        n.points = n.points || 0;
                    })
                    format.teamResults.fouls = format.teamResults.fouls || 0;
                    format.teamResults.spike = format.teamResults.spike || 0;
                    format.teamResults.block = format.teamResults.block || 0;
                    break;

                case "Football":
                    // nullScore = "";
                    console.log("format.teamResults.finalPoints",format.teamResults);
                    nullScore = (_.isNull(format.teamResults.finalPoints) || format.teamResults.finalPoints==undefined || format.teamResults.finalPoints==="" || _.isNull(format.teamResults.shotsOnGoal) ||format.teamResults.shotsOnGoal == undefined || format.teamResults.shotsOnGoal ==="" || _.isNull(format.teamResults.totalShots) || format.teamResults.totalShots == undefined || format.teamResults.totalShots === "" ||_.isNull(format.teamResults.corners) || format.teamResults.corners == undefined || format.teamResults.corners === "" || _.isNull(format.teamResults.penalty) || format.teamResults.penalty == undefined || format.teamResults.penalty === "" || _.isNull(format.teamResults.saves) ||format.teamResults.saves == undefined || format.teamResults.saves === "" || _.isNull(format.teamResults.fouls) || format.teamResults.fouls == undefined || format.teamResults.fouls === "" || _.isNull(format.teamResults.offSide) || format.teamResults.offSide == undefined || format.teamResults.offSide === "" || _.isNull(format.teamResults.cleanSheet) || format.teamResults.cleanSheet == undefined || format.teamResults.cleanSheet === "" || _.isNull(format.teamResults.noShow) || format.teamResults.noShow == undefined || format.teamResults.noShow === "" || _.isNull(format.teamResults.walkover) || format.teamResults.walkover == undefined || format.teamResults.walkover === "" );
                    console.log("nullScore",nullScore);
                    // nullScore = format.teamResults.finalPoints || '';
                    // nullScore = format.teamResults.shotsOnGoal || '';
                    // nullScore = format.teamResults.totalShots || '';
                    // nullScore = format.teamResults.corners || '';
                    // // nullScore = format.teamResults.penalty || '';
                    // nullScore = format.teamResults.saves || '';
                    // nullScore = format.teamResults.fouls || '';
                    // nullScore = format.teamResults.offSide || '';
                    // nullScore = format.teamResults.cleanSheet || '';
                    // nullScore = format.teamResults.noShow || '';
                    // nullScore = format.teamResults.walkover || '';
                    break;

                case "Throwball":

                    var isThereNullSetPoints = (_.findIndex(format.teamResults.sets, ['points', null]) != -1) || (_.findIndex(format.teamResults.sets, ['points', undefined]) != -1) ? true : false;
                    var isThereNulLFinalPoints = (_.isNull(format.teamResults.finalPoints) || format.teamResults.finalPoints == undefined || format.teamResults.finalPoints === "") ? true : false;
                    nullScore = (isThereNullSetPoints || isThereNulLFinalPoints);

                    // _.each(format.teamResults.sets, function (n) {
                    //     n.points = n.points || 0;
                    // })
                    // format.teamResults.finalPoints = format.teamResults.finalPoints || 0;
                    break;
                case "Karate Team Kumite":
                    var isThereNullSetPoints = (_.findIndex(format.teamResults.sets, ['points', null]) != -1) || (_.findIndex(format.teamResults.sets, ['points', undefined]) != -1) ? true : false;
                    var isThereNulLFinalScore = (_.isNull(format.teamResults.finalPoints) || format.teamResults.finalPoints==undefined || format.teamResults.finalPoints==="");
                  
                    nullScore = (isThereNullSetPoints || isThereNulLFinalScore);
                    break;
            };

            return nullScore;
        }

    }
    return obj;
});