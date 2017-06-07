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
        'firstCategory': {
            select: '_id name'
        },
        'secondCategory': {
            select: '_id name'
        },
        'thirdCategory': {
            select: '_id name'
        }
    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Sport', schema);
var exports = _.cloneDeep(require("sails-wohlig-service")(schema, "sportslist ageGroup firstCategory secondCategory thirdCategory", "sportslist ageGroup firstCategory secondCategory thirdCategory"));
var model = {

    getOneSport: function (data, callback) {
        var deepSearch = "sportslist ageGroup firstCategory secondCategory thirdCategory";
        Sport.find({
            sportslist: data._id
        }).deepPopulate(deepSearch).lean().exec(
            function (err, found) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else if (found) {
                    callback(null, found);
                } else {
                    callback("Invalid data", null);
                }
            });
    },

    getAllSports: function (data, callback) {
        var deepSearch = "sportslist ageGroup firstCategory secondCategory thirdCategory";
        Sport.find().deepPopulate(deepSearch).lean().exec(
            function (err, found) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else if (found) {
                    callback(null, found);
                } else {
                    callback("Invalid data", null);
                }
            });
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
    getAthletePerSchool: function (SportID, teamId, callback) {

        // findAll Athlete with filters school,Gender, AgeGroup, AtheleteId - > Pagination 20
        //    asycn.eachLimit();
        //        SportId -> Student -> Team Callback ->  
        // if(teamID) -> CurrentTeam

    },
    isStudentInSport: function (studentID, SportId, callback) {
        // count  TeamSport - > School ID-> StudentID - > SportId 
        // if(count == 0) {}
        // else { AlreadyInTeam }
    },

    // Team Confirm function
    teamConfirm: function (data, callback) { // Data -> array of (StudentID, Sport,isCaptain,isGoalkeeper)
        //      Waterfall
        //          1. CreateTeamSportWithSchool 
        //          2. async.each(data,fuction() { SaveInTeam })
        //          3. FindAthelete $in ID
        //          4. Send Emails          
    }


};
module.exports = _.assign(module.exports, exports, model);