var schema = new Schema({
    sport: [{
        type: Schema.Types.ObjectId,
        ref: 'Sport',
        index: true
    }],
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
    perSportUnique: String,
    createdBy: String,
    nominatedName: String,
    nominatedSchoolName: String,
    nominatedContactDetails: String,
    nominatedEmailId: String,
    isVideoAnalysis: Boolean
});

schema.plugin(deepPopulate, {
    populate: {
        'athleteId': {
            select: '_id firstName middleName surname school atheleteSchoolName sfaId gender age dob'
        },
        'sportsListSubCategory': {
            select: '_id name'
        }
    }
});
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
            },

        ];
        return pipeline;
    },

    allAthlete: function (data, callback) {
        async.waterfall([
                function (callback) {
                    console.log("age111", data.age);
                    var maxRow = 9;
                    var page = 1;
                    if (data.page) {
                        page = data.page;
                    }
                    var start = (page - 1) * maxRow;
                    console.log("options", start);
                    if (data.sfaid == "" && data.age == "" && data.gender == "") {
                        console.log("inside empty all");
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

                    } else if (data.sfaid && data.age && data.gender) {
                        console.log("inside all data");
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
                                            age: data.age,
                                            gender: data.gender
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
                    } else if (data.sfaid && data.age) {
                        console.log("inside age and sfa");
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
                                            age: data.age
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
                    } else if (data.sfaid && data.gender) {
                        console.log("inside gender and sfa");
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
                                            gender: data.gender
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
                    } else if (data.age && data.gender) {
                        console.log("inside age and gender");
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
                                            gender: data.gender,
                                            age: data.age
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
                    } else if (data.age) {
                        console.log("inside age");
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
                                            age: data.age,
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
                    } else if (data.gender) {
                        console.log("inside gender");
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
                                            gender: data.gender,
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
                    } else if (data.sfaid) {
                        console.log("inside sfa");
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
        console.log("data.age", data.age);
        if (data.sfaid == "" && data.age == "" && data.gender == "") {
            console.log("inside empties");
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
        } else if (data.sfaid && data.age && data.gender) {
            console.log("inside all");
            var pipeLine = IndividualSport.getAggregatePipeLine(data);
            var newPipeLine = _.cloneDeep(pipeLine);
            newPipeLine.push({
                $match: {
                    sfaId: data.sfaid,
                    age: data.age,
                    gender: data.gender
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
        } else if (data.sfaid && data.age) {
            console.log("inside age and sfa");
            var pipeLine = IndividualSport.getAggregatePipeLine(data);
            var newPipeLine = _.cloneDeep(pipeLine);
            newPipeLine.push({
                $match: {
                    sfaId: data.sfaid,
                    age: data.age
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
        } else if (data.sfaid && data.gender) {
            console.log("inside gender and sfa");
            var pipeLine = IndividualSport.getAggregatePipeLine(data);
            var newPipeLine = _.cloneDeep(pipeLine);
            newPipeLine.push({
                $match: {
                    sfaId: data.sfaid,
                    gender: data.gender
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
        } else if (data.age && data.gender) {
            console.log("inside age and gender");
            var pipeLine = IndividualSport.getAggregatePipeLine(data);
            var newPipeLine = _.cloneDeep(pipeLine);
            newPipeLine.push({
                $match: {
                    age: data.age,
                    gender: data.gender
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
        } else if (data.gender) {
            console.log("inside gender");
            var pipeLine = IndividualSport.getAggregatePipeLine(data);
            var newPipeLine = _.cloneDeep(pipeLine);
            newPipeLine.push({
                $match: {
                    gender: data.gender,
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
        } else if (data.age) {
            console.log("inside age");
            var pipeLine = IndividualSport.getAggregatePipeLine(data);
            var newPipeLine = _.cloneDeep(pipeLine);
            newPipeLine.push({
                $match: {
                    age: data.age,
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
        } else if (data.sfaid) {
            console.log("inside sfa");
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

    getAthletePerSchool: function (data, callback) {
        async.waterfall([
                function (callback) {
                    if (data.age == "") {
                        callback(null, data);
                    } else {
                        var age = data.age;
                        var length = age.length;
                        age = age.slice(2, length);
                        data.age = parseInt(age);
                        console.log("age***", data.age);
                        callback(null, data);
                    }
                },
                function (data, callback) {
                    console.log("inside first");
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
                    // console.log("total", complete.total);
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
                                // console.log("data", results);
                                callback(null, results);
                            } else {
                                var athlete = {};
                                athlete = n;
                                athlete.isIndividualSelected = true;
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

    getAggregatePipeLineSport: function (data) {

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
                    "from": "sports",
                    "localField": "sport",
                    "foreignField": "_id",
                    "as": "sport"
                }
            },

            // Stage 4
            {
                $unwind: {
                    path: "$sport",

                }
            },

            // Stage 5
            {
                $lookup: {
                    "from": "sportslists",
                    "localField": "sport.sportslist",
                    "foreignField": "_id",
                    "as": "sport.sportslist"
                }
            },

            // Stage 6
            {
                $unwind: {
                    path: "$sport.sportslist",

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

            // Stage 9
            {
                $lookup: {
                    "from": "sportslistsubcategories",
                    "localField": "sportsListSubCategory",
                    "foreignField": "_id",
                    "as": "sportsListSubCategory"
                }
            },

            // Stage 10
            {
                $unwind: {
                    path: "$sportsListSubCategory",

                }
            },

            // Stage 11
            {
                $match: {
                    "createdAt": new Date(data.createdAt)
                }
            },


            // Stage 12
            {
                $group: {
                    _id: "$sport.sportslist.name",
                    info: {
                        $push: {
                            firstname: "$athleteId.firstName",
                            lastname: "$athleteId.surname",
                            middlename: "$athleteId.middleName",
                            sfaid: "$athleteId.sfaId",
                            email: "$athleteId.email",
                            age: "$athleteId.age",
                            gender: "$sport.gender",
                            eventName: "$sport.sportslist.name",
                            ageGroup: "$sport.ageGroup.name",
                            sportName: "$sportsListSubCategory.name"
                        }
                    }
                }
            },


        ];
        return pipeline;
    },

    saveInIndividual: function (data, callback) {
        var sportData = {};
        async.waterfall([
                function (callback) {
                    var atheleteName = [];
                    var results = [];
                    async.eachSeries(data.individual, function (n, callback) {
                        async.waterfall([
                                function (callback) {
                                    IndividualSport.saveData(n, function (err, saveData) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(saveData)) {
                                                callback(null, []);
                                            } else {
                                                sportData.createdAt = saveData.createdAt;
                                                callback(null, sportData);
                                            }
                                        }
                                    });
                                },
                                function (sportData, callback) {
                                    var pipeLine = IndividualSport.getAggregatePipeLineSport(sportData);
                                    IndividualSport.aggregate(pipeLine, function (err, totals) {
                                        if (err) {
                                            console.log(err);
                                            callback(err, "error in mongoose");
                                        } else {
                                            if (_.isEmpty(totals)) {
                                                callback(null, []);
                                            } else {
                                                _.each(totals, function (total) {
                                                    atheleteName.push(total);
                                                });
                                                callback(null, atheleteName);
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
                                        callback(null, atheleteName);
                                    }
                                }
                            });
                    }, function (err, data2) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            callback(null, atheleteName);
                        }
                    });

                },
                function (atheleteName, callback) {
                    IndividualSport.mailers(atheleteName, data, function (err, mailData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(mailData)) {
                                callback(null, []);
                            } else {
                                callback(null, mailData)
                            }
                        }
                    });
                }
            ],
            function (err, data3) {
                if (err) {
                    console.log(err);
                    callback(null, []);
                } else if (data3) {
                    if (_.isEmpty(data3)) {
                        callback(null, []);
                    } else {
                        callback(null, data3);
                    }
                }
            });
    },

    saveInIndividualAthlete: function (data, callback) {
        var sportData = {};

        async.waterfall([
                function (callback) {
                    Athelete.findOne({
                        accessToken: data.athleteToken
                    }).exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(found)) {
                            callback("Incorrect Login Details", null);
                        } else {
                            callback(null, found);
                        }
                    });

                },
                function (found, callback) {
                    if (found.atheleteSchoolName) {
                        data.school = found.atheleteSchoolName;
                        data.sfaid = found.sfaId;
                        data.email = found.email;
                        callback(null, data);

                    } else {
                        School.findOne({
                            _id: found.school
                        }).exec(function (err, schoolData) {
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(schoolData)) {
                                callback("Incorrect Login Details", null);
                            } else {
                                data.school = schoolData.name;
                                data.sfaid = found.sfaId;
                                data.email = found.email;
                                callback(null, data);
                            }
                        });
                    }
                },
                function (data, callback) {
                    var atheleteName = [];
                    var results = [];
                    async.eachSeries(data.individual, function (n, callback) {
                        async.waterfall([
                                function (callback) {
                                    IndividualSport.saveData(n, function (err, saveData) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(saveData)) {
                                                callback(null, []);
                                            } else {
                                                sportData.createdAt = saveData.createdAt;
                                                callback(null, sportData);
                                            }
                                        }
                                    });
                                },
                                function (sportData, callback) {
                                    console.log("saveData", sportData);
                                    var pipeLine = IndividualSport.getAggregatePipeLineSport(sportData);
                                    IndividualSport.aggregate(pipeLine, function (err, totals) {
                                        if (err) {
                                            console.log(err);
                                            callback(err, "error in mongoose");
                                        } else {
                                            if (_.isEmpty(totals)) {
                                                callback(null, []);
                                            } else {
                                                console.log("totals", totals);
                                                _.each(totals, function (total) {

                                                    atheleteName.push(total);
                                                });
                                                callback(null, atheleteName);
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
                                        callback(null, atheleteName);
                                    }
                                }
                            });
                    }, function (err, data2) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            callback(null, atheleteName);
                        }
                    });

                },
                function (atheleteName, callback) {
                    IndividualSport.mailersAthleteIndividual(atheleteName, data, function (err, mailData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(mailData)) {
                                callback(null, []);
                            } else {
                                callback(null, mailData)
                            }
                        }
                    });
                }
            ],
            function (err, data3) {
                if (err) {
                    console.log(err);
                    callback(null, []);
                } else if (data3) {
                    if (_.isEmpty(data3)) {
                        callback(null, []);
                    } else {
                        callback(null, data3);
                    }
                }
            });
    },

    mailers: function (atheleteName, data, callback) {
        async.parallel([
                //Athlete email
                function (callback) {
                    async.each(atheleteName, function (n, callback) {
                        var emailData = {};
                        emailData.schoolSFA = data.sfaid;
                        emailData.schoolName = data.school;
                        var sport = n.info[0].eventName + " " + n.info[0].gender + " " + n.info[0].ageGroup;
                        emailData.eventName = n.info[0].eventName;
                        emailData.gender = n.info[0].gender;
                        emailData.ageGroup = n.info[0].ageGroup;
                        emailData.sportName = n.info[0].sportName;
                        emailData.completeSport = sport;
                        emailData.atheleteSFA = n.info[0].sfaid;
                        if (n.info[0].middlename) {
                            var name = n.info[0].firstname + " " + n.info[0].middlename + " " + n.info[0].lastname;
                        } else {
                            var name = n.info[0].firstname + " " + n.info[0].lastname;
                        }
                        emailData.atheleteName = name;
                        emailData.from = "info@sfanow.in";
                        emailData.email = n.info[0].email;
                        emailData.filename = "athleteindividual.ejs";
                        emailData.subject = "SFA: Individual Sport Selection";
                        callback(null, emailData);
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
                    }, function (err, emailRespo) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, emailRespo);
                        }
                    });
                },
                //athlete email
                function (callback) {
                    var totalAthlete = atheleteName.length;
                    var results = _.groupBy(atheleteName, "_id");
                    var collectedSport = [];
                    _.each(results, function (mainData) {
                        var sportInfo = {};
                        sportInfo.eventName = mainData[0].info[0].eventName;
                        sportInfo.gender = mainData[0].info[0].gender;
                        sportInfo.ageGroup = mainData[0].info[0].ageGroup;
                        sportInfo.sportName = mainData[0].info[0].sportName;
                        var srno = 1;
                        sportInfo.athleteData = [];
                        _.each(mainData, function (data) {
                            // console.log("data", data);
                            var athelete = {};
                            athelete.srno = srno;
                            if (data.info[0].middlename) {
                                var name = data.info[0].firstname + " " + data.info[0].middlename + " " + data.info[0].lastname;
                            } else {
                                var name = data.info[0].firstname + " " + data.info[0].lastname;
                            }
                            athelete.name = name;
                            athelete.sfaid = data.info[0].sfaid;
                            sportInfo.athleteData.push(athelete);
                            srno++;
                        });
                        collectedSport.push(sportInfo);
                    });
                    console.log("sport Details for school", collectedSport);
                    var emailData = {};
                    emailData.schoolSFA = data.sfaid;
                    emailData.schoolName = data.school;
                    emailData.totalAthlete = totalAthlete;
                    emailData.completeSportInfo = collectedSport;
                    emailData.from = "info@sfanow.in";
                    emailData.email = data.email;
                    emailData.filename = "schoolindividual.ejs";
                    emailData.subject = "SFA: Individual Sport Selection List";
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
            ],
            function (err, data3) {
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
    mailersAthleteIndividual: function (atheleteName, data, callback) {
        async.each(atheleteName, function (n, callback) {
            var emailData = {};
            emailData.schoolSFA = data.sfaid;
            emailData.schoolName = data.school;
            var sport = n.info[0].eventName + " " + n.info[0].gender + " " + n.info[0].ageGroup;
            emailData.eventName = n.info[0].eventName;
            emailData.gender = n.info[0].gender;
            emailData.ageGroup = n.info[0].ageGroup;
            emailData.sportName = n.info[0].sportName;
            emailData.completeSport = sport;
            emailData.atheleteSFA = n.info[0].sfaid;
            if (n.info[0].middlename) {
                var name = n.info[0].firstname + " " + n.info[0].middlename + " " + n.info[0].lastname;
            } else {
                var name = n.info[0].firstname + " " + n.info[0].lastname;
            }
            emailData.atheleteName = name;
            emailData.from = "info@sfanow.in";
            emailData.email = n.info[0].email;
            emailData.filename = "athleteindividual.ejs";
            emailData.subject = "SFA: Individual Sport Selection";
            callback(null, emailData);
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
        }, function (err, emailRespo) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, emailRespo);
            }
        });

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

        var deepSearch = "athleteId sportsListSubCategory";
        var Search = Model.find(data.keyword)

            .order(options)
            .deepPopulate(deepSearch)
            .keyword(options)
            .page(options, callback);

    },

    getOne: function (data, callback) {
        var deepSearch = "athleteId sportsListSubCategory";
        IndividualSport.findOne({
            _id: data._id
        }).deepPopulate(deepSearch).exec(function (err, found) {
            if (_.isEmpty(found)) {
                callback(null, []);
            } else {
                callback(null, found);
            }
        });
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
                            callback("Incorrect Login Details", null);
                        } else {
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    if (found.atheleteSchoolName) {
                        callback(null, found);
                    } else {
                        School.findOne({
                            _id: found.school
                        }).exec(function (err, schoolData) {
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(schoolData)) {
                                callback("Incorrect Login Details", null);
                            } else {
                                found.school = schoolData;
                                callback(null, found);
                            }
                        });
                    }
                },
                function (found, callback) {
                    var results = {};
                    var finalData = [];
                    IndividualSport.find({
                        athleteId: found._id,
                        sportsListSubCategory: data._id
                    }).lean().exec(function (err, matchData) {
                        if (_.isEmpty(matchData)) {
                            var athlete = {};
                            callback(null, found);
                        } else {
                            var athlete = {};
                            athlete.msg = "Athlete Already Selected for this Sport";
                            finalData.push(athlete);
                            results.data = athlete;
                            results.total = 1;
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

    }
};
module.exports = _.assign(module.exports, exports, model);