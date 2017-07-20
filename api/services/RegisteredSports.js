var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var uniqueValidator = require('mongoose-unique-validator');
var timestamps = require('mongoose-timestamp');
var validators = require('mongoose-validators');
var monguurl = require('monguurl');
var md5 = require('md5');
var moment = require('moment');
var autoIncrement = require('mongoose-auto-increment');
var objectid = require("mongodb").ObjectID;
autoIncrement.initialize(mongoose);
require('mongoose-middleware').initialize(mongoose);
var schema = new Schema({});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('RegisteredSports', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {


    //--------------------- Pipeline Section ---------------
    getTeamSportAggregatePipeLine: function (data) {

        var pipeline = [
            // Stage 1
            {
                $match: {
                    "school": objectid(data.school)
                }
            },

            // Stage 2
            {
                $lookup: {
                    "from": "sports",
                    "localField": "sport",
                    "foreignField": "_id",
                    "as": "sport"
                }
            },

            // Stage 3
            {
                $unwind: {
                    path: "$sport",
                }
            },

            // Stage 4
            {
                $lookup: {
                    "from": "sportslists",
                    "localField": "sport.sportslist",
                    "foreignField": "_id",
                    "as": "sport.sportslist"
                }
            },

            // Stage 5
            {
                $unwind: {
                    path: "$sport.sportslist",
                }
            },

            // Stage 5
            {
                $lookup: {
                    "from": "sportslistsubcategories",
                    "localField": "sport.sportslist.sportsListSubCategory",
                    "foreignField": "_id",
                    "as": "sport.sportslist.sportsListSubCategory"
                }
            },

            // Stage 6
            {
                $unwind: {
                    path: "$sport.sportslist.sportsListSubCategory",
                }
            },

            // Stage 6
            {
                $group: {
                    "_id": {
                        "sportName": "$sport.sportslist.sportsListSubCategory.name",
                        "sportsListSubCategory": "$sport.sportslist.sportsListSubCategory._id",
                        "type": "Team"
                    }
                }
            },

        ];
        return pipeline;
    },

    getTeamDetailAggregatePipeLine: function (data) {

        var pipeline = [
            // Stage 6
            {
                $lookup: {
                    "from": "atheletes",
                    "localField": "studentId",
                    "foreignField": "_id",
                    "as": "studentId"
                }
            },

            // Stage 7
            {
                $unwind: {
                    path: "$studentId",

                }
            },
            // Stage 3
            {
                $lookup: {
                    "from": "schools",
                    "localField": "studentId.school",
                    "foreignField": "_id",
                    "as": "studentId.school"
                }
            },

            // Stage 4
            {
                $unwind: {
                    path: "$studentId.school",
                    preserveNullAndEmptyArrays: true // optional
                }
            },

            // Stage 5
            {
                $match: {
                    $or: [{
                            "studentId.school.name": data.schoolName
                        },
                        {
                            "studentId.atheleteSchoolName": data.schoolName
                        }
                    ]
                }
            },

            // Stage 2
            {
                $unwind: {
                    path: "$sport",
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
            {
                $lookup: {

                    "from": "agegroups",
                    "localField": "sport.ageGroup",
                    "foreignField": "_id",
                    "as": "sport.ageGroup"
                }
            },

            // Stage 2
            {
                $unwind: {
                    path: "$sport.ageGroup",
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
                    "sport.sportslist.sportsListSubCategory": objectid(data.sportsListSubCategory)
                }
            },
            // Stage 8
            {
                $lookup: {
                    "from": "teamsports",
                    "localField": "teamId",
                    "foreignField": "_id",
                    "as": "teamId"
                }
            },

            // Stage 9
            {
                $unwind: {
                    path: "$teamId",

                }
            },
            {
                $group: {

                    "_id": "$teamId.teamId",
                    "info": {
                        $push: {
                            firstname: "$studentId.firstName",
                            lastname: "$studentId.surname",
                            middlename: "$studentId.middleName",
                            sfaid: "$studentId.sfaId",
                            email: "$studentId.email",
                            age: "$sport.ageGroup.name",
                            gender: "$sport.gender",
                            name: "$teamId.name",
                            createdBy: "$teamId.createdBy",
                            isCaptain: "$isCaptain",
                            isGoalKeeper: "$isGoalKeeper",
                            sportName: "$sport.sportslist.name",
                        }
                    }
                }
            }
        ];
        return pipeline;
    },

    getIndividualSchoolAggregatePipeLine: function (data) {

        var pipeline = [
            // Stage 1
            {
                $lookup: {
                    "from": "atheletes",
                    "localField": "athleteId",
                    "foreignField": "_id",
                    "as": "athleteId"
                }
            },

            // Stage 2
            {
                $unwind: {
                    path: "$athleteId",
                }
            },

            // Stage 3
            {
                $lookup: {
                    "from": "schools",
                    "localField": "athleteId.school",
                    "foreignField": "_id",
                    "as": "athleteId.school"
                }
            },

            // Stage 4
            {
                $unwind: {
                    path: "$athleteId.school",
                    preserveNullAndEmptyArrays: true // optional
                }
            },

            // Stage 5
            {
                $match: {
                    $or: [{
                            "athleteId.school.name": data.schoolName
                        },
                        {
                            "athleteId.atheleteSchoolName": data.schoolName
                        }
                    ]
                }
            },
            // Stage 7
            {
                $unwind: {
                    path: "$sport",
                }
            },
            // Stage 6
            {
                $lookup: {
                    "from": "sports",
                    "localField": "sport",
                    "foreignField": "_id",
                    "as": "sport"
                }
            },

            // Stage 7
            {
                $unwind: {
                    path: "$sport",
                }
            },

            // Stage 8
            {
                $lookup: {
                    "from": "sportslists",
                    "localField": "sport.sportslist",
                    "foreignField": "_id",
                    "as": "sport.sportslist"
                }
            },

            // Stage 9
            {
                $unwind: {
                    path: "$sport.sportslist",
                }
            },
            // Stage 5
            {
                $lookup: {
                    "from": "sportslistsubcategories",
                    "localField": "sport.sportslist.sportsListSubCategory",
                    "foreignField": "_id",
                    "as": "sport.sportslist.sportsListSubCategory"
                }
            },

            // Stage 6
            {
                $unwind: {
                    path: "$sport.sportslist.sportsListSubCategory",
                }
            },
            // Stage 10
            {
                $group: {
                    "_id": {
                        "sportName": "$sport.sportslist.sportsListSubCategory.name",
                        "sportsListSubCategory": "$sport.sportslist.sportsListSubCategory._id",
                        "type": "Individual"
                    }
                }
            },

        ];
        return pipeline;
    },

    getStudentTeamAggregatePipeLine: function (data) {

        var pipeline = [
            // Stage 1
            {
                $match: {
                    "studentId": objectid(data.athleteid)
                }
            },

            // Stage 2
            {
                $lookup: {
                    "from": "sports",
                    "localField": "sport",
                    "foreignField": "_id",
                    "as": "sport"
                }
            },

            // Stage 3
            {
                $unwind: {
                    path: "$sport"
                }
            },

            // Stage 4
            {
                $lookup: {
                    "from": "sportslists",
                    "localField": "sport.sportslist",
                    "foreignField": "_id",
                    "as": "sport.sportslist"
                }
            },

            // Stage 5
            {
                $unwind: {
                    path: "$sport.sportslist",
                }
            },
            // Stage 5
            {
                $lookup: {
                    "from": "sportslistsubcategories",
                    "localField": "sport.sportslist.sportsListSubCategory",
                    "foreignField": "_id",
                    "as": "sport.sportslist.sportsListSubCategory"
                }
            },

            // Stage 6
            {
                $unwind: {
                    path: "$sport.sportslist.sportsListSubCategory",
                }
            },
            // Stage 6
            {
                $group: {
                    "_id": {
                        "sportName": "$sport.sportslist.sportsListSubCategory.name",
                        "sportsListSubCategory": "$sport.sportslist.sportsListSubCategory._id",
                        "type": "Team"
                    }

                }
            },
        ];
        return pipeline;
    },

    getStudentIndividualAggregatePipeLine: function (data) {

        var pipeline = [
            // Stage 1
            {
                $match: {
                    "athleteId": objectid(data.athleteid)
                }
            },

            // Stage 2
            {
                $lookup: {
                    "from": "sports",
                    "localField": "sport",
                    "foreignField": "_id",
                    "as": "sport"
                }
            },

            // Stage 3
            {
                $unwind: {
                    path: "$sport",

                }
            },

            // Stage 4
            {
                $lookup: {
                    "from": "sportslists",
                    "localField": "sport.sportslist",
                    "foreignField": "_id",
                    "as": "sport.sportslist"
                }
            },

            // Stage 5
            {
                $unwind: {
                    path: "$sport.sportslist",

                }
            },

            // Stage 5
            {
                $lookup: {
                    "from": "sportslistsubcategories",
                    "localField": "sport.sportslist.sportsListSubCategory",
                    "foreignField": "_id",
                    "as": "sport.sportslist.sportsListSubCategory"
                }
            },

            // Stage 6
            {
                $unwind: {
                    path: "$sport.sportslist.sportsListSubCategory",
                }
            },

            // Stage 6
            {
                $group: {
                    "_id": {
                        "sportName": "$sport.sportslist.sportsListSubCategory.name",
                        "sportsListSubCategory": "$sport.sportslist.sportsListSubCategory._id",
                        "type": "Individual"
                    }
                }
            },
        ];
        return pipeline;
    },

    getDetailIndividualAggregatePipeLine: function (data) {

        var pipeline = [
            // Stage 1
            {
                $match: {
                    sportsListSubCategory: objectid(data.sportsListSubCategory)
                }
            },

            // Stage 2
            {
                $lookup: {
                    "from": "atheletes",
                    "localField": "athleteId",
                    "foreignField": "_id",
                    "as": "athleteId"
                }
            },

            // Stage 3
            {
                $unwind: {
                    path: "$athleteId",
                }
            },

            // Stage 4
            {
                $lookup: {
                    "from": "schools",
                    "localField": "athleteId.school",
                    "foreignField": "_id",
                    "as": "athleteId.school"
                }
            },

            // Stage 5
            {
                $unwind: {
                    path: "$athleteId.school",
                    preserveNullAndEmptyArrays: true
                }
            },

            // Stage 6
            {
                $match: {
                    $or: [{
                            "athleteId.school.name": data.schoolName
                        },
                        {
                            "athleteId.atheleteSchoolName": data.schoolName
                        }
                    ]
                }
            },
            // Stage 7
            {
                $unwind: {
                    path: "$sport",
                }
            },
            // Stage 8
            {
                $lookup: {
                    "from": "sports",
                    "localField": "sport",
                    "foreignField": "_id",
                    "as": "sport"
                }
            },

            // Stage 9
            {
                $unwind: {
                    path: "$sport",
                }
            },
            // Stage 10
            {
                $lookup: {
                    "from": "agegroups",
                    "localField": "sport.ageGroup",
                    "foreignField": "_id",
                    "as": "sport.ageGroup"
                }
            },

            // Stage 11
            {
                $unwind: {
                    path: "$sport.ageGroup",
                }
            },
            // Stage 12
            {
                $lookup: {
                    "from": "weights",
                    "localField": "sport.weight",
                    "foreignField": "_id",
                    "as": "sport.weight"
                }
            },
            // Stage 13
            {
                $unwind: {
                    path: "$sport.weight",
                    preserveNullAndEmptyArrays: true // optional
                }
            },
            // Stage 14
            {
                $lookup: {
                    "from": "sportslists",
                    "localField": "sport.sportslist",
                    "foreignField": "_id",
                    "as": "sport.sportslist"
                }
            },

            // Stage 15
            {
                $unwind: {
                    path: "$sport.sportslist",
                }
            },
            // Stage 16
            {
                $lookup: {
                    "from": "sportslistsubcategories",
                    "localField": "sport.sportslist.sportsListSubCategory",
                    "foreignField": "_id",
                    "as": "sport.sportslist.sportsListSubCategory"
                }
            },
            // Stage 17
            {
                $unwind: {
                    path: "$sport.sportslist.sportsListSubCategory",
                }
            },
            // Stage 18
            {
                $group: {
                    "_id": "$sport.sportslist.name",
                    "info": {
                        $push: {
                            firstname: "$athleteId.firstName",
                            lastname: "$athleteId.surname",
                            middlename: "$athleteId.middleName",
                            sfaid: "$athleteId.sfaId",
                            email: "$athleteId.email",
                            age: "$sport.ageGroup.name",
                            weight: "$sport.weight.name",
                            gender: "$sport.gender",
                            sportName: "$sport.sportslist.sportsListSubCategory.name",
                            name: "$sport.sportslist.name",
                            createdBy: "$createdBy"
                        }
                    }
                }
            },
        ];
        return pipeline;
    },

    getDetailIndividualAggregatePipeLine2: function (data) {

        var pipeline = [
            // Stage 1
            {
                $match: {
                    sportsListSubCategory: objectid(data.sportsListSubCategory)
                }
            },

            // Stage 2
            {
                $lookup: {
                    "from": "atheletes",
                    "localField": "athleteId",
                    "foreignField": "_id",
                    "as": "athleteId"
                }
            },

            // Stage 3
            {
                $unwind: {
                    path: "$athleteId",
                }
            },

            // Stage 4
            {
                $match: {
                    "athleteId._id": objectid(data.athleteId)
                }
            },
            {
                $unwind: {
                    path: "$sport",
                }
            },
            // Stage 5
            {
                $lookup: {
                    "from": "sports",
                    "localField": "sport",
                    "foreignField": "_id",
                    "as": "sport"
                }
            },

            // Stage 6
            {
                $unwind: {
                    path: "$sport",
                }
            },
            // Stage 7
            {
                $lookup: {
                    "from": "agegroups",
                    "localField": "sport.ageGroup",
                    "foreignField": "_id",
                    "as": "sport.ageGroup"
                }
            },

            // Stage 8
            {
                $unwind: {
                    path: "$sport.ageGroup",
                }
            },
            //stage 9
            {
                $lookup: {
                    "from": "weights",
                    "localField": "sport.weight",
                    "foreignField": "_id",
                    "as": "sport.weight"
                }
            },
            // Stage 10
            {
                $unwind: {
                    path: "$sport.weight",
                    preserveNullAndEmptyArrays: true // optional
                }
            },

            // Stage 11
            {
                $lookup: {
                    "from": "sportslists",
                    "localField": "sport.sportslist",
                    "foreignField": "_id",
                    "as": "sport.sportslist"
                }
            },

            // Stage 12
            {
                $unwind: {
                    path: "$sport.sportslist",
                }
            },
            //stage 13
            {
                $lookup: {
                    "from": "sportslistsubcategories",
                    "localField": "sport.sportslist.sportsListSubCategory",
                    "foreignField": "_id",
                    "as": "sport.sportslist.sportsListSubCategory"
                }
            },

            // Stage 14
            {
                $unwind: {
                    path: "$sport.sportslist.sportsListSubCategory",
                }
            },

            // Stage 15
            {
                $group: {
                    "_id": "$sport.sportslist.name",
                    "info": {
                        $push: {
                            firstname: "$athleteId.firstName",
                            lastname: "$athleteId.surname",
                            middlename: "$athleteId.middleName",
                            sfaid: "$athleteId.sfaId",
                            email: "$athleteId.email",
                            weight: '$sport.weight.name',
                            age: "$sport.ageGroup.name",
                            gender: "$sport.gender",
                            sportName: "$sport.sportslist.sportsListSubCategory.name",
                            name: "$sport.sportslist.name",
                            createdBy: "$createdBy"
                        }
                    }
                }
            },
        ];
        return pipeline;
    },

    //--------------------- End of Pipeline Section ---------------

    getAllRegisteredSport: function (data, callback) {
        var finalData = [];
        async.waterfall([
            //team sport
            function (callback) {
                var pipeLine = RegisteredSports.getTeamSportAggregatePipeLine(data);
                TeamSport.aggregate(pipeLine, function (err, complete) {
                    if (err) {
                        console.log(err);
                        callback(err, "error in mongoose");
                    } else {
                        if (_.isEmpty(complete)) {
                            callback(null, finalData);
                        } else {
                            _.each(complete, function (n) {
                                finalData.push(n);
                            });
                            callback(null, finalData);
                        }
                    }
                });

            },
            //IndividualSport
            function (finalData, callback) {
                var pipeLine = RegisteredSports.getIndividualSchoolAggregatePipeLine(data);
                IndividualSport.aggregate(pipeLine, function (err, complete1) {
                    if (err) {
                        console.log(err);
                        callback(err, "error in mongoose");
                    } else {
                        if (_.isEmpty(complete1)) {
                            callback(null, finalData);
                        } else {
                            _.each(complete1, function (n) {
                                finalData.push(n);
                            });
                            callback(null, finalData);
                        }
                    }
                });

            }
        ], function (err, data3) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                if (_.isEmpty(data3)) {
                    callback(null, finalData);
                } else {
                    callback(null, finalData);
                }
            }
        });
    },

    getAllRegisteredSportAthlete: function (data, callback) {
        var finalData = [];
        async.waterfall([
            function (callback) {
                var pipeLine = RegisteredSports.getStudentTeamAggregatePipeLine(data);
                StudentTeam.aggregate(pipeLine, function (err, complete) {
                    if (err) {
                        console.log(err);
                        callback(err, "error in mongoose");
                    } else {
                        if (_.isEmpty(complete)) {
                            callback(null, finalData);
                        } else {
                            _.each(complete, function (n) {
                                finalData.push(n);
                            });
                            callback(null, finalData);
                        }
                    }
                });
            },
            //IndividualSport
            function (finalData, callback) {
                var pipeLine = RegisteredSports.getStudentIndividualAggregatePipeLine(data);
                IndividualSport.aggregate(pipeLine, function (err, complete1) {
                    if (err) {
                        console.log(err);
                        callback(err, "error in mongoose");
                    } else {
                        if (_.isEmpty(complete1)) {
                            callback(null, finalData);
                        } else {
                            _.each(complete1, function (m) {
                                finalData.push(m);
                            });

                            callback(null, finalData);
                        }
                    }
                });


            }
        ], function (err, data3) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                if (_.isEmpty(data3)) {
                    callback(null, finalData);
                } else {
                    callback(null, finalData);
                }
            }
        });

    },

    getDetailRegisteredSchoolSports: function (data, callback) {
        var pipeLine = RegisteredSports.getTeamDetailAggregatePipeLine(data);
        StudentTeam.aggregate(pipeLine, function (err, complete) {
            if (err) {
                console.log(err);
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

    getDetailRegisteredAthleteSports: function (data, callback) {
        var pipeLine = RegisteredSports.getTeamDetailAggregatePipeLine(data);
        async.waterfall([
                function (callback) {
                    StudentTeam.aggregate(pipeLine, function (err, complete) {
                        if (err) {
                            console.log(err);
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
                    var atheleteSports = [];
                    _.each(complete, function (n) {
                        _.each(n.info, function (m) {
                            if (m.sfaid == data.athleteSFA) {
                                atheleteSports.push(n);
                            }
                        });
                    });
                    callback(null, atheleteSports);
                }
            ],
            function (err, atheleteSports) {
                if (err) {
                    console.log(err);
                    callback(null, []);
                } else if (atheleteSports) {
                    if (_.isEmpty(atheleteSports)) {
                        callback(null, atheleteSports);
                    } else {
                        callback(null, atheleteSports);
                    }
                }
            });
    },

    getDetails: function (data, callback) {
        if (data.schoolToken) {
            async.waterfall([
                    function (callback) {
                        Registration.findOne({
                            accessToken: data.schoolToken
                        }).exec(function (err, found) {
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(found)) {
                                callback(null, []);
                            } else {
                                data.schoolName = found.schoolName;
                                callback(null, data);
                            }
                        });
                    },
                    function (data, callback) {
                        RegisteredSports.getDetailRegisteredSchoolSports(data, function (err, complete) {
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
                    }
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
        } else if (data.athleteToken) {
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
                                callback(null, found);
                            }
                        });
                    },
                    function (found, callback) {
                        if (found.atheleteSchoolName) {
                            data.athleteId = found._id;
                            data.athleteSFA = found.sfaId;
                            data.schoolName = found.atheleteSchoolName;
                            callback(null, data);
                        } else {
                            School.findOne({
                                _id: found.school
                            }).exec(function (err, schoolData) {
                                if (err) {
                                    callback(err, null);
                                } else if (_.isEmpty(schoolData)) {
                                    callback(null, []);
                                } else {
                                    data.athleteId = found._id;
                                    data.schoolName = schoolData.name;
                                    data.athleteSFA = found.sfaId;
                                    callback(null, data);
                                }
                            });
                        }
                    },
                    function (data, callback) {
                        RegisteredSports.getDetailRegisteredAthleteSports(data, function (err, complete) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(complete)) {
                                    callback(null, complete);
                                } else {
                                    // console.log("complete", complete);
                                    callback(null, complete);
                                }
                            }
                        });
                    }
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
        } else {
            callback(null, "Invalid Data");
        }
    },

    getDetailIndividualSportSchool: function (data, callback) {
        var pipeLine = RegisteredSports.getDetailIndividualAggregatePipeLine(data);
        IndividualSport.aggregate(pipeLine, function (err, complete) {
            if (err) {
                console.log(err);
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

    getDetailIndividualSportAthlete: function (data, callback) {
        var pipeLine = RegisteredSports.getDetailIndividualAggregatePipeLine2(data);
        IndividualSport.aggregate(pipeLine, function (err, complete) {
            if (err) {
                console.log(err);
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

    getDetailsIndividual: function (data, callback) {
        if (data.schoolToken) {
            async.waterfall([
                    function (callback) {
                        Registration.findOne({
                            accessToken: data.schoolToken
                        }).exec(function (err, found) {
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(found)) {
                                callback(null, []);
                            } else {
                                data.schoolName = found.schoolName;
                                callback(null, data);
                            }
                        });
                    },
                    function (data, callback) {
                        console.log("data", data);
                        RegisteredSports.getDetailIndividualSportSchool(data, function (err, complete) {
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
                    }
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
        } else if (data.athleteToken) {
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
                                callback(null, found);
                            }
                        });
                    },
                    function (found, callback) {
                        if (found.atheleteSchoolName) {
                            data.athleteId = found._id;
                            data.schoolName = found.atheleteSchoolName;
                            callback(null, data);
                        } else {
                            School.findOne({
                                _id: found.school
                            }).exec(function (err, schoolData) {
                                if (err) {
                                    callback(err, null);
                                } else if (_.isEmpty(schoolData)) {
                                    callback(null, []);
                                } else {
                                    data.athleteId = found._id;
                                    data.schoolName = schoolData.name;
                                    callback(null, data);
                                }
                            });
                        }
                    },
                    function (data, callback) {
                        RegisteredSports.getDetailIndividualSportAthlete(data, function (err, complete) {
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
                    }
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
        } else {
            callback(null, "Invalid Data");
        }
    },

};
module.exports = _.assign(module.exports, exports, model);