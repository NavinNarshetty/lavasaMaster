var schema = new Schema({
    sport: {
        type: Schema.Types.ObjectId,
        ref: 'Sport',
        index: true
    },
    athleteId: {
        type: Schema.Types.ObjectId,
        ref: 'Athelete',
        index: true
    },
    sportsListSubCategory: {
        type: Schema.Types.ObjectId,
        ref: 'SportsListSubCategory',
        index: true
    },
    gender: String,
    ageGroup: {
        type: Schema.Types.ObjectId,
        ref: 'Athelete',
        index: true
    },
    perSportUnique: String
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('IndividualSport', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
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
            },

        ];
        return pipeline;
    },

    getAthletePerSchool: function (data, callback) {
        async.waterfall([
                function (callback) {
                    IndividualSport.allAthlete(data, function (err, complete) {
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
                    var results = {};
                    var finalData = [];
                    console.log("total", complete.total);
                    async.each(complete.results, function (n, callback) {
                        IndividualSport.find({
                            athleteId: n._id,
                            sportsListSubCategory: data._id
                        }).lean().exec(function (err, found) {
                            if (_.isEmpty(found)) {
                                var athlete = {};
                                athlete = n;
                                athlete.isIndividualSelected = false;
                                finalData.push(athlete);
                                results.data = finalData;
                                results.total = complete.total;
                                console.log("data", results);
                                callback(null, results);
                            } else {
                                var athlete = {};
                                athlete = n
                                athlete.isIndividualSelected = true;
                                finalData.push(athlete);
                                results.data = finalData;
                                results.total = complete.total;
                                console.log("data", results);
                                callback(null, results);
                            }
                        });
                    }, function (err) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(results)) {
                            callback(null, []);
                        } else {
                            callback(null, results);
                        }
                    });
                }
            ],
            function (err, results) {
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

    allAthlete: function (data, callback) {
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
                    if (_.isEmpty(data.sfaid)) {
                        var pipeLine = IndividualSport.getAggregatePipeLine(data);
                        async.waterfall([
                                function (callback) {
                                    var dataFinal = {};
                                    IndividualSport.totalAthlete(data, function (err, complete1) {
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
                        var pipeLine = IndividualSport.getAggregatePipeLine(data);
                        async.waterfall([
                                function (callback) {
                                    var dataFinal = {};
                                    IndividualSport.totalAthlete(data, function (err, complete1) {
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
                                            sfaId: data.sfaid,
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
            var pipeLine = IndividualSport.getAggregatePipeLine(data);
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
            var pipeLine = IndividualSport.getAggregatePipeLine(data);
            var newPipeLine = _.cloneDeep(pipeLine);
            newPipeLine.push({
                $match: {
                    sfaId: data.sfaid,
                },
                // Stage 6
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

    saveInIndividual: function (data, callback) {
        async.waterfall([
                function (callback) {

                    var atheleteName = [];
                    async.each(data, function (n, callback) {
                        async.waterfall([
                                function (callback) {
                                    IndividualSport.saveData(n, function (err, saveData) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(saveData)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, saveData)
                                            }
                                        }
                                    });
                                },
                                function (saveData, callback) {
                                    Athelete.findOne({
                                        _id: saveData.athleteId
                                    }).exec(function (err, found) { //finds all athelete
                                        if (err) {
                                            callback(err, null);
                                        } else if (_.isEmpty(found)) {
                                            callback(null, "Data is empty");
                                        } else {
                                            callback(null, found);
                                        }
                                    });
                                },
                                function (found, callback) {
                                    var emailData = {};
                                    var name = found.firstName + found.middleName + found.surname;
                                    atheleteName.push(name);
                                    emailData.from = "info@sfanow.in";
                                    emailData.email = found.email;
                                    emailData.filename = "StudentTeam.ejs";
                                    emailData.subject = "SFA: subject is missing";
                                    console.log("emaildata", emailData);

                                    Config.email(emailData, function (err, emailRespo) {
                                        if (err) {
                                            console.log(err);
                                            callback(null, err);
                                        } else if (emailRespo) {
                                            callback(null, emailRespo);
                                        } else {
                                            callback(null, atheleteName);
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
                                        callback(null, atheleteName);
                                    }
                                }
                            });
                    }, function (err) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            callback(null, atheleteName);
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

    individualConfirm: function (data, callback) {
        async.waterfall([
            function (callback) {
                IndividualSport.saveInIndividual(data, function (err, complete) {
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
                Registration.findOne({
                    _id: data.school
                }).exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(found)) {
                        callback(null, "Data is empty");
                    } else {
                        var emailData = {};
                        emailData.from = "info@sfanow.in";
                        emailData.email = found.email;
                        emailData.filename = "teamSport.ejs";
                        emailData.student = complete.atheleteName;
                        emailData.subject = "SFA: subject is missing";
                        console.log("emaildata", emailData);

                        Config.email(emailData, function (err, emailRespo) {
                            if (err) {
                                console.log(err);
                                callback(null, err);
                            } else if (emailRespo) {
                                callback(null, emailRespo);
                            } else {
                                callback(null, "Invalid data");
                            }
                        });
                    }
                });

            }
        ], function (err, data2) {
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

};
module.exports = _.assign(module.exports, exports, model);