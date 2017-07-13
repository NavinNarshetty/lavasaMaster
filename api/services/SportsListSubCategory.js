var objectid = require("mongodb").ObjectID;
var schema = new Schema({
    name: {
        type: String,
    },
    sportsListCategory: {
        type: Schema.Types.ObjectId,
        ref: 'SportsListCategory',
        index: true
    },
    isTeam: Boolean,
    filter: [{
        name: String
    }],
    rules: {
        type: Schema.Types.ObjectId,
        ref: 'Rules',
        index: true
    },
    sportType: String,
    maxSelect: Number

});

schema.plugin(deepPopulate, {
    populate: {
        'sportsListCategory': {
            select: '_id name'
        },
        'rules': {
            select: '_id name tournamentFormat rulesAndRegulation ageGroupContent ageGroupTable eligibilityContent eligibilityTable tournamentCommittee'
        }
    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('SportsListSubCategory', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema, "sportsListCategory rules", "sportsListCategory rules"));
var model = {

    getAggregatePipeLine: function (data) {

        var pipeline = [
            // Stage 1
            {
                $lookup: {
                    "from": "sportslists",
                    "localField": "sportslist",
                    "foreignField": "_id",
                    "as": "sportsListData"
                }
            },

            // Stage 2
            {
                $unwind: {
                    path: "$sportsListData",

                }
            },

            // Stage 3
            {
                $lookup: {
                    "from": "agegroups",
                    "localField": "ageGroup",
                    "foreignField": "_id",
                    "as": "ageData"
                }
            },

            // Stage 4
            {
                $unwind: {
                    path: "$ageData",

                }
            },

            // Stage 3
            {
                $lookup: {
                    "from": "sportslistsubcategories",
                    "localField": "sportsListData.sportsListSubCategory",
                    "foreignField": "_id",
                    "as": "sportsubData"
                }
            },

            // Stage 4
            {
                $unwind: {
                    path: "$sportsubData",

                }
            },

            // Stage 5
            {
                $match: {
                    "sportsubData._id": objectid(data._id)
                }
            },
        ];
        return pipeline;
    },

    getAll: function (callback) {
        async.waterfall([
            function (callback) {
                SportsListSubCategory.find().deepPopulate("sportsListCategory").exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(found)) {
                        callback(null, []);
                    } else {
                        callback(null, found);
                    }
                });
            },
            function (found, callback) {
                var results = _.groupBy(found, "sportsListCategory.name");
                callback(null, results);

            }
        ], function (err, results) {
            if (err) {
                console.log(err);
                callback(null, []);
            } else if (results) {
                if (_.isEmpty(results)) {
                    callback(null, []);
                } else {
                    callback(null, results);
                }
            }
        });

    },

    //get one sport when Athelete login
    getSchoolPerAthlete: function (data, callback) {
        async.waterfall([
                function (callback) {
                    Athelete.findOne({
                        accessToken: data.athleteToken
                    }).exec(function (err, found) {
                        if (_.isEmpty(found)) {
                            callback(null, []);
                        } else {
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    if (found.atheleteSchoolName) {
                        var schoolName = {};
                        schoolName.name = found.atheleteSchoolName;
                        data.schoolName = found.atheleteSchoolName;
                        callback(null, schoolName);
                    } else {
                        School.findOne({
                            _id: found.school
                        }).exec(function (err, schoolData) {
                            if (_.isEmpty(schoolData)) {
                                callback(null, []);
                            } else {
                                var schoolName = {};
                                schoolName.name = schoolData.name;
                                data.schoolName = found.name;
                                callback(null, schoolName);
                            }
                        });
                    }

                },
                function (schoolName, callback) {
                    Registration.findOne({
                        schoolName: schoolName.name
                    }).exec(function (err, complete) {
                        if (_.isEmpty(complete)) {
                            SportsListSubCategory.getOneSport(data, function (err, complete1) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    callback(null, complete1);
                                }

                            });
                        } else {
                            data.school = complete._id;
                            data.schoolName = complete.schoolName;
                            SportsListSubCategory.getOneSport(data, function (err, complete1) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    callback(null, complete1);
                                }

                            });
                        }
                    });
                },
            ],
            function (err, data2) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else if (data2) {
                    if (_.isEmpty(data2)) {
                        callback("Max Team Created", null);
                    } else {
                        callback(null, data2);
                    }
                }
            });
    },

    //get one sport
    getOneSport: function (data, callback) {
        async.waterfall([
            function (callback) {
                var pipeLine = SportsListSubCategory.getAggregatePipeLine(data);
                var newPipeLine = _.cloneDeep(pipeLine);
                newPipeLine.push({
                    $match: {
                        gender: data.gender,
                        ageGroup: objectid(data.age)
                    }
                });
                Sport.aggregate(newPipeLine, function (err, totals) {
                    if (err) {
                        console.log(err);
                        callback(err, "error in mongoose");
                    } else {
                        if (_.isEmpty(totals)) {
                            callback(null, []);
                        } else {
                            // var results = {};
                            console.log(totals);
                            callback(null, totals);
                        }
                    }
                });
            },
            function (totals, callback) {
                // sportsubData
                if (totals[0].sportsubData.isTeam == true) {
                    var results = {};
                    results.sport = totals[0]._id;
                    results.minplayer = totals[0].minTeamPlayers;
                    results.maxPlayer = totals[0].maxTeamPlayers;
                    TeamSport.count({
                        sport: results.sport,
                        schoolName: data.schoolName
                    }).exec(function (err, found) {
                        if (found == totals[0].maxTeam) {
                            callback("Max Team Created", null);
                        } else {
                            callback(null, results);
                        }
                    });
                } else {
                    callback(null, "this is individualSport");
                }
            }
        ], function (err, data2) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else if (data2) {
                if (_.isEmpty(data2)) {
                    callback("Max Team Created", null);
                } else {
                    callback(null, data2);
                }
            }
        });
        // 1. GetSportOfSportCategory
        // 2. groupBy
        // callback(GroupByResults);
        // waterfall: {}
        //      FindOne
        //      if(isTeam)
        //          countTeamForThatSchool
        //              if(team >= maxTeam) { callback(fail,"MAx Team Created") }
        //              else GoAhead
        //      
    },

    //get all sport with age category when Athelete login

    getSports: function (data, callback) {
        var finalData = {};
        var pipeLine = SportsListSubCategory.getAggregatePipeLine(data);
        Sport.aggregate(pipeLine, function (err, totals) {
            if (err) {
                console.log(err);
                callback(err, "error in mongoose");
            } else {
                if (_.isEmpty(totals)) {
                    callback(null, []);
                } else {
                    finalData.sportName = totals[0].sportsubData.name;
                    var results = _.groupBy(totals, "gender");
                    finalData.results = results;
                    callback(null, finalData);
                }
            }
        });
        // Aggregate(Sport - > lookup SportList - > lookup sportListSubCategory, Match ID ) {
        //     Sports  callback(err,callback)
        // }
    },

    //get sport with age category when Athelete login
    getSportsAthlete: function (data, callback) {
        var finalData = {};
        async.waterfall([
            function (callback) {
                SportsListSubCategory.findOne({
                    _id: data._id
                }).exec(function (err, sportsData) {
                    if (_.isEmpty(sportsData)) {
                        callback(null, []);
                    } else {
                        callback(null, sportsData);
                    }
                });
            },
            function (sportsData, callback) {
                console.log("sportsData", sportsData);
                Athelete.findOne({
                    accessToken: data.athleteToken
                }).exec(function (err, found) {
                    if (_.isEmpty(found)) {
                        callback(null, []);
                    } else {
                        data.dob = found.dob;
                        data.gender = found.gender;
                        data.sportsName = sportsData.name;
                        callback(null, data);
                    }
                });
            },
            function (data, callback) {
                var pipeLine = SportsListSubCategory.getAggregatePipeLine(data);
                var newPipeLine = _.cloneDeep(pipeLine);
                if (data.sportsName.includes("Mix") || data.sportsName.includes("mix")) {
                    newPipeLine.push({
                        $match: {
                            "fromDate": {
                                $lte: data.dob
                            },
                            "toDate": {
                                $gte: data.dob
                            }
                        }
                    });
                } else {
                    newPipeLine.push({
                        $match: {
                            "fromDate": {
                                $lte: data.dob
                            },
                            "toDate": {
                                $gte: data.dob
                            },
                            "gender": data.gender
                        }
                    });
                }

                Sport.aggregate(newPipeLine, function (err, totals) {
                    if (err) {
                        console.log(err);
                        callback(err, "error in mongoose");
                    } else {
                        if (_.isEmpty(totals)) {
                            callback(null, []);
                        } else {
                            console.log(totals)
                            finalData.sportName = totals[0].sportsubData.name;
                            var results = _.groupBy(totals, "gender");
                            finalData.results = results;
                            callback(null, finalData);
                        }
                    }
                });
            }
        ], function (err, data2) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else if (data2) {
                if (_.isEmpty(data2)) {
                    callback("Sports Category Not Found", null);
                } else {
                    callback(null, data2);
                }
            }
        });

    },

    getRules: function (data, callback) {
        SportsListSubCategory.findOne({
            _id: data._id
        }).deepPopulate("rules").exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, "Data is empty");
            } else {
                callback(null, found);
            }
        });
    },

    getOneRuleBySportsName: function (data, callback) {
        SportsListSubCategory.findOne({
            name: {
                $regex: data.sportName,
                $options: 'i'
            }
        }).deepPopulate("rules").exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback("Data is empty", null);
            } else {
                callback(null, found);
            }
        });
    },

    getAggregatePipeLineSport: function (data) {

        var pipeline = [
            // Stage 1
            {
                $lookup: {
                    "from": "sportslists",
                    "localField": "sportslist",
                    "foreignField": "_id",
                    "as": "sportsListData"
                }
            },

            // Stage 2
            {
                $unwind: {
                    path: "$sportsListData"
                }

            },

            // Stage 3
            {
                $lookup: {
                    "from": "agegroups",
                    "localField": "ageGroup",
                    "foreignField": "_id",
                    "as": "ageData"
                }
            },

            // Stage 4
            {
                $unwind: {
                    path: "$ageData",
                }
            },

            // Stage 5
            {
                $lookup: {
                    "from": "sportslistsubcategories",
                    "localField": "sportsListData.sportsListSubCategory",
                    "foreignField": "_id",
                    "as": "sportsubData"
                }
            },

            // Stage 6
            {
                $unwind: {
                    path: "$sportsubData",
                }
            },

            // Stage 7
            {
                $lookup: {
                    "from": "weights",
                    "localField": "weight",
                    "foreignField": "_id",
                    "as": "weight"
                }
            },

            // Stage 8
            {
                $unwind: {
                    path: "$weight",
                    preserveNullAndEmptyArrays: true // optional
                }
            },

            // Stage 9
            {
                $match: {
                    "sportsubData._id": objectid(data._id)
                }
            },

            // Stage 10
            {
                $group: {
                    _id: "$ageData.name",
                    data: {
                        $push: {
                            sport: "$_id",
                            fromAge: "$fromDate",
                            toAge: "$toDate",
                            gender: "$gender",
                            sportName: "$sportsubData.name",
                            eventName: "$sportsListData.name",
                            weight: "$weight.name"
                        }
                    }
                }
            },



        ];
        return pipeline;
    },

    getEvents: function (data, callback) {
        var pipeLine = SportsListSubCategory.getAggregatePipeLineSport(data);
        Sport.aggregate(pipeLine, function (err, totals) {
            if (err) {
                console.log(err);
                callback(err, "error in mongoose");
            } else {
                if (_.isEmpty(totals)) {
                    callback(null, []);
                } else {
                    callback(null, totals);
                }
            }
        });
    },

    getSportsDeails: function (data, callback) {
        SportsListSubCategory.findOne({
            _id: data._id
        }).exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, []);
            } else {
                var type = {};
                type.sportType = found.sportType;
                type.sportName = found.name;
                type.isTeam = found.isTeam;
                callback(null, type);
            }
        });
    },

};
module.exports = _.assign(module.exports, exports, model);