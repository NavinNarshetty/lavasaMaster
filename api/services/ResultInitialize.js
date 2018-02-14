var schema = new Schema({
    name: {
        type: String,
    }
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('ResultInitialize', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getPlayerTemplate: function (sportName, player, flag) {
        console.log(player, "-----------------------");
        console.log(flag, "-----------------------");
        console.log(sportName, "-----------------------");
        
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
            console.log(player, "-----------------------");
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
                case "Boxing":
                case "Judo":
                case "Taekwondo":
                case "Karate":
                case "Wrestling":
                case "Carrom":
                case "Kho Kho":
                case "Sport MMA":
                    format.sets = [{
                        point: "",
                    }]
                    break;
                case "Tennis":
                case "Table Tennis":
                case "Badminton Singles":
                case "Squash":
                    format.sets = [{
                        point: "",
                        ace: "",
                        winner: "",
                        unforcedError: "",
                        serviceError: "",
                        doubleFaults: ""
                    }, {
                        point: "",
                        ace: "",
                        winner: "",
                        unforcedError: "",
                        serviceError: "",
                        doubleFaults: ""
                    }, {
                        point: "",
                        ace: "",
                        winner: "",
                        unforcedError: "",
                        serviceError: "",
                        doubleFaults: ""
                    }, {
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
        // console.log("getTeamTemplate", team);
        var format = {
            teamId: team.teamId,
            team: team._id,
            noShow: false,
            walkover: false,
            coach: "",
            schoolName: team.schoolName,
            teamResults: {},
            players: [],
            isDraw: false
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
            format.players[pk] = ResultInitialize.getPlayerTemplate(sportName, player, "team");
        })

        return format;


    },

    initializeTeamAndPlayers: function (sportName, resultSportname, match) {
        _.each(match.teams, function (team, tk) {
            resultSportname.teams[tk] = ResultInitialize.getTeamTemplate(sportName, team);
        });
        return resultSportname;
    },

    getResultTemplate: function (sportName, match) {
console.log('getResultTemplate enter',sportName,match);
console.log('getResultTemplate enter if value',match && match.teams);
if (match && match.teams) {
    console.log('Team enter',sportName,match);
    var format = {
        "teams": [],
        "matchPhoto": [],
        "scoreSheet": [],
        "status": "",
        "winner": {},
        "isNoMatch": false
    };
    var returnResult = {};
    
    switch (sportName) {
        case "Basketball":
        returnResult.resultBasketball = format;
        returnResult.resultBasketball = ResultInitialize.initializeTeamAndPlayers(sportName, returnResult.resultBasketball, match);
        return returnResult;
        
        case "Football":
        returnResult.resultFootball = format;
        ResultInitialize.initializeTeamAndPlayers(sportName, returnResult.resultFootball, match);
        return returnResult;
        
        case "Hockey":
        returnResult.resultHockey = format;
        ResultInitialize.initializeTeamAndPlayers(sportName, returnResult.resultHockey, match);
        return returnResult;
        
        case "Kabaddi":
        returnResult.resultKabaddi = format;
        ResultInitialize.initializeTeamAndPlayers(sportName, returnResult.resultKabaddi, match);
        return returnResult;
        
        case "Volleyball":
        returnResult.resultVolleyball = format;
        ResultInitialize.initializeTeamAndPlayers(sportName, returnResult.resultVolleyball, match);
        return returnResult;
        
        case "Handball":
        returnResult.resultHandball = format;
        ResultInitialize.initializeTeamAndPlayers(sportName, returnResult.resultHandball, match);
        return returnResult;
        
        case "Throwball":
        returnResult.resultThrowball = format;
        ResultInitialize.initializeTeamAndPlayers(sportName, returnResult.resultThrowball, match);
        return returnResult;
        
        case "Water Polo":
        returnResult.resultWaterPolo = format;
        ResultInitialize.initializeTeamAndPlayers(sportName, returnResult.resultWaterPolo, match);
        return returnResult;
        
    }
} else {
    console.log('Indi enter',sportName,match);
    var format = {
        "players": [],
        "matchPhoto": [],
        "scoreSheet": [],
        "winner": {},
        "isNoMatch": false
    }; 
    
    var returnResult = {};
    
    switch (sportName) {
                case "Boxing":
                case "Judo":
                case "Taekwondo":
                case "Karate":
                case "Wrestling":
                case "Carrom":
                case "Kho Kho":
                case "Sport MMA":
                    returnResult.resultsCombat = format;
                    _.each(format.players, function (player, pk) {
                        format.players[pk] = ResultInitialize.getPlayerTemplate(sportName, player, "indi");
                    })
                    return returnResult;
                case "Tennis":
                case "Table Tennis":
                case "Badminton Singles":
                case "Squash":
                    console.log('inside1');
                    returnResult.resultsRacquet = format;
                    console.log('inside1 returnResult',returnResult);
                    _.each(format.players, function (player, pk) {
                        format.players[pk] = ResultInitialize.getPlayerTemplate(sportName, player, "indi");
                    });
                    return returnResult;
                    console.log('returnResult',returnResult);

            }

        }


    },

    getMyResult: function (sportName, match, callback) {
        console.log('get My Result',sportName,match);
        var template = ResultInitialize.getResultTemplate(sportName, match);
        // console.log("template", template);
        callback(null, template);
    },

    getResultVar: function (sportName, sportType) {
        console.log("sportName", sportName, "sportType", sportType);
        if (sportName == "Shooting Air Pistol Team" || sportName == "Shooting Air Rifle Open Team" || sportName == "Shooting Air Rifle Peep Team") {
            return null;
        } else {
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
                            resultVar: "resultsCombat",
                            opponentsVar: "opponentsTeam"
                        };
                    case "Fencing":
                        return {
                            resultVar: "resultFencing",
                            opponentsVar: "opponentsSingle"
                        };
                    default:
                        return {
                            resultVar: "resultsCombat",
                            opponentsVar: "opponentsSingle"
                        };
                }

            } else if (sportType == "Individual Sports") {
                switch (sportName) {
                    case "Chess":
                        return {
                            resultVar: "resultSwiss",
                            opponentsVar: "opponentsSingle"
                        };

                    case "Athletics":
                        return {
                            resultVar: "resultHeat",
                            opponentsVar: "opponentsSingle"
                        };
                    case "Athletics 4x100m Relay":
                    case "Athletics 4x50m Relay":
                    case "Athletics Medley Relay":
                        return {
                            resultVar: "resultHeat",
                            opponentsVar: "opponentsTeam"
                        };

                    case "Carrom":
                        return {
                            resultVar: "resultCombat",
                            opponentsVar: "opponentsSingle"
                        };
                }
            } else if (sportType == "Target Sports") {
                switch (sportName) {
                    case "Shooting":
                        return {
                            resultVar: "resultShooting",
                            opponentsVar: "opponentsSingle"
                        };
                    case "Archery":
                        return {
                            resultVar1: "resultQualifyingRound",
                            resultVar2: "resultKnockout",
                            opponentsVar: "opponentsSingle"
                        };

                }
            } else if (sportType == "Aquatics Sports") {
                switch (sportName) {
                    case "Swimming":
                        return {
                            resultVar: "resultHeat",
                            opponentsVar: "opponentsSingle"
                        };
                    case "Water Polo":
                        return {
                            resultVar: "resultWaterPolo",
                            opponentsVar: "opponentsTeam"
                        };
                    case "Swimming 4x50m Freestyle Relay":
                    case "Swimming 4x50m Medley Relay":
                        return {
                            resultVar: "resultHeat",
                            opponentsVar: "opponentsTeam"
                        };
                }
            } else {
                switch (sportName) {
                    case "Basketball":
                        return {
                            resultVar: "resultBasketball",
                            opponentsVar: "opponentsTeam"
                        };
                    case "Throwball":
                        return {
                            resultVar: "resultThrowball",
                            opponentsVar: "opponentsTeam"
                        };

                    case "Football":
                        return {
                            resultVar: "resultFootball",
                            opponentsVar: "opponentsTeam"
                        };

                    case "Hockey":
                        return {
                            resultVar: "resultHockey",
                            opponentsVar: "opponentsTeam"
                        };

                    case "Kabaddi":
                        return {
                            resultVar: "resultKabaddi",
                            opponentsVar: "opponentsTeam"
                        };

                    case "Volleyball":
                        return {
                            resultVar: "resultVolleyball",
                            opponentsVar: "opponentsTeam"
                        };

                    case "Handball":
                        return {
                            resultVar: "resultHandball",
                            opponentsVar: "opponentsTeam"
                        };

                    case "Water Polo":
                        return {
                            resultVar: "resultWaterPolo",
                            opponentsVar: "opponentsTeam"
                        };
                    case "Throwball":
                        return {
                            resultVar: "resultsCombat",
                            opponentsVar: "opponentsTeam"
                        };
                    case "Kho Kho":
                        return {
                            resultVar: "resultsCombat",
                            opponentsVar: "opponentsTeam"
                        };
                }
            }
        }

    },

    getresultSport: function (data, callback) {
        async.waterfall([
            function (callback) {
                SportsListSubCategory.findOne({
                    _id: data.sportsListSubCategory
                }).lean().deepPopulate("sportsListCategory").exec(function (err, found) {
                    if (err || _.isEmpty(found)) {
                        callback(null, {
                            error: "No SportsList found!",
                            success: data
                        });
                    } else {
                        var sport = {};
                        sport.sportName = found.name;
                        sport.sportType = found.sportsListCategory.name;
                        callback(null, sport);
                    }
                });
            },
            function (sport, callback) {
                var result = ResultInitialize.getResultVar(sport.sportName, sport.sportType);
                ResultInitialize.getMyResult(sport.sportName, {}, function (err, complete) {
                    callback(null, complete);
                });

            }
        ], function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, result);
            }
        });
    },

    nullOrEmptyTo0: function (sportName, format) {
        switch (sportName) {
            case "Basketball":
                format.teamResults.quarterPoints[0].basket = format.teamResults.quarterPoints[0].basket || 0;
                format.teamResults.quarterPoints[1].basket = format.teamResults.quarterPoints[1].basket || 0;
                format.teamResults.quarterPoints[2].basket = format.teamResults.quarterPoints[2].basket || 0;
                format.teamResults.quarterPoints[3].basket = format.teamResults.quarterPoints[3].basket || 0;
                format.teamResults.finalGoalPoints = format.teamResults.finalGoalPoints || 0;
                break;

            case "Handball":
                format.teamResults.halfPoints = format.teamResults.halfPoints || 0;
                format.teamResults.finalPoints = format.teamResults.finalPoints || 0;
                format.teamResults.shotsOnGoal = format.teamResults.shotsOnGoal || 0;
                format.teamResults.penalty = format.teamResults.penalty || 0;
                format.teamResults.saves = format.teamResults.saves || 0;
                break;

            case "Hockey":
                format.teamResults.halfPoints = format.teamResults.halfPoints || 0;
                format.teamResults.finalPoints = format.teamResults.finalPoints || 0;
                format.teamResults.shotsOnGoal = format.teamResults.shotsOnGoal || 0;
                format.teamResults.totalShots = format.teamResults.totalShots || 0;
                format.teamResults.penalty = format.teamResults.penalty || 0;
                format.teamResults.penaltyPoints = format.teamResults.penaltyPoints || 0;
                format.teamResults.penaltyCorners = format.teamResults.penaltyCorners || 0;
                format.teamResults.penaltyStroke = format.teamResults.penaltyStroke || 0;
                format.teamResults.saves = format.teamResults.saves || 0;
                format.teamResults.fouls = format.teamResults.fouls || 0;
                break;

            case "Kabaddi":
                format.teamResults.halfPoints = format.teamResults.halfPoints || 0;
                format.teamResults.finalPoints = format.teamResults.finalPoints || 0;
                format.teamResults.superTackle = format.teamResults.superTackle || 0;
                format.teamResults.allOut = format.teamResults.allOut || 0;
                break;

            case "Water Polo":
                format.teamResults.quarterPoints[0].points = format.teamResults.quarterPoints[0].points || 0;
                format.teamResults.quarterPoints[1].points = format.teamResults.quarterPoints[1].points || 0;
                format.teamResults.quarterPoints[2].points = format.teamResults.quarterPoints[2].points || 0;
                format.teamResults.quarterPoints[3].points = format.teamResults.quarterPoints[3].points || 0;
                format.teamResults.finalGoalPoints = format.teamResults.finalGoalPoints || 0;
                format.teamResults.shotsOnGoal = format.teamResults.shotsOnGoal || 0;
                format.teamResults.totalShots = format.teamResults.totalShots || 0;
                format.teamResults.penalty = format.teamResults.penalty || 0;
                format.teamResults.penaltyPoints = format.teamResults.penaltyPoints || 0;
                format.teamResults.penalty = format.teamResults.penalty || 0;
                format.teamResults.saves = format.teamResults.saves || 0;
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
                format.formation = "";
                format.teamResults.halfPoints = format.teamResults.halfPoints || 0;
                format.teamResults.finalPoints = format.teamResults.finalPoints || 0;
                format.teamResults.shotsOnGoal = format.teamResults.shotsOnGoal || 0;
                format.teamResults.totalShots = format.teamResults.totalShots || 0;
                format.teamResults.corners = format.teamResults.corners || 0;
                format.teamResults.penalty = format.teamResults.penalty || 0;
                format.teamResults.saves = format.teamResults.saves || 0;
                format.teamResults.fouls = format.teamResults.fouls || 0;
                format.teamResults.offSide = format.teamResults.offSide || 0;
                format.teamResults.cleanSheet = format.teamResults.cleanSheet || 0;
                format.teamResults.noShow = format.teamResults.noShow || 0;
                format.teamResults.walkover = format.teamResults.walkover || 0;
                break;

            case "Throwball":
                _.each(format.teamResults.sets, function (n) {
                    n.points = n.points || 0;
                })
                format.teamResults.finalPoints = format.teamResults.finalPoints || 0;

                break;
        };
        return format;
    },



};
module.exports = _.assign(module.exports, exports, model);