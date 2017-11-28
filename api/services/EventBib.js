var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var uniqueValidator = require('mongoose-unique-validator');
var timestamps = require('mongoose-timestamp');
var validators = require('mongoose-validators');
var monguurl = require('monguurl');
var autoIncrement = require('mongoose-auto-increment');
var objectid = require("mongodb").ObjectID;
var moment = require('moment');
var request = require("request");
var generator = require('generate-password');

var schema = new Schema({});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('EventBib', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getAggregatePipeLine: function () {
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
                    path: "$sport.sportslist"
                }
            },

            // Stage 5
            {
                $lookup: {
                    "from": "agegroups",
                    "localField": "sport.ageGroup",
                    "foreignField": "_id",
                    "as": "sport.ageGroup"
                }
            },

            // Stage 6
            {
                $unwind: {
                    path: "$sport.ageGroup",
                }
            },
        ];
        return pipeline;
    },

    getAllTeamSport: function (data, callback) {
        console.log("data", data);
        var pipeLine = EventBib.getAggregatePipeLine();
        var newPipeLine = _.cloneDeep(pipeLine);

        if (_.isEmpty(data.team)) {
            console.log("inside if");
            newPipeLine.push({
                // Stage 7
                $match: {
                    "sport.sportslist._id": objectid(data.sportslist),
                    "sport.ageGroup._id": objectid(data.ageGroup),
                    "sport.gender": data.gender
                }
            });
        } else {
            console.log("inside else");
            newPipeLine.push({
                // Stage 7
                $match: {
                    "sport.sportslist._id": objectid(data.sportslist),
                    "sport.ageGroup._id": objectid(data.ageGroup),
                    "sport.gender": data.gender,
                    $or: [{
                        teamId: {
                            $regex: data.team,
                            $options: "i"
                        }
                    }, {
                        name: {
                            $regex: data.team,
                            $options: "i"
                        }
                    }]
                }
            });
        }
        console.log("newPipeLine", newPipeLine);
        TeamSport.aggregate(newPipeLine, function (err, totals) {
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

    getPlayerPerTeam: function (data, callback) {
        var deepSearch = "sport.sportslist.sportsListSubCategory.sportsListCategory sport.ageGroup sport.weight studentId.school";
        StudentTeam.find({
            teamId: data.teamId
        }).lean().deepPopulate(deepSearch).exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else {
                if (_.isEmpty(found)) {
                    callback(null, []);
                } else {
                    console.log("found", found);
                    callback(null, found);
                }
            }
        });
    },

    getAllAthleteBySchoolId: function (data, callback) {

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
                    fields: ['firstName', 'sfaId', 'surname', 'middleName', 'school'],
                    term: data.keyword
                }
            },
            sort: {
                desc: 'createdAt'
            },
            start: (page - 1) * maxRow,
            count: maxRow
        };
        async.waterfall([
                function (callback) {
                    School.findOne({
                            name: data.schoolName
                        })
                        .lean()
                        .exec(function (err, schoolData) {
                            // console.log("school", schoolData);
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(schoolData)) {
                                callback(null, []);
                            } else {
                                callback(null, schoolData);
                            }
                        });
                },
                function (schoolData, callback) {
                    console.log("School", schoolData);
                    if (_.isEmpty(schoolData)) {
                        var found = {};
                        found.result = [];
                    } else {
                        if (_.isEmpty(data.input)) {
                            var matchObj = {
                                school: schoolData._id
                            };
                        } else {
                            var matchObj = {
                                $or: [{
                                        school: schoolData._id
                                    }, {
                                        firstName: {
                                            $regex: data.input,
                                            $options: "i"

                                        }
                                    },
                                    {
                                        middleName: {
                                            $regex: data.input,
                                            $options: "i"

                                        },
                                    },
                                    {
                                        surname: {
                                            $regex: data.input,
                                            $options: "i"

                                        },
                                    }, {
                                        sfaId: {
                                            $regex: data.input,
                                            $options: "i"

                                        },
                                    }
                                ]
                            };
                        }
                        Athelete.find(matchObj)
                            .order(options)
                            .keyword(options)
                            .page(options, callback);
                    }
                },
                function (found, callback) {
                    Athelete.getSportRegisteredAthlete(found, function (err, athlete) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(athlete)) {
                            callback(null, []);
                        } else {
                            callback(null, athlete);
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

    getAthleteProfile: function (data, callback) {
        var profile = {};
        async.waterfall([
                function (callback) {
                    var deepSearch = "school";
                    Athelete.findOne({
                        _id: data.athleteId
                    }).lean().deepPopulate(deepSearch).exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(found)) {
                                callback(null, []);
                            } else {
                                callback(null, found);
                            }
                        }
                    });
                },
                function (found, callback) {
                    profile.athlete = found;
                    if (found.atheleteSchoolName) {
                        var matchObj = {
                            schoolName: found.atheleteSchoolName
                        };
                    } else {
                        var matchObj = {
                            schoolName: found.school.name
                        };
                    }
                    Registration.findOne(matchObj).lean().exec(function (err, schoolData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(schoolData)) {
                                profile.isSchoolRegistered = false;
                                if (profile.athlete.registrationFee == 'Sponsor') {
                                    profile.isSponsered = true;
                                } else {
                                    profile.isSponsered = false;
                                }
                                callback(null, profile);
                            } else {
                                if (schoolData.status == "Verified") {
                                    profile.isSchoolRegistered = true;

                                } else {
                                    profile.isSchoolRegistered = false;
                                }
                                if (profile.athlete.registrationFee == 'Sponsor') {
                                    profile.isSponsered = true;
                                } else {
                                    profile.isSponsered = false;
                                }
                                profile.paymentMode = schoolData.registrationFee;
                                profile.schoolPaymentStatus = schoolData.paymentStatus;
                                console.log("profile", profile);
                                callback(null, profile);
                            }
                        }
                    });

                },
                function (found, callback) {
                    IndividualSport.findOne({
                        athleteId: data.athleteId
                    }).lean().exec(function (err, sportData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(sportData)) {
                                profile.issport = false;
                                callback(null, profile);
                            } else {
                                profile.issport = true;
                                console.log("profile", profile);
                                callback(null, profile);
                            }
                        }
                    });
                },
                function (profile, callback) {
                    if (profile.issport == true) {
                        callback(null, profile);
                    } else {
                        StudentTeam.findOne({
                            studentId: data.athleteId
                        }).lean().exec(function (err, sportData) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(sportData)) {
                                    profile.issport = false;
                                    callback(null, profile);
                                } else {
                                    profile.issport = true;
                                    callback(null, profile);
                                }
                            }
                        });
                    }
                },
                function (profile, callback) {
                    var athleteProfile = {};
                    // console.log("profile", profile);
                    if (profile.isSchoolRegistered == false && profile.isSponsered == false) {
                        AdditionalPayment.findOne({
                            athleteId: data.athleteId
                        }).lean().exec(function (err, found) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(found)) {
                                    athleteProfile._id = profile.athlete._id;
                                    athleteProfile.firstName = profile.athlete.firstName;
                                    if (profile.athlete.middleName) {
                                        athleteProfile.middleName = profile.athlete.middleName;
                                    }
                                    athleteProfile.surname = profile.athlete.surname;
                                    athleteProfile.paymentStatus = profile.athlete.paymentStatus;
                                    if (profile.athlete.atheleteSchoolName) {
                                        athleteProfile.schoolName = profile.athlete.atheleteSchoolName;
                                    } else {
                                        athleteProfile.schoolName = profile.athlete.school.name;
                                    }
                                    // athleteProfile.schoolPaymentMode=profile.athlete.school.
                                    athleteProfile.sfaId = profile.athlete.sfaId;
                                    athleteProfile.age = profile.athlete.age;
                                    athleteProfile.dob = profile.athlete.dob;
                                    athleteProfile.photograph = profile.athlete.photograph;
                                    athleteProfile.gender = profile.athlete.gender;
                                    if (profile.athlete.remarks) {
                                        athleteProfile.remarks = profile.athlete.remarks;
                                    }
                                    athleteProfile.atheleteSchoolIdImage = profile.athlete.atheleteSchoolIdImage;
                                    athleteProfile.birthImage = profile.athlete.birthImage;
                                    if (profile.athlete.photoImage) {
                                        athleteProfile.photoImage = profile.athlete.photoImage;
                                    }
                                    athleteProfile.ageProof = profile.athlete.ageProof;
                                    athleteProfile.isSchoolRegistered = profile.isSchoolRegistered;
                                    athleteProfile.isSponsered = profile.isSponsered;
                                    if (profile.athlete.isBib) {
                                        athleteProfile.isBib = profile.athlete.isBib;
                                    }
                                    athleteProfile.additionalPaymentStatus = "Pending";
                                    athleteProfile.issport = profile.issport;
                                    athleteProfile.schoolPaymentMode = profile.paymentMode;
                                    athleteProfile.schoolPaymentStatus = profile.schoolPaymentStatus;
                                    athleteProfile.status = profile.athlete.status;
                                    callback(null, athleteProfile);
                                } else {
                                    athleteProfile._id = profile.athlete._id;
                                    athleteProfile.firstName = profile.athlete.firstName;
                                    if (profile.athlete.middleName) {
                                        athleteProfile.middleName = profile.athlete.middleName;
                                    }
                                    athleteProfile.surname = profile.athlete.surname;
                                    athleteProfile.paymentStatus = profile.athlete.paymentStatus;
                                    if (profile.athlete.atheleteSchoolName) {
                                        athleteProfile.schoolName = profile.athlete.atheleteSchoolName;
                                    } else {
                                        athleteProfile.schoolName = profile.athlete.school.name;
                                    }
                                    athleteProfile.sfaId = profile.athlete.sfaId;
                                    athleteProfile.age = profile.athlete.age;
                                    athleteProfile.dob = profile.athlete.dob;
                                    athleteProfile.photograph = profile.athlete.photograph;
                                    athleteProfile.gender = profile.athlete.gender;
                                    if (profile.athlete.remarks) {
                                        athleteProfile.remarks = profile.athlete.remarks;
                                    }
                                    athleteProfile.atheleteSchoolIdImage = profile.athlete.atheleteSchoolIdImage;
                                    athleteProfile.birthImage = profile.athlete.birthImage;
                                    if (profile.athlete.photoImage) {
                                        athleteProfile.photoImage = profile.athlete.photoImage;
                                    }
                                    athleteProfile.ageProof = profile.athlete.ageProof;
                                    athleteProfile.isSchoolRegistered = profile.isSchoolRegistered;
                                    athleteProfile.isSponsered = profile.isSponsered;
                                    if (profile.athlete.isBib) {
                                        athleteProfile.isBib = profile.athlete.isBib;
                                    }
                                    athleteProfile.additionalPaymentStatus = found.paymentStatus;
                                    athleteProfile.issport = profile.issport;
                                    athleteProfile.schoolPaymentMode = profile.paymentMode;
                                    athleteProfile.schoolPaymentStatus = profile.schoolPaymentStatus;
                                    athleteProfile.status = profile.athlete.status;
                                    callback(null, athleteProfile);
                                }
                            }
                        });
                    } else {
                        athleteProfile._id = profile.athlete._id;
                        athleteProfile.firstName = profile.athlete.firstName;
                        if (profile.athlete.middleName) {
                            athleteProfile.middleName = profile.athlete.middleName;
                        }
                        athleteProfile.surname = profile.athlete.surname;
                        athleteProfile.paymentStatus = profile.athlete.paymentStatus;
                        if (profile.athlete.atheleteSchoolName) {
                            athleteProfile.schoolName = profile.athlete.atheleteSchoolName;
                        } else {
                            athleteProfile.schoolName = profile.athlete.school.name;
                        }
                        athleteProfile.sfaId = profile.athlete.sfaId;
                        athleteProfile.age = profile.athlete.age;
                        athleteProfile.dob = profile.athlete.dob;
                        athleteProfile.photograph = profile.athlete.photograph;
                        athleteProfile.gender = profile.athlete.gender;
                        if (profile.athlete.remarks) {
                            athleteProfile.remarks = profile.athlete.remarks;
                        }
                        athleteProfile.atheleteSchoolIdImage = profile.athlete.atheleteSchoolIdImage;
                        athleteProfile.birthImage = profile.athlete.birthImage;
                        if (profile.athlete.photoImage) {
                            athleteProfile.photoImage = profile.athlete.photoImage;
                        }
                        athleteProfile.ageProof = profile.athlete.ageProof;
                        athleteProfile.isSchoolRegistered = profile.isSchoolRegistered;
                        athleteProfile.isSponsered = profile.isSponsered;
                        if (profile.athlete.isBib) {
                            athleteProfile.isBib = profile.athlete.isBib;
                        }
                        athleteProfile.issport = profile.issport;
                        athleteProfile.schoolPaymentMode = profile.paymentMode;
                        athleteProfile.schoolPaymentStatus = profile.schoolPaymentStatus;
                        athleteProfile.status = profile.athlete.status;
                        callback(null, athleteProfile);
                    }
                }
            ],
            function (err, data2) {
                if (err) {
                    callback(null, []);
                } else if (data2) {
                    if (_.isEmpty(data2)) {
                        callback(null, data2);
                    } else {
                        callback(null, data2);
                    }
                }
            });
    },

    getSchool: function (data, callback) {
        var Model = this;
        var Const = this(data);
        var maxRow = Config.maxRow / 2;

        var page = 1;
        if (data.page) {
            page = data.page;
        }
        var start = (page - 1) * maxRow;
        if (data.input) {
            var matchObj = {
                $or: [{
                    name: {
                        $regex: data.input,
                        $options: "i"
                    }
                }, {
                    schoolName: {
                        $regex: data.input,
                        $options: "i"
                    }
                }]
            };
        } else {
            var matchObj = {};
        }

        async.waterfall([
            function (callback) {
                School.find(matchObj).lean().skip(start).limit(maxRow).exec(function (err, oldSchool) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(oldSchool)) {
                        callback(null, []);
                    } else {
                        callback(null, oldSchool);
                    }
                });
            },
            function (oldSchool, callback) {
                Registration.find(matchObj).lean().skip(start).limit(maxRow).exec(function (err, registeredSchool) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(registeredSchool)) {
                        var school = [].concat.apply([], [
                            oldSchool
                        ]);
                        callback(null, school);
                    } else {
                        var school = [].concat.apply([], [
                            oldSchool,
                            registeredSchool
                        ]);
                        callback(null, school);
                    }
                });
            },
            function (school, callback) {
                // console.log("school", school);
                async.concatSeries(school, function (singleData, callback) {
                    var info = {};
                    info._id = singleData._id;
                    if (singleData.name) {
                        info.schoolName = singleData.name;
                    } else {
                        info.schoolName = singleData.schoolName;
                    }
                    callback(null, info);
                }, function (err, final) {
                    if (err) {
                        callback(err, null);
                    } else {
                        // console.log("final", final);
                        callback(null, final);
                    }
                });
            }
        ], function (err, found) {
            if (err) {
                callback(err, null);
            } else {
                console.log("main count:", found.length);
                var schoolUniq = _.uniqBy(found, "schoolName");
                console.log("uniq count:", schoolUniq.length);
                callback(null, schoolUniq);
            }
        });

    }

};
module.exports = _.assign(module.exports, exports, model);