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

            // Stage 6
            {
                $group: {
                    "_id": {
                        "sportName": "$sport.sportslist.name",
                        "sportsListSubCategory": "$sport.sportslist.sportsListSubCategory",
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
                            "studentId.school.name": {
                                $regex: data.schoolName
                            }
                        },
                        {
                            "studentId.atheleteSchoolName": {
                                $regex: data.schoolName
                            }
                        }
                    ]
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
            // Stage 10
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
                            age: "$studentId.age",
                            gender: "$sport.gender",
                            sportName: "$sport.sportslist.name",
                        }
                    }




                }
            },
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
                            "athleteId.school.name": {
                                $regex: data.schoolName
                            }
                        },
                        {
                            "athleteId.atheleteSchoolName": {
                                $regex: data.schoolName
                            }
                        }
                    ]
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

            // Stage 10
            {
                $group: {
                    "_id": {
                        "sportName": "$sport.sportslist.name",
                        "sportsListSubCategory": "$sport.sportslist.sportsListSubCategory",
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

            // Stage 6
            {
                $group: {
                    "_id": {
                        "sportName": "$sport.sportslist.name",
                        "sportsListSubCategory": "$sport.sportslist.sportsListSubCategory",
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

            // Stage 6
            {
                $group: {
                    "_id": {
                        "sportName": "$sport.sportslist.name",
                        "sportsListSubCategory": "$sport.sportslist.sportsListSubCategory",
                        "type": "Individual"
                    }
                }
            },
        ];
        return pipeline;
    },

    getAllRegisteredSport: function (data, callback) {
        async.parallel([
            //team sport
            function (callback) {
                var pipeLine = RegisteredSports.getTeamSportAggregatePipeLine(data);
                TeamSport.aggregate(pipeLine, function (err, complete) {
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
            //IndividualSport
            function (callback) {
                var pipeLine = RegisteredSports.getIndividualSchoolAggregatePipeLine(data);
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

            }
        ], function (err, data3) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                if (_.isEmpty(data3)) {
                    callback(null, []);
                } else {
                    callback(null, data3);
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
                            callback(null, []);
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
                            callback(null, []);
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
                    callback(null, []);
                } else {
                    callback(null, finalData);
                }
            }
        });

    },

    getDetailRegisteredAthlete: function (data, callback) {
        var pipeLine = RegisteredSports.getTeamDetailAggregatePipeLine(data);
        var newPipeLine = _.cloneDeep(pipeLine);
        StudentTeam.aggregate(pipeLine, function (err, complete) {
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

    getDetails: function (data, callback) {
        if (data.schoolToken) {
            Registration.findOne({
                accessToken: data.schoolToken
            }).exec(function (err, found) {
                if (err) {
                    callback(err, null);
                } else if (_.isEmpty(found)) {
                    callback(null, []);
                } else {
                    data.schoolName = found.schoolName;
                    RegisteredSports.getDetailRegisteredAthlete(data, function (err, complete) {
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
            });
        } else if (data.athleteToken) {
            Athelete.findOne({
                accessToken: data.athleteToken
            }).exec(function (err, found) {
                if (err) {
                    callback(err, null);
                } else if (_.isEmpty(found)) {
                    callback(null, []);
                } else {
                    if (found.atheleteSchoolName) {
                        data.schoolName = found.atheleteSchoolName;
                        RegisteredSports.getDetailRegisteredAthlete(data, function (err, complete) {
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
                    } else {
                        School.findOne({
                            _id: found.school
                        }).exec(function (err, schoolData) {
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(schoolData)) {
                                callback(null, []);
                            } else {
                                data.schoolName = schoolData.name;
                                RegisteredSports.getDetailRegisteredAthlete(data, function (err, complete) {
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
                        });
                    }
                }
            });
        } else {
            callback(null, "Invalid Data");
        }
    }

};
module.exports = _.assign(module.exports, exports, model);