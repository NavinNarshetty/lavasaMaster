var schema = new Schema({
    year: String,
    matchid: Number,
    roundno: Number,
    qualifyingknockout: {
        type: String
    },
    round: {
        type: String,
        default: "Round"
    },
    order: Number,
    qualifyingorder: Number,
    sport: {
        type: Schema.Types.ObjectId,
        ref: "Sport",
        index: true
    },
    event: {
        type: String,
        default: "Qualifying Knockout"
    },
    participantType: {
        type: String
    },
    player1: {
        type: Schema.Types.ObjectId,
        ref: 'Student'
    },
    player2: {
        type: Schema.Types.ObjectId,
        ref: 'Student'
    },
    team1: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    team2: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    result1: {
        type: String
    },
    result2: {
        type: String
    },
    name: {
        type: String,
        default: "Heat 1"
    },
    video: {
        type: String
    },
    date: {
        type: Date
    },
    startTime: {
        type: Date
    },
    totalTime: {
        type: String,
        default: ""
    },
    endTime: {
        type: Date
    },
    score: {
        type: String,
        default: ""
    },
    heats: [{
        player: {
            type: Schema.Types.ObjectId,
            ref: 'Student'
        },
        team: {
            type: Schema.Types.ObjectId,
            ref: 'Team'
        },
        score: {
            type: Number
        },
        result: {
            type: String
        },
        position: {
            type: String
        }
    }]
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('OldQualifyingKnockout', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getknockoutPlayer1AggregatePipeLine: function (data) {

        var pipeline = [{
                $match: {
                    "participantType": "player",
                    "year": data.year,
                    round: "Qualifying Round"
                }
            },
            // Stage 2
            {
                $group: {
                    _id: "$heats.player",
                    sport: {
                        $addToSet: "$sport"
                    }
                }
            },


        ];
        return pipeline;
    },

    getAllPlayer: function (data, callback) {
        var individualSport = {};
        async.waterfall([
            function (callback) {
                var pipeLine = OldQualifyingKnockout.getknockoutPlayer1AggregatePipeLine(data);
                OldQualifyingKnockout.aggregate(pipeLine, function (err, complete) {
                    if (err) {
                        callback(err, "error in mongoose");
                    } else {
                        if (_.isEmpty(complete)) {
                            callback(null, complete);
                        } else {
                            callback(null, complete);
                        }
                    }
                });
            },
            function (complete, callback) {
                OldHeat.saveIn(complete, individualSport, function (err, saveData) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (_.isEmpty(saveData)) {
                            var err = {
                                error: "no saveData",
                                data: saveData
                            }
                            callback(null, err);
                        } else {
                            callback(null, saveData);
                        }
                    }
                });
                // callback(null, complete);
            },
        ], function (err, data3) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, data3);
            }
        });
    },

    // saveIn: function (complete, individualSport, callback) {
    //     async.concatSeries(complete, function (mainData, callback) {
    //         var i = 0;
    //         async.eachSeries(mainData._id, function (singleData, callback) {
    //             individualSport.sport = [];
    //             async.waterfall([
    //                 function (callback) {
    //                     var athelete = {};
    //                     athelete._id = singleData;
    //                     OldKnockout.getAthleteId(athelete, function (err, athelete) {
    //                         if (err) {
    //                             callback(err, null);
    //                         } else {
    //                             if (_.isEmpty(athelete)) {
    //                                 var err = {
    //                                     error: "no athelete",
    //                                     data: athelete
    //                                 }
    //                                 callback(null, err);
    //                             } else {
    //                                 callback(null, athelete);
    //                             }
    //                         }
    //                     });
    //                 },
    //                 function (athelete, callback) {
    //                     if (athelete.error) {
    //                         callback(null, athelete);
    //                     } else {
    //                         var param = {};
    //                         console.log("singleData", mainData.sport.length);
    //                         param.sport = mainData.sport[i];
    //                         OldKnockout.getSportId(param, function (err, sport) {
    //                             if (sport.error) {
    //                                 callback(null, sport);
    //                             } else {
    //                                 individualSport.sport.push(sport._id);
    //                                 individualSport.sportsListSubCategory = sport.sportslist.sportsListSubCategory._id;
    //                                 callback(null, athelete);
    //                             }
    //                         });
    //                         if (i < mainData.sport[i].length) {
    //                             i++;
    //                         }
    //                     }
    //                 },
    //                 function (athelete, callback) {
    //                     if (athelete.error) {
    //                         callback(null, athelete);
    //                     } else {
    //                         individualSport.athleteId = athelete._id;
    //                         individualSport.createdBy = "School";
    //                         individualSport.oldId = singleData._id;
    //                         IndividualSport.saveData(individualSport, function (err, saveData) {
    //                             if (err) {
    //                                 callback(err, null);
    //                             } else {
    //                                 if (_.isEmpty(saveData)) {
    //                                     callback(null, []);
    //                                 } else {
    //                                     individualSport.sport = [];
    //                                     callback(null, saveData);
    //                                 }
    //                             }
    //                         });
    //                     }
    //                 }
    //             ], function (err, data3) {
    //                 if (err) {
    //                     callback(err, null);
    //                 } else {
    //                     if (_.isEmpty(data3)) {
    //                         callback(null, data3);
    //                     } else {
    //                         callback(null, data3);
    //                     }
    //                 }
    //             });
    //         }, function (err, finalData) {
    //             if (err) {
    //                 callback(err, null);
    //             } else {
    //                 callback(null, finalData);
    //             }
    //         });
    //     }, function (err, finalData) {
    //         if (err) {
    //             callback(err, null);
    //         } else {
    //             callback(null, finalData);
    //         }
    //     });
    // }

};
module.exports = _.assign(module.exports, exports, model);