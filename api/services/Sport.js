var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var uniqueValidator = require('mongoose-unique-validator');
var timestamps = require('mongoose-timestamp');
var validators = require('mongoose-validators');
var monguurl = require('monguurl');
var objectid = require("mongodb").ObjectID;
var lodash = require('lodash');
var moment = require('moment');

var schema = new Schema({
    gender: String,
    maxTeam: Number,
    minTeamPlayers: Number,
    maxTeamPlayers: Number,
    sportslist: {
        type: Schema.Types.ObjectId,
        ref: 'SportsList',
        index: true
    },
    ageGroup: {
        type: Schema.Types.ObjectId,
        ref: 'AgeGroup',
        index: true
    },
    weight: {
        type: Schema.Types.ObjectId,
        ref: 'Weight',
        index: true
    },
    fromDate: Date,
    toDate: Date
});

schema.plugin(deepPopulate, {
    populate: {
        'sportslist': {
            select: '_id name sporttype drawFormat rules inactiveimage image'
        },
        'ageGroup': {
            select: '_id name'
        },
        'weight': {
            select: '_id name'
        }

    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Sport', schema);
var exports = _.cloneDeep(require("sails-wohlig-service")(schema, "sportslist ageGroup weight", "sportslist ageGroup weight"));
var model = {

    getAggregatePipeLine: function (data) {

        var pipeline = [
            // Stage 1
            {
                $lookup: {
                    "from": "schools",
                    "localField": "school",
                    "foreignField": "_id",
                    "as": "school"
                }
            },
            // Stage 2
            {
                $unwind: {
                    path: "$school",
                    preserveNullAndEmptyArrays: true // optional
                }
            },
            // Stage 3
            {
                $match: {

                    $or: [{
                            "school.name": {
                                $regex: data.school
                            }
                        },
                        {
                            "atheleteSchoolName": {
                                $regex: data.school
                            }
                        }
                    ]

                }
            },
            {
                $match: {

                    $or: [{
                        "status": "Verified"
                    }, ]

                }
            },
            // Stage 4
            {
                $match: {
                    $or: [{
                        registrationFee: {
                            $ne: "online PAYU"
                        }
                    }, {
                        paymentStatus: {
                            $ne: "Pending"
                        }
                    }]
                }
            }, {
                $match: {
                    "gender": data.gender,
                    "dob": {
                        $gte: new Date(data.fromDate),
                        $lte: new Date(data.toDate),
                    }
                }
            },

        ];
        return pipeline;
    },

    getMixAggregatePipeLine: function (data) {

        var pipeline = [
            // Stage 1
            {
                $lookup: {
                    "from": "schools",
                    "localField": "school",
                    "foreignField": "_id",
                    "as": "school"
                }
            },
            // Stage 2
            {
                $unwind: {
                    path: "$school",
                    preserveNullAndEmptyArrays: true // optional
                }
            },
            // Stage 3
            {
                $match: {

                    $or: [{
                            "school.name": {
                                $regex: data.school
                            }
                        },
                        {
                            "atheleteSchoolName": {
                                $regex: data.school
                            }
                        }
                    ]

                }
            },
            {
                $match: {

                    $or: [{
                        "status": "Verified"
                    }, ]

                }
            },
            // Stage 4
            {
                $match: {
                    $or: [{
                        registrationFee: {
                            $ne: "online PAYU"
                        }
                    }, {
                        paymentStatus: {
                            $ne: "Pending"
                        }
                    }]
                }
            }, {
                $match: {
                    "dob": {
                        $gte: new Date(data.fromDate),
                        $lte: new Date(data.toDate),
                    }
                }
            },

        ];
        return pipeline;
    },

    getSearchPipeLine: function (data) {

        var pipeline = [
            // Stage 1
            {
                $lookup: {
                    "from": "sportslists",
                    "localField": "sportslist",
                    "foreignField": "_id",
                    "as": "sportslist"
                }
            },
            // Stage 2
            {
                $unwind: {
                    path: "$sportslist",
                    // preserveNullAndEmptyArrays: true // optional
                }
            },
            // Stage 3
            {
                $lookup: {
                    "from": "agegroups",
                    "localField": "ageGroup",
                    "foreignField": "_id",
                    "as": "ageGroup"
                }
            },

            // Stage 4
            {
                $unwind: {
                    path: "$ageGroup",

                }
            },
            // Stage 5
            {
                $match: {
                    "sportslist.name": {
                        $regex: data.keyword,
                        $options: "i"

                    }
                }
            },
            {
                $sort: {
                    "createdAt": -1
                }
            },
        ];
        return pipeline;
    },

    getSportPipeLine: function () {

        var pipeline = [
            // Stage 1
            {
                $lookup: {
                    "from": "sportslists",
                    "localField": "sportslist",
                    "foreignField": "_id",
                    "as": "sportslist"
                }
            },
            // Stage 2
            {
                $unwind: {
                    path: "$sportslist",
                    // preserveNullAndEmptyArrays: true // optional
                }
            },
            // Stage 3
            {
                $lookup: {
                    "from": "agegroups",
                    "localField": "ageGroup",
                    "foreignField": "_id",
                    "as": "ageGroup"
                }
            },

            // Stage 4
            {
                $unwind: {
                    path: "$ageGroup",

                }
            },
            // Stage 5
            {
                $lookup: {
                    "from": "weights",
                    "localField": "weight",
                    "foreignField": "_id",
                    "as": "weight"
                }
            },
            // Stage 2
            {
                $unwind: {
                    path: "$weight",
                    preserveNullAndEmptyArrays: true // optional
                }
            },
            {
                $sort: {
                    "createdAt": -1
                }
            },
        ];
        return pipeline;
    },

    getShootingPipeLine: function (data) {

        var pipeline = [
            // Stage 1
            {
                $lookup: {
                    "from": "sports",
                    "localField": "sport",
                    "foreignField": "_id",
                    "as": "sport"
                }
            },

            // Stage 2
            {
                $unwind: {
                    path: "$sport",
                }
            },

            // Stage 3
            {
                $lookup: {
                    "from": "sportslists",
                    "localField": "sport.sportslist",
                    "foreignField": "_id",
                    "as": "sport.sportslist"
                }
            },

            // Stage 4
            {
                $unwind: {
                    path: "$sport.sportslist",
                }
            },

            // Stage 5
            {
                $match: {
                    "sport.sportslist.name": {
                        $regex: data.sportIndividual,
                        $options: "i"
                    }
                }
            },
            // Stage 7
            {
                $lookup: {
                    "from": "atheletes",
                    "localField": "athleteId",
                    "foreignField": "_id",
                    "as": "athleteId"
                }
            },

            // Stage 8
            {
                $unwind: {
                    path: "$athleteId",
                }
            },
            {
                $lookup: {
                    "from": "schools",
                    "localField": "athleteId.school",
                    "foreignField": "_id",
                    "as": "athleteId.school"
                }
            },
            // Stage 2
            {
                $unwind: {
                    path: "$athleteId.school",
                    preserveNullAndEmptyArrays: true // optional
                }
            },
            // Stage 3
            {
                $match: {

                    $or: [{
                            "athleteId.school.name": {
                                $regex: data.school
                            }
                        },
                        {
                            "athleteId.atheleteSchoolName": {
                                $regex: data.school
                            }
                        }
                    ]

                }
            },
            {
                $match: {

                    $or: [{
                        "athleteId.status": "Verified"
                    }, ]

                }
            },
            // Stage 4
            {
                $match: {
                    $or: [{
                        "athleteId.registrationFee": {
                            $ne: "online PAYU"
                        }
                    }, {
                        "athleteId.paymentStatus": {
                            $ne: "Pending"
                        }
                    }]
                }
            },

            // Stage 4
            {
                $match: {
                    "athleteId.dob": {
                        $gte: new Date(data.fromDate),
                        $lte: new Date(data.toDate),
                    },
                    "athleteId.gender": data.gender
                }
            },

        ];
        return pipeline;
    },
    getShootingPipeLine1: function (data) {

        var pipeline = [{
                $match: {
                    "athleteId": data.athlete
                }
            },
            // Stage 1
            {
                $lookup: {
                    "from": "sports",
                    "localField": "sport",
                    "foreignField": "_id",
                    "as": "sport"
                }
            },

            // Stage 2
            {
                $unwind: {
                    path: "$sport",
                }
            },

            // Stage 3
            {
                $lookup: {
                    "from": "sportslists",
                    "localField": "sport.sportslist",
                    "foreignField": "_id",
                    "as": "sport.sportslist"
                }
            },

            // Stage 4
            {
                $unwind: {
                    path: "$sport.sportslist",
                }
            },

            // Stage 5
            {
                $match: {
                    "sport.sportslist.name": {
                        $regex: data.sportIndividual,
                        $options: "i"
                    }
                }
            },
            // Stage 7
            {
                $lookup: {
                    "from": "atheletes",
                    "localField": "athleteId",
                    "foreignField": "_id",
                    "as": "athleteId"
                }
            },

            // Stage 8
            {
                $unwind: {
                    path: "$athleteId",
                }
            },
            {
                $lookup: {
                    "from": "schools",
                    "localField": "athleteId.school",
                    "foreignField": "_id",
                    "as": "athleteId.school"
                }
            },
            // Stage 2
            {
                $unwind: {
                    path: "$athleteId.school",
                    preserveNullAndEmptyArrays: true // optional
                }
            },
            // Stage 3
            {
                $match: {

                    $or: [{
                            "athleteId.school.name": {
                                $regex: data.school
                            }
                        },
                        {
                            "athleteId.atheleteSchoolName": {
                                $regex: data.school
                            }
                        }
                    ]

                }
            },
            {
                $match: {

                    $or: [{
                        "athleteId.status": "Verified"
                    }, ]

                }
            },
            // Stage 4
            {
                $match: {
                    $or: [{
                        "athleteId.registrationFee": {
                            $ne: "online PAYU"
                        }
                    }, {
                        "athleteId.paymentStatus": {
                            $ne: "Pending"
                        }
                    }]
                }
            },

            // Stage 4
            {
                $match: {
                    "athleteId.dob": {
                        $gte: new Date(data.fromDate),
                        $lte: new Date(data.toDate),
                    },
                    "athleteId.gender": data.gender
                }
            },

        ];
        return pipeline;
    },

    getStudentTeamPipeline: function (data) {

        var pipeline = [
            // Stage 1
            {
                $lookup: {
                    "from": "sports",
                    "localField": "sport",
                    "foreignField": "_id",
                    "as": "sport"
                }
            },

            // Stage 2
            {
                $unwind: {
                    path: "$sport",
                }
            },

            // Stage 3
            {
                $lookup: {
                    "from": "sportslists",
                    "localField": "sport.sportslist",
                    "foreignField": "_id",
                    "as": "sport.sportslist"
                }
            },

            // Stage 4
            {
                $unwind: {
                    path: "$sport.sportslist",

                }
            },

            // Stage 5
            {
                $match: {
                    "studentId": objectid(data.athlete),
                    "sport.sportslist.name": data.sportName
                }
            },
        ];
        return pipeline;
    },
    //For team
    getAthletePerSchool: function (data, callback) {
        // console.log("foundfront", found);
        async.waterfall([
                function (callback) {
                    var pipeLine = Sport.getSportPipeLine();
                    var newPipeLine = _.cloneDeep(pipeLine);
                    newPipeLine.push({
                        $match: {
                            _id: objectid(data.sport)
                        }
                    });
                    Sport.aggregate(newPipeLine, function (err, found) {
                        if (err) {
                            callback(err, "error in mongoose");
                        } else {
                            if (_.isEmpty(found)) {
                                callback(null, []);
                            } else {
                                console.log("found", found);
                                data.gender = found[0].gender;
                                data.fromDate = found[0].fromDate;
                                data.toDate = found[0].toDate;
                                data.sportName = found[0].sportslist.name;
                                if (data.sportName.toLowerCase() == "shooting air pistol team") {
                                    data.sportIndividual = "Pistol";
                                } else if (data.sportName.toLowerCase() == "shooting air rifle open team") {
                                    data.sportIndividual = "Open";
                                } else if (data.sportName.toLowerCase() == "shooting air rifle peep team") {
                                    data.sportIndividual = "Peep";
                                }
                                callback(null, data);
                            }
                        }
                    });
                },
                function (data, callback) {
                    console.log("data", data);
                    if ((data.sportName.toLowerCase() == "shooting air pistol team") || (data.sportName.toLowerCase() == "shooting air rifle open team") || (data.sportName.toLowerCase() == "shooting air rifle peep team")) {
                        console.log("sports IndividualSport check");
                        data.athlete = found._id;
                        Sport.allShootingAthelete(data, function (err, complete) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(complete)) {
                                    var results = {};
                                    results.data = [];
                                    results.total = 0;
                                    callback(null, results);
                                } else {
                                    var final = {};
                                    final.data = [];
                                    console.log("complete", complete);
                                    _.each(complete.results, function (n) {
                                        console.log("n", n);
                                        final.data.push(n.athleteId);
                                    });
                                    final.total = complete.total;
                                    console.log("final", final);
                                    callback(null, final);
                                }
                            }
                        });
                    } else {
                        Sport.allAthelete(data, function (err, complete) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(complete)) {
                                    var results = {};
                                    results.data = [];
                                    results.total = 0;
                                    callback(null, results);
                                } else {
                                    // console.log("complete", complete);
                                    callback(null, complete);
                                }
                            }
                        });
                    }
                },
                function (complete, callback) {
                    // console.log("complete next", complete);
                    if (data.sportName.includes("Doubles") || data.sportName.includes("doubles")) {
                        console.log("doubles");
                        var results = {};
                        var finalData = [];
                        console.log("total", complete.total);
                        async.each(complete.results, function (n, callback) {
                                data.athlete = n._id;
                                console.log("n", n._id);
                                var pipeLine = Sport.getStudentTeamPipeline(data);
                                StudentTeam.aggregate(pipeLine, function (err, found) {
                                    if (err) {
                                        callback(err, "error in mongoose");
                                    } else {
                                        // console.log("found", found[0].sport.sportslist.name);
                                        if (_.isEmpty(found)) {
                                            var athlete = {};
                                            athlete = n;
                                            athlete.isTeamSelected = false;
                                            finalData.push(athlete);
                                            results.data = finalData;
                                            results.total = complete.total;
                                            // console.log("data", results);
                                            callback(null, results);
                                        } else {
                                            if (found[0].sport.sportslist.name == data.sportName) {
                                                var athlete = {};
                                                athlete = n
                                                athlete.isTeamSelected = true;
                                                finalData.push(athlete);
                                                results.data = finalData;
                                                results.total = complete.total;
                                                // console.log("data", results);
                                                callback(null, results);
                                            } else {
                                                var athlete = {};
                                                athlete = n;
                                                athlete.isTeamSelected = false;
                                                finalData.push(athlete);
                                                results.data = finalData;
                                                results.total = complete.total;
                                                // console.log("data", results);
                                                callback(null, results);
                                            }
                                        }
                                    }
                                });
                            },
                            function (err) {
                                if (err) {
                                    callback(err, null);
                                } else if (_.isEmpty(results)) {
                                    callback(null, results);
                                } else {
                                    callback(null, results);
                                }
                            });
                    } else if (data.sportName.includes("Shooting") || data.sportName.includes("shooting")) {
                        var results = {};
                        var finalData = [];
                        async.each(complete.data, function (n, callback) {
                                console.log("n------", n);
                                data.athlete = n._id;
                                var pipeLine = Sport.getStudentTeamPipeline(data);
                                StudentTeam.aggregate(pipeLine, function (err, found) {
                                    if (err) {
                                        callback(err, "error in mongoose");
                                    } else {
                                        // console.log("found", found[0].sport.sportslist.name);
                                        if (_.isEmpty(found)) {
                                            var athlete = {};
                                            athlete = n;
                                            athlete.isTeamSelected = false;
                                            finalData.push(athlete);
                                            results.data = finalData;
                                            results.total = complete.total;
                                            // console.log("data", results);
                                            callback(null, results);
                                        } else {
                                            if (found[0].sport.sportslist.name == data.sportName) {
                                                var athlete = {};
                                                athlete = n
                                                athlete.isTeamSelected = true;
                                                finalData.push(athlete);
                                                results.data = finalData;
                                                results.total = complete.total;
                                                // console.log("data", results);
                                                callback(null, results);
                                            } else {
                                                var athlete = {};
                                                athlete = n;
                                                athlete.isTeamSelected = false;
                                                finalData.push(athlete);
                                                results.data = finalData;
                                                results.total = complete.total;
                                                callback(null, results);
                                            }
                                        }
                                    }
                                });
                            },
                            function (err) {
                                if (err) {
                                    callback(err, null);
                                } else if (_.isEmpty(results)) {
                                    callback(null, results);
                                } else {
                                    callback(null, results);
                                }
                            });
                    } else {
                        var results = {};
                        var finalData = [];
                        // console.log("total.....", complete.total);
                        // console.log("complete......", complete.results);
                        async.eachSeries(complete.results, function (n, callback) {
                            console.log("n", n);
                            StudentTeam.find({
                                studentId: n._id,
                                sport: data.sport
                            }).lean().exec(function (err, found) {
                                if (_.isEmpty(found)) {
                                    var athlete = {};
                                    athlete = n;
                                    athlete.isTeamSelected = false;
                                    finalData.push(athlete);
                                    results.data = finalData;
                                    results.total = complete.total;
                                    // console.log("data", results);
                                    callback(null, results);
                                } else {
                                    var athlete = {};
                                    athlete = n;
                                    athlete.isTeamSelected = true;
                                    finalData.push(athlete);
                                    results.data = finalData;
                                    results.total = complete.total;
                                    // console.log("data", results);
                                    callback(null, results);
                                }
                            });
                        }, function (err) {
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(results)) {
                                callback(null, results);
                            } else {
                                // console.log("data", results);
                                callback(null, results);
                            }
                        });
                    }
                }
            ],
            function (err, results) {
                if (err) {
                    console.log(err);
                    callback(null, results);
                } else if (results) {
                    if (_.isEmpty(results)) {
                        callback(null, results);
                    } else {
                        console.log("data", results);
                        callback(null, results);
                    }
                }
            });

        // findAll Athlete with filters school,Gender, AgeGroup, AtheleteId - > Pagination 20
        //    asycn.eachLimit();
        //        SportId -> Student -> Team Callback ->  
        // if(teamID) -> CurrentTeam

    },

    getAthlete: function (data, callback) {
        async.waterfall([
                function (callback) {
                    Athelete.findOne({
                        accessToken: data.athleteToken
                    }).exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(found)) {
                            callback(null, []);
                        } else {
                            data.found = found;
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    if (found.atheleteSchoolName) {
                        console.log("name school", found.atheleteSchoolName);
                        Registration.findOne({
                            schoolName: found.atheleteSchoolName
                        }).exec(function (err, complete) {
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(complete)) {
                                callback(null, []);
                            } else {
                                data.school = complete.schoolName;
                                data.isRegisted = false;
                                callback(null, data);
                            }
                        });
                    } else {
                        console.log("school", found.school);
                        async.waterfall([
                                function (callback) {
                                    School.findOne({
                                        _id: found.school
                                    }).exec(function (err, complete) {
                                        if (err) {
                                            callback(err, null);
                                        } else if (_.isEmpty(complete)) {
                                            callback(null, []);
                                        } else {
                                            data.school = complete.name;
                                            callback(null, data);
                                        }
                                    });
                                },
                                function (data, callback) {
                                    Registration.findOne({
                                        schoolName: data.school
                                    }).exec(function (err, complete) {
                                        if (err) {
                                            callback(err, null);
                                        } else if (_.isEmpty(complete)) {
                                            callback(null, []);
                                        } else {
                                            data.isRegisted = true;
                                            console.log(data);
                                            callback(null, data);
                                        }
                                    });
                                }
                            ],
                            function (err, data2) {
                                if (err) {
                                    console.log(err);
                                    callback(null, []);
                                } else if (data2) {
                                    if (_.isEmpty(data2)) {
                                        callback(null, []);
                                    } else {
                                        callback(null, data2);
                                    }
                                }
                            });
                    }
                },
                function (data, callback) {
                    Sport.getAthletePerSchool(data, function (err, complete) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(complete)) {
                                callback(null, complete);
                            } else {
                                console.log("complete", complete);
                                callback(null, complete);
                            }
                        }
                    });
                },
            ],
            function (err, complete) {
                if (err) {
                    console.log(err);
                    callback(null, err);
                } else if (complete) {
                    if (_.isEmpty(complete)) {
                        callback(null, complete);
                    } else {
                        callback(null, complete);
                    }
                }
            });
    },

    allAthelete: function (data, callback) {
        async.waterfall([
                function (callback) {
                    console.log("school", data.school);
                    var maxRow = 9;
                    var page = 1;
                    if (data.page) {
                        page = data.page;
                    }
                    var start = (page - 1) * maxRow;
                    console.log("options", start);
                    if (data.page == 1 && _.isEmpty(data.sfaid) && data.athleteToken) {
                        Sport.athleteData(data, start, maxRow, function (err, complete1) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, complete1);
                            }
                        });
                    } else if (data.page == 1 && _.isEmpty(data.sfaid) && data.schoolToken) {
                        Sport.athleteData1(data, start, maxRow, function (err, complete1) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, complete1);
                            }
                        });
                    } else if (_.isEmpty(data.sfaid) && data.page != 1) {
                        Sport.athleteData1(data, start, maxRow, function (err, complete1) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, complete1);
                            }
                        });

                    } else {
                        Sport.atheleteDataIncludingSfa(data, start, maxRow, function (err, complete1) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, complete1);
                            }
                        });

                    }
                }
            ],
            function (err, data2) {
                if (err) {
                    console.log(err);
                    callback(null, []);
                } else if (data2) {
                    if (_.isEmpty(data2)) {
                        callback(null, []);
                    } else {
                        callback(null, data2);
                    }
                }
            });

    },

    totalAthlete: function (data, callback) {
        if (_.isEmpty(data.sfaid)) {
            if (data.sportName.includes("Mix") || data.sportName.includes("mix")) {
                var pipeLine = Sport.getMixAggregatePipeLine(data);
            } else {
                var pipeLine = Sport.getAggregatePipeLine(data);
            }
            Athelete.aggregate(pipeLine, function (err, totals) {
                if (err) {
                    console.log(err);
                    callback(err, "error in mongoose");
                } else {
                    if (_.isEmpty(totals)) {
                        callback(null, 0);
                    } else {
                        var count = totals.length;
                        console.log("counttotal", count);
                        callback(null, count);
                    }
                }
            });
        } else {
            if (data.sportName.includes("Mix") || data.sportName.includes("mix")) {
                var pipeLine = Sport.getMixAggregatePipeLine(data);
            } else {
                var pipeLine = Sport.getAggregatePipeLine(data);
            }
            var newPipeLine = _.cloneDeep(pipeLine);
            newPipeLine.push({
                $match: {
                    $or: [{
                            "sfaId": {
                                $regex: data.sfaid,
                                $options: "i"
                            }
                        },
                        {
                            "firstName": {
                                $regex: data.sfaid,
                                $options: "i"
                            }
                        }
                    ]
                },
            });
            Athelete.aggregate(newPipeLine, function (err, totals) {
                if (err) {
                    console.log(err);
                    callback(err, "error in mongoose");
                } else {
                    if (_.isEmpty(totals)) {
                        callback(null, 0);
                    } else {
                        var count = totals.length;
                        console.log("counttotal", count);
                        callback(null, count);
                    }
                }
            });
        }
    },

    //page1 without sfa
    athleteData: function (data, start, maxRow, callback) {
        if (data.sportName.includes("Mix") || data.sportName.includes("mix")) {
            var pipeLine = Sport.getMixAggregatePipeLine(data);
        } else {
            var pipeLine = Sport.getAggregatePipeLine(data);
        }
        console.log("pipeLine", pipeLine);
        async.waterfall([
                function (callback) {
                    var dataFinal = {};
                    Sport.totalAthlete(data, function (err, complete1) {
                        if (err) {
                            callback(err, null);
                        } else {
                            console.log("complete1", complete1);
                            dataFinal.total = complete1;
                            callback(null, dataFinal);
                        }

                    });
                },
                function (callback) {
                    var dataFinal = {};
                    Sport.totalAthlete(data, function (err, complete1) {
                        if (err) {
                            callback(err, null);
                        } else {
                            console.log("complete1", complete1);
                            dataFinal.total = complete1;
                            callback(null, dataFinal);
                        }

                    });
                },
                function (dataFinal, callback) {
                    var newPipeLine = _.cloneDeep(pipeLine);
                    newPipeLine.push(
                        // Stage 6
                        {
                            '$skip': parseInt(start)
                        }, {
                            '$limit': maxRow
                        });
                    Athelete.aggregate(newPipeLine, function (err, totals) {
                        if (err) {
                            console.log(err);
                            callback(err, "error in mongoose");
                        } else {
                            if (_.isEmpty(totals)) {
                                callback(null, []);
                            } else {
                                dataFinal.results = totals;
                                dataFinal.results.push(data.found);
                                console.log("athelete", dataFinal);
                                callback(null, dataFinal);
                            }
                        }
                    });
                }

            ],
            function (err, data2) {
                if (err) {
                    console.log(err);
                    callback(null, []);
                } else if (data2) {
                    if (_.isEmpty(data2)) {
                        callback(null, []);
                    } else {
                        callback(null, data2);
                    }
                }
            });
    },
    //except page1 without sfa
    athleteData1: function (data, start, maxRow, callback) {
        if (data.sportName.includes("Mix") || data.sportName.includes("mix")) {
            var pipeLine = Sport.getMixAggregatePipeLine(data);
        } else {
            var pipeLine = Sport.getAggregatePipeLine(data);
        }
        console.log("pipeLine", pipeLine);
        async.waterfall([
                function (callback) {
                    var dataFinal = {};
                    Sport.totalAthlete(data, function (err, complete1) {
                        if (err) {
                            callback(err, null);
                        } else {
                            console.log("complete1", complete1);
                            dataFinal.total = complete1;
                            callback(null, dataFinal);
                        }

                    });
                },
                function (dataFinal, callback) {
                    var newPipeLine = _.cloneDeep(pipeLine);
                    newPipeLine.push(
                        // Stage 6
                        {
                            '$skip': parseInt(start)
                        }, {
                            '$limit': maxRow
                        });
                    Athelete.aggregate(newPipeLine, function (err, totals) {
                        if (err) {
                            console.log(err);
                            callback(err, "error in mongoose");
                        } else {
                            if (_.isEmpty(totals)) {
                                callback(null, []);
                            } else {
                                // data.options = options;
                                dataFinal.results = totals;
                                console.log("athelete", dataFinal);
                                callback(null, dataFinal);
                            }
                        }
                    });
                }

            ],
            function (err, data2) {
                if (err) {
                    console.log(err);
                    callback(null, []);
                } else if (data2) {
                    if (_.isEmpty(data2)) {
                        callback(null, []);
                    } else {
                        callback(null, data2);
                    }
                }
            });
    },
    //with sfa
    atheleteDataIncludingSfa: function (data, start, maxRow, callback) {
        if (data.sportName.includes("Mix") || data.sportName.includes("mix")) {
            var pipeLine = Sport.getMixAggregatePipeLine(data);
        } else {
            var pipeLine = Sport.getAggregatePipeLine(data);
        }
        async.waterfall([
                function (callback) {
                    var dataFinal = {};
                    Sport.totalAthlete(data, function (err, complete1) {
                        if (err) {
                            callback(err, null);
                        } else {
                            dataFinal.total = complete1;
                            callback(null, dataFinal);
                        }
                    });
                },
                function (dataFinal, callback) {
                    var newPipeLine = _.cloneDeep(pipeLine);
                    newPipeLine.push({
                        $match: {
                            $or: [{
                                    "sfaId": {
                                        $regex: data.sfaid,
                                        $options: "i"
                                    }
                                },
                                {
                                    "firstName": {
                                        $regex: data.sfaid,
                                        $options: "i"
                                    }
                                }
                            ]
                        },

                    });
                    newPipeLine.push(

                        {
                            '$skip': parseInt(start)
                        }, {
                            '$limit': maxRow
                        });
                    Athelete.aggregate(newPipeLine, function (err, totals) {
                        if (err) {
                            console.log(err);
                            callback(err, "error in mongoose");
                        } else {
                            if (_.isEmpty(totals)) {
                                callback(null, "No Athlete with this SFA-ID found");
                            } else {
                                dataFinal.results = totals;
                                callback(null, dataFinal);
                            }
                        }

                    });
                }

            ],
            function (err, data2) {
                if (err) {
                    console.log(err);
                    callback(null, []);
                } else if (data2) {
                    if (_.isEmpty(data2)) {
                        callback(null, []);
                    } else {
                        callback(null, data2);
                    }
                }
            });
    },

    allShootingAthelete: function (data, callback) {
        async.waterfall([
                function (callback) {
                    var maxRow = 9;
                    var page = 1;
                    if (data.page) {
                        page = data.page;
                    }
                    var start = (page - 1) * maxRow;
                    if (_.isEmpty(data.sfaid) && data.page == 1) {
                        console.log("inside shooting");
                        var pipeLine = Sport.getShootingPipeLine1(data);
                        async.waterfall([
                                function (callback) {
                                    IndividualSport.aggregate(pipeLine, function (err, athleteData) {
                                        if (err) {
                                            callback(err, "error in mongoose");
                                        } else {
                                            if (_.isEmpty(athleteData)) {
                                                console.log("athleteData", athleteData);
                                                callback(null, athleteData);
                                            } else {
                                                console.log("athleteData", athleteData);
                                                callback(null, athleteData);
                                            }
                                        }
                                    });
                                },
                                function (athleteData, callback) {
                                    var dataFinal = {};
                                    if (_.isEmpty(athleteData)) {
                                        dataFinal.total = 0;
                                        console.log("athleteData*****", athleteData);
                                        callback(null, dataFinal, athleteData);
                                    } else {
                                        Sport.totalShootingAthlete(data, function (err, complete1) {
                                            if (err) {
                                                callback(err, null);
                                            } else {
                                                console.log("complete1", complete1);
                                                dataFinal.total = complete1;
                                                callback(null, dataFinal, athleteData);
                                            }

                                        });
                                    }

                                },
                                function (dataFinal, athleteData, callback) {
                                    if (_.isEmpty(athleteData)) {
                                        console.log("athleteData-----", athleteData);
                                        callback(null, athleteData);
                                    } else {
                                        var newPipeLine = _.cloneDeep(pipeLine);
                                        newPipeLine.push(
                                            // Stage 6
                                            {
                                                '$skip': parseInt(start)
                                            }, {
                                                '$limit': maxRow
                                            });
                                        IndividualSport.aggregate(newPipeLine, function (err, totals) {
                                            if (err) {
                                                console.log(err);
                                                callback(err, "error in mongoose");
                                            } else {
                                                if (_.isEmpty(totals)) {
                                                    callback(null, []);
                                                } else {
                                                    dataFinal.results.push(athleteData);
                                                    dataFinal.results = totals;
                                                    callback(null, dataFinal);
                                                }
                                            }
                                        });
                                    }

                                }
                            ],
                            function (err, data2) {
                                if (err) {
                                    console.log(err);
                                    callback(null, []);
                                } else if (data2) {
                                    if (_.isEmpty(data2)) {
                                        console.log("data2", data2);
                                        callback(null, data2);
                                    } else {
                                        callback(null, data2);
                                    }
                                }
                            });

                    } else if (_.isEmpty(data.sfaid && data.page != 1)) {
                        var pipeLine = Sport.getShootingPipeLine(data);
                        async.waterfall([
                                function (callback) {
                                    var dataFinal = {};
                                    Sport.totalShootingAthlete(data, function (err, complete1) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            console.log("complete1", complete1);
                                            dataFinal.total = complete1;
                                            callback(null, dataFinal);
                                        }

                                    });
                                },
                                function (dataFinal, callback) {
                                    var newPipeLine = _.cloneDeep(pipeLine);
                                    newPipeLine.push(
                                        // Stage 6
                                        {
                                            '$skip': parseInt(start)
                                        }, {
                                            '$limit': maxRow
                                        });
                                    IndividualSport.aggregate(newPipeLine, function (err, totals) {
                                        if (err) {
                                            console.log(err);
                                            callback(err, "error in mongoose");
                                        } else {
                                            if (_.isEmpty(totals)) {
                                                callback(null, []);
                                            } else {
                                                // data.options = options;
                                                dataFinal.results = totals;
                                                console.log("athelete", dataFinal);
                                                callback(null, dataFinal);
                                            }
                                        }
                                    });
                                }

                            ],
                            function (err, data2) {
                                if (err) {
                                    console.log(err);
                                    callback(null, []);
                                } else if (data2) {
                                    if (_.isEmpty(data2)) {
                                        callback(null, []);
                                    } else {
                                        callback(null, data2);
                                    }
                                }
                            });

                    } else {
                        var pipeLine = Sport.getShootingPipeLine(data);
                        async.waterfall([
                                function (callback) {
                                    var dataFinal = {};
                                    Sport.totalShootingAthlete(data, function (err, complete1) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            dataFinal.total = complete1;
                                            callback(null, dataFinal);
                                        }
                                    });
                                },
                                function (dataFinal, callback) {
                                    var newPipeLine = _.cloneDeep(pipeLine);
                                    newPipeLine.push({
                                        $match: {
                                            "athleteId.sfaId": data.sfaid,
                                        },
                                        // Stage 6
                                    });
                                    newPipeLine.push(
                                        // Stage 6
                                        {
                                            '$skip': parseInt(start)
                                        }, {
                                            '$limit': maxRow
                                        });
                                    IndividualSport.aggregate(newPipeLine, function (err, totals) {
                                        if (err) {
                                            console.log(err);
                                            callback(err, "error in mongoose");
                                        } else {
                                            if (_.isEmpty(totals)) {
                                                callback(null, "No Athlete with this SFA-ID found");
                                            } else {
                                                dataFinal.results = totals;
                                                callback(null, dataFinal);
                                            }
                                        }

                                    });
                                }

                            ],
                            function (err, data2) {
                                if (err) {
                                    console.log(err);
                                    callback(null, []);
                                } else if (data2) {
                                    if (_.isEmpty(data2)) {
                                        callback(null, []);
                                    } else {
                                        callback(null, data2);
                                    }
                                }
                            });
                    }
                }
            ],
            function (err, data2) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else if (data2) {
                    if (_.isEmpty(data2)) {
                        callback(null, data2);
                    } else {
                        callback(null, data2);
                    }
                }
            });
    },

    totalShootingAthlete: function (data, callback) {
        if (_.isEmpty(data.sfaid)) {
            var pipeLine = Sport.getShootingPipeLine(data);
            IndividualSport.aggregate(pipeLine, function (err, totals) {
                if (err) {
                    console.log(err);
                    callback(err, "error in mongoose");
                } else {
                    if (_.isEmpty(totals)) {
                        callback(null, 0);
                    } else {
                        var count = totals.length;
                        console.log("counttotal", count);
                        callback(null, count);
                    }
                }
            });
        } else {
            var pipeLine = Sport.getShootingPipeLine(data);
            var newPipeLine = _.cloneDeep(pipeLine);
            newPipeLine.push({
                $match: {
                    "athleteId.sfaId": data.sfaid,
                },
                // Stage 6
            });
            IndividualSport.aggregate(newPipeLine, function (err, totals) {
                if (err) {
                    console.log(err);
                    callback(err, "error in mongoose");
                } else {
                    if (_.isEmpty(totals)) {
                        callback(null, 0);
                    } else {
                        var count = totals.length;
                        console.log("counttotal", count);
                        callback(null, count);
                    }
                }
            });
        }
    },

    search: function (data, callback) {
        var Model = this;
        var Const = this(data);
        var maxRow = Config.maxRow;

        var page = 1;
        if (data.page) {
            page = data.page;
        }
        var field = data.field;
        var options = {
            field: data.field,
            filters: {
                keyword: {
                    fields: ['name'],
                    term: data.keyword
                }
            },
            sort: {
                desc: 'createdAt'
            },
            start: (page - 1) * maxRow,
            count: maxRow
        };
        if (data.keyword == "") {
            var deepSearch = "sportslist ageGroup weight";
            var Search = Model.find(data.keyword)

                .order(options)
                .deepPopulate(deepSearch)
                .keyword(options)
                .page(options, callback);

        } else {
            async.waterfall([
                    function (callback) {
                        var dataFinal = {};
                        var pipeLine = Sport.getSearchPipeLine(data);
                        Sport.aggregate(pipeLine, function (err, totals) {
                            if (err) {
                                console.log(err);
                                callback(err, "error in mongoose");
                            } else {
                                if (_.isEmpty(totals)) {
                                    callback(null, 0);
                                } else {
                                    dataFinal.total = totals.length;
                                    // console.log("counttotal", dataFinal.count);
                                    callback(null, dataFinal);
                                }
                            }
                        });

                    },
                    function (dataFinal, callback) {
                        var pipeLine = Sport.getSearchPipeLine(data);
                        var newPipeLine = _.cloneDeep(pipeLine);
                        newPipeLine.push(
                            // Stage 6
                            {
                                '$skip': parseInt(options.start)
                            }, {
                                '$limit': maxRow
                            });
                        Sport.aggregate(newPipeLine, function (err, totals) {
                            if (err) {
                                console.log(err);
                                callback(err, "error in mongoose");
                            } else {
                                if (_.isEmpty(totals)) {
                                    callback(null, []);
                                } else {
                                    dataFinal.options = options;
                                    dataFinal.results = totals;
                                    console.log("athelete", dataFinal);
                                    callback(null, dataFinal);
                                }
                            }
                        });
                    }

                ],
                function (err, data2) {
                    if (err) {
                        console.log(err);
                        callback(null, []);
                    } else if (data2) {
                        if (_.isEmpty(data2)) {
                            callback(null, []);
                        } else {
                            callback(null, data2);
                        }
                    }
                });

        }

    },

    saveSport: function (data, callback) {
        if (_.isEmpty(data.weight)) {
            data.weight = undefined;
        }
        if (_.isEmpty(data.ageGroup)) {
            data.ageGroup = undefined;
        }
        if (_.isEmpty(data.sportslist)) {
            data.sportslist = undefined;
        }
        Sport.saveData(data, function (err, sportData) {
            if (err) {
                console.log("err", err);
                callback("There was an error while saving", null);
            } else {
                if (_.isEmpty(sportData)) {
                    callback("No order data found", null);
                } else {
                    callback(null, sportData);
                }
            }
        });
    },

    generateExcel: function (res) {
        async.waterfall([
                function (callback) {
                    var pipeLine = Sport.getSportPipeLine();
                    Sport.aggregate(pipeLine, function (err, complete) {
                        if (err) {
                            callback(err, "error in mongoose");
                        } else {
                            if (_.isEmpty(complete)) {
                                callback(null, []);
                            } else {
                                callback(null, complete);
                            }
                        }
                    });

                },
                function (complete, callback) {
                    var excelData = [];
                    _.each(complete, function (n) {
                        var obj = {};
                        obj.sportsList = n.sportslist.name;
                        obj.ageGroup = n.ageGroup.name;
                        var dateTime = moment.utc(n.createdAt).utcOffset("+05:30").format('YYYY-MM-DD HH:mm');
                        obj.date = dateTime;
                        obj.gender = n.gender;
                        obj.maxTeamPlayers = n.maxTeamPlayers;
                        obj.minTeamPlayers = n.minTeamPlayers;
                        obj.maxTeam = n.maxTeam;
                        if (n.weight) {
                            obj.weight = n.weight.name;
                        } else {
                            obj.weight = " ";
                        }
                        var from = moment.utc(n.fromDate).utcOffset("+05:30").format('YYYY-MM-DD');
                        obj.fromDate = from;
                        var todate = moment.utc(n.toDate).utcOffset("+05:30").format('YYYY-MM-DD');
                        obj.toDate = todate;
                        excelData.push(obj);
                    });
                    console.log("excel:", excelData);
                    Config.generateExcelOld("Sport", excelData, res);
                }
            ],
            function (err, data2) {
                if (err) {
                    console.log(err);
                    callback(null, []);
                } else if (data2) {
                    if (_.isEmpty(data2)) {
                        callback(null, []);
                    } else {
                        callback(null, data2);
                    }
                }
            });
    },

    athleteRegistedCheck: function (data, callback) {
        async.waterfall([
                function (callback) {
                    School.findOne({
                        _id: found.school
                    }).exec(function (err, complete) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(complete)) {
                            callback(null, []);
                        } else {
                            data.school = complete.name;
                            // data.isRegisted = true;
                            // console.log(data);
                            callback(null, data);
                        }
                    });
                },
                function (data, callback) {
                    Registration.findOne({
                        schoolName: data.school
                    }).exec(function (err, complete) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(complete)) {
                            callback(null, []);
                        } else {
                            // data.school = complete.name;
                            data.isRegisted = true;
                            console.log(data);
                            callback(null, data);
                        }
                    });
                }
            ],
            function (err, data2) {
                if (err) {
                    console.log(err);
                    callback(null, []);
                } else if (data2) {
                    if (_.isEmpty(data2)) {
                        callback(null, []);
                    } else {
                        callback(null, data2);
                    }
                }
            });
    }


};
module.exports = _.assign(module.exports, exports, model);