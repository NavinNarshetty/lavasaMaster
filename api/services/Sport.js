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
    Weight: {
        type: Schema.Types.ObjectId,
        ref: 'Weight',
        index: true
    }
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
        },

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
                    "age": {
                        $lte: data.age
                    }
                }
            },

        ];
        return pipeline;
    },


    getAllAthletePerSchool: function (data, callback) {
        var type = data.sfaid.charAt(1);
        console.log(type);
        if (type == 'A') {
            console.log("inside athelete");
            async.waterfall([
                    function (callback) {
                        Athelete.findOne({
                            _id: data._id
                        }).lean().exec(
                            function (err, found) {
                                if (err) {
                                    console.log(err);
                                    callback(err, null);
                                } else if (found) {
                                    console.log("found", found);
                                    if (found.atheleteSchoolName) {
                                        var school = found.atheleteSchoolName;
                                        callback(null, school);
                                    } else {
                                        console.log("school", found.school);
                                        School.findOne({
                                            _id: found.school
                                        }).lean().exec(
                                            function (err, foundSchool) {
                                                if (err) {
                                                    console.log(err);
                                                    callback(err, null);
                                                } else if (foundSchool) {
                                                    var school = foundSchool.name;
                                                    callback(null, school);
                                                } else {
                                                    callback("Invalid data", null);
                                                }
                                            });
                                    }
                                }
                            });
                    },

                    function (school, callback) {
                        Athelete.aggregate(
                            [{
                                    $lookup: {
                                        "from": "schools",
                                        "localField": "school",
                                        "foreignField": "_id",
                                        "as": "schoolData"
                                    }
                                },
                                // Stage 2
                                {
                                    $unwind: {
                                        path: "$schoolData",
                                        preserveNullAndEmptyArrays: true // optional
                                    }
                                },
                                // Stage 3
                                {
                                    $match: {

                                        $or: [{
                                                "schoolData.name": {
                                                    $regex: school
                                                }
                                            },
                                            {
                                                "atheleteSchoolName": {
                                                    $regex: school
                                                }
                                            }
                                        ]

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
                                }
                            ],
                            function (err, returnReq) {
                                if (err) {
                                    console.log(err);
                                    callback(null, err);
                                } else {
                                    if (_.isEmpty(returnReq)) {
                                        callback(null, "data is empty");
                                    } else {
                                        callback(null, returnReq);
                                    }
                                }
                            });
                    },
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
        } else if (type == 'S') {
            async.waterfall([
                    function (callback) {
                        School.findOne({
                            _id: data.id
                        }).lean().exec(
                            function (err, found) {
                                if (err) {
                                    console.log(err);
                                    callback(err, null);
                                } else if (found) {
                                    var school = found.name;
                                    callback(null, school);
                                } else {
                                    callback("Invalid data", null);
                                }
                            });
                    },

                    function (school, callback) {
                        Athelete.aggregate(
                            [{
                                    $lookup: {
                                        "from": "schools",
                                        "localField": "school",
                                        "foreignField": "_id",
                                        "as": "schoolData"
                                    }
                                },
                                // Stage 2
                                {
                                    $unwind: {
                                        path: "$schoolData",
                                        preserveNullAndEmptyArrays: true // optional
                                    }
                                },
                                // Stage 3
                                {
                                    $match: {

                                        $or: [{
                                                "schoolData.name": {
                                                    $regex: school
                                                }
                                            },
                                            {
                                                "atheleteSchoolName": {
                                                    $regex: school
                                                }
                                            }
                                        ]

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
                                }
                            ],
                            function (err, returnReq) {
                                if (err) {
                                    console.log(err);
                                    callback(null, err);
                                } else {
                                    if (_.isEmpty(returnReq)) {
                                        callback(null, "data is empty");
                                    } else {
                                        callback(null, returnReq);
                                    }
                                }
                            });
                    },
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

    getAthletePerSchool: function (data, callback) {

        async.waterfall([
                function (callback) {
                    AgeGroup.findOne({
                        _id: data.age
                    }).exec(function (err, found) {
                        if (_.isEmpty(found)) {
                            callback(null, []);
                        } else {
                            // var age=
                        }
                    });
                },
                function (callback) {
                    Sport.allAthelete(data, function (err, complete) {
                        if (err) {
                            callback(err, null);
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
                    var finalData = [];
                    async.each(complete.results, function (n, callback) {
                        StudentTeam.find({
                            studentId: n._id,
                            sport: data.sport
                        }).lean().exec(function (err, found) {
                            if (_.isEmpty(found)) {
                                var athlete = {};
                                athlete = n;
                                athlete.isTeamSelected = false;
                                finalData.push(athlete);
                                console.log("data", finalData);
                                callback(null, finalData);
                            } else {
                                var athlete = {};
                                athlete = n
                                athlete.isTeamSelected = true;
                                console.log(athlete);
                                finalData.push(athlete);
                                callback(null, finalData);
                            }
                        });
                    }, function (err) {
                        if (err) {
                            // console.log("****** inside err ********");
                            callback(err, null);
                        } else if (_.isEmpty(finalData)) {
                            // console.log("****** inside isEmpty  ********");
                            callback(null, []);
                        } else {
                            // console.log("****** inside success ********", finalData);
                            callback(null, finalData);
                        }
                    });
                }
            ],
            function (err, finalData) {
                if (err) {
                    console.log(err);
                    callback(null, []);
                } else if (finalData) {
                    if (_.isEmpty(finalData)) {
                        callback(null, []);
                    } else {
                        callback(null, finalData);
                    }
                }
            });

        // findAll Athlete with filters school,Gender, AgeGroup, AtheleteId - > Pagination 20
        //    asycn.eachLimit();
        //        SportId -> Student -> Team Callback ->  
        // if(teamID) -> CurrentTeam

    },

    getSportPerTeam: function (data, callback) {
        Sport.aggregate([
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
                // Stage 8
                {
                    $match: {
                        "gender": data.gender,
                        "ageData.name": data.age
                    }
                },
            ],
            function (err, totals) {
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

    allAthelete: function (data, callback) {
        async.waterfall([
                function (callback) {
                    console.log("school", data.school);
                    var maxRow = Config.maxRow;
                    var page = 1;
                    if (data.page) {
                        page = data.page;
                    }
                    var options = {
                        sort: {
                            asc: 'createdAt'
                        },
                        start: (page - 1) * maxRow,
                        count: maxRow
                    };
                    if (data.sfaid != " ") {
                        console.log("inside");
                        var pipeLine = Sport.getAggregatePipeLine(data);
                        // console.log("pipeLine", pipeLine);
                        Athelete.aggregate(pipeLine, function (err, totals) {
                            if (err) {
                                console.log(err);
                                callback(err, "error in mongoose");
                            } else {
                                if (_.isEmpty(totals)) {
                                    callback(null, []);
                                } else {
                                    var count = totals.length;
                                    console.log("count", count);

                                    var data = {};
                                    data.options = options;
                                    data.results = totals;
                                    data.total = count;
                                    // console.log("athelete", data.results);
                                    callback(null, data);
                                }
                            }
                        });
                    } else {
                        var pipeLine = Sport.getAggregatePipeLine(data);
                        var newPipeLine = _.cloneDeep(pipeLine);
                        newPipeLine.push({
                            $match: {
                                sfaId: data.sfaid
                            }
                        });
                        Athelete.aggregate(newPipeLine, function (err, totals) {
                            if (err) {
                                console.log(err);
                                callback(err, "error in mongoose");
                            } else {
                                if (_.isEmpty(totals)) {
                                    callback(null, []);
                                } else {
                                    var count = totals.length;
                                    console.log("count", count);

                                    var data = {};
                                    data.options = options;
                                    data.results = totals;
                                    data.total = count;
                                    callback(null, data);
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
                        callback(null, []);
                    } else {
                        callback(null, data2);
                    }
                }
            });

    },

    removeSelectedAthlete: function (data, callback) {
        var matchToken = {
            $set: {
                isSelected: false
            }
        };
        Athelete.update({
            _id: saveData.studentId
        }, matchToken).exec(function (err, found) { //finds all athelete
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, "Data is empty");
            } else {
                callback(null, found);
            }
        });

    }




};
module.exports = _.assign(module.exports, exports, model);