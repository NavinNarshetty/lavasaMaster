var schema = new Schema({
    type: {
        type: String,
        enum: ['athlete', 'school', 'college']
    },
    gender: {
        type: "String",
        enum: ['male', 'female']
    },
    award: {
        type: Schema.Types.ObjectId,
        ref: "Awards"
    },
    athlete: {
        type: Schema.Types.ObjectId,
        ref: "Athelete"
    },
    school: {
        type: Schema.Types.ObjectId,
        ref: "Registration"
    },
    sports: [{
        type: Schema.Types.ObjectId,
        ref: "SportsListSubCategory"
    }],
    coachName: "String",
    boostDetail: [{
        schoolRank: "Number",
        total: "Number",
        year: "String"
    }],
    risingSport: "String",
    footerImage: "String"
});

schema.plugin(deepPopulate, {
    populate: {
        "athlete": {
            select: '_id firstName surname middleName gender dob sfaId school'
        },
        "athlete.school": {
            select: '_id name sfaid'
        },
        "school": {
            select: '_id schoolName sfaID'
        }

    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('SpecialAwardDetails', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    saveRising: function (data, callback) {
        var matchObj = {
            "type": data.type,
            "award": data.award,
            "gender": data.gender,
            "sports": data.sports
        }
        SpecialAwardDetails.find(matchObj).exec(function (err, data) {
            console.log("found------------------", data);
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(data)) {
                callback(null, true);
            } else {
                callback(null, false);
            }
        });
    },

    getAwardsList: function (data, awardListObj, awardDetailObj, callback) {
        if (data.rising) {
            Awards.find({
                "awardType": "rising"
            }).lean().exec(function (err, award) {
                callback(null, award);
            });
        } else {
            async.waterfall([

                //getAll Athlete Awards
                function (callback) {
                    Awards.find(awardListObj).lean().exec(function (err, awardsList) {
                        _.remove(awardsList, {
                            "awardType": "rising"
                        });
                        console.log("awardsList----", awardsList);
                        callback(null, awardsList);
                    });
                },

                //filter all awards if its already added
                function (awardsList, callback) {
                    var sendList = [];
                    async.each(awardsList, function (award, callback) {
                        console.log(award._id);
                        awardDetailObj.award = award._id;
                        SpecialAwardDetails.find(awardDetailObj).lean().exec(function (err, found) {
                            if (err) {
                                callback(err);
                            } else if (_.isEmpty(found)) {
                                sendList.push(award);
                                callback(null);
                            } else {
                                if (award.awardType == "champion") {
                                    SpecialAwardDetails.count({
                                        "award": award._id
                                    }).exec(function (err, count) {
                                        if (count < 10) {
                                            sendList.push(award);
                                        }
                                        callback(null);
                                    });
                                } else {
                                    callback(null);
                                }
                            }
                        });
                    }, function (err) {
                        console.log("final called");
                        if (err) {
                            console.log(err);
                        } else {
                            callback(null, sendList);
                        }
                    });
                },

            ], function (err, result) {
                callback(null, result);
            });
        }

    },

    getPipeline: function () {
        return [
            // Stage 1
            {
                $lookup: {
                    "from": "awards",
                    "localField": "award",
                    "foreignField": "_id",
                    "as": "award"
                }
            },

            // Stage 2
            {
                $unwind: {
                    path: "$award",
                    includeArrayIndex: "arrayIndex", // optional
                    preserveNullAndEmptyArrays: false // optional
                }
            },

            // Stage 3
            {
                $lookup: {
                    "from": "atheletes",
                    "localField": "athlete",
                    "foreignField": "_id",
                    "as": "athlete"
                }
            },

            // Stage 4
            {
                $unwind: {
                    path: "$athlete",
                    includeArrayIndex: "arrayIndex", // optional
                    preserveNullAndEmptyArrays: true // optional
                }
            },

            // Stage 5
            {
                $lookup: {
                    "from": "registrations",
                    "localField": "school",
                    "foreignField": "_id",
                    "as": "school"
                }
            },

            // Stage 6
            {
                $unwind: {
                    path: "$school",
                    includeArrayIndex: "arrayIndex", // optional
                    preserveNullAndEmptyArrays: true // optional
                }
            }



        ];
    },

    getAllAwardDetails: function (data, callback) {
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
                    fields: ['firstName', 'sfaId', 'surname'],
                    term: data.keyword
                }
            },
            sort: {
                asc: 'createdAt'
            },
            start: (page - 1) * maxRow,
            count: maxRow
        };
        var pipeline = model.getPipeline();
        var countPipeline;
        if (data.rising) {
            pipeline.push({
                $match: {
                    "award.awardType": "rising"
                }
            }, {
                $lookup: {
                    "from": "sportslistsubcategories",
                    "localField": "sports",
                    "foreignField": "_id",
                    "as": "sports"
                }
            }, {
                $unwind: {
                    path: "$sports",
                    includeArrayIndex: "arrayIndex", // optional
                    preserveNullAndEmptyArrays: true // optional
                }
            });
        } else {
            pipeline.push({
                $match: {
                    "award.awardType": {
                        $ne: "rising"
                    }
                }
            });
        }

        countPipeline = _.cloneDeep(pipeline);
        countPipeline.push({
            $count: "totalCount"
        });

        pipeline.push({
            $skip: options.start
        }, {
            $limit: options.count
        });

        SpecialAwardDetails.aggregate(pipeline, function (err, arr) {
            if (err) {
                callback(err, null);
            } else {
                var data = {};
                if (_.isEmpty(arr)) {
                    data.options = options;
                    data.results = arr;
                    data.total = 0;
                    callback(null, data);
                } else {
                    data.options = options;
                    data.results = arr;
                    SpecialAwardDetails.aggregate(countPipeline, function (err, count) {
                        console.log("totalCount", count);
                        data.total = count[0].totalCount;
                        callback(null, data);
                    });
                }
            }
        });
    },

    getOneAwardDetails: function (data, callback) {
        SpecialAwardDetails.find(data).deepPopulate("award athlete athlete.school school sports").lean().exec(function (err, result) {
            callback(null, result);
        });
    },

    getSportsSubCategory: function (data, callback) {

        async.concatSeries(data.regSports, function (sport, callback) {
            Sport.findOne({
                "_id": sport.sport
            }).deepPopulate("sportslist sportslist.sportsListSubCategory").lean().exec(function (err, found) {
                if (err) {
                    callback(err, null);
                } else if (!_.isEmpty(found)) {
                    found.sportslist.sportsListSubCategory._id = found.sportslist.sportsListSubCategory._id.toString();
                    callback(null, found.sportslist.sportsListSubCategory);

                } else {
                    //null if sportId is incorrect
                    callback(null);
                }

            });
        }, function (err, result) {
            console.log("result", result);
            callback(null, _.uniqBy(result, '_id'));
        });
    },

    getAwardsCertificate: function (data, callback) {
        var pdfObj = {};
        var pdfArray = [];
        // var Result=require("Result");
        async.waterfall([

            //get Awards
            function (callback) {
                SpecialAwardDetails.find(data).deepPopulate("athlete athlete.school school sports award").lean().exec(function (err, SpecialAwards) {
                    if (err) {
                        callback(err, null);
                    } else if (!_.isEmpty(SpecialAwards)) {
                        callback(null, SpecialAwards);
                    } else {
                        callback("Sorry No Awards", null);
                    }
                })
            },

            // get city information from config
            function (SpecialAwards, callback) {
                ConfigProperty.find().lean().exec(function (err, property) {
                    if (err) {
                        callback(err, null);
                    } else if (!_.isEmpty(property)) {
                        pdfObj.sfaCity = property[0].sfaCity;
                        pdfObj.institutionType = property[0].institutionType;
                        pdfObj.year = property[0].year;
                        pdfObj.totalSport = property[0].totalSport;
                        callback(null, SpecialAwards);
                    } else {
                        callback("Config Not Found", null);
                    }
                });
            },

            //get banner Image
            function (SpecialAwards, callback) {
                SpecialAwardBanner.findOne({
                    "city": pdfObj.sfaCity
                }).lean().exec(function (err, banner) {
                    if (err) {
                        callback(err, null);
                    } else if (!_.isEmpty(banner)) {
                        pdfObj.bannerImage = env.realHost + "/api/upload/readFile?file=" + banner.banner;
                        callback(null, SpecialAwards);
                    } else {
                        callback("Banner Image Not Found", null);
                    }
                });
            },

        ], function (err, SpecialAwards) {
            if (err) {
                callback(err, null);
            } else {
                console.log("SpecialAwards", SpecialAwards.length);
                var i = 0;
                async.concatSeries(SpecialAwards, function (award, callback) {
                    console.log("awardType", award.award.awardType, i++);
                    //make pdfObj as per Specific Award
                    async.waterfall([

                        function (callback) {
                            var basePath = "https://storage.googleapis.com/sfacertificate/";
                            pdfObj.athlete = award.athlete;
                            if (award.athlete) {
                                pdfObj.newFilename = _.join(_.split(award.award.name,  ' '), '_') + '_' + award.athlete.sfaId + ".pdf";
                            } else if (award.school) {
                                pdfObj.newFilename = _.join(_.split(award.award.name,  ' '), '_') + '_' + award.school.schoolName + '_' + award._id + ".pdf";
                            }
                            pdfObj.footerImage = env.realHost + "/api/upload/readFile?file=" + award.footerImage;
                            pdfObj.sports = award.sports;
                            pdfObj.award = award.award;
                            pdfObj.type = award.type;
                            pdfObj.school = award.school;

                            if (pdfObj.type == 'athlete') {
                                if (pdfObj.athlete.middleName) {
                                    pdfObj.athlete.fullName = pdfObj.athlete.firstName + " " + pdfObj.athlete.middleName + " " + pdfObj.athlete.surname;
                                } else {
                                    pdfObj.athlete.fullName = pdfObj.athlete.firstName + " " + pdfObj.athlete.surname;
                                }
                            }

                            switch (award.award.awardType) {
                                case "max":
                                    pdfObj.filename = "e-special-awards/sportMaxAwardAthlete";
                                    pdfObj.totalSportsReg = award.sports.length;
                                    pdfObj.heading = basePath + "max.png"; //url to get Heading of Certificate
                                    break;
                                case "strong":
                                    pdfObj.filename = "e-special-awards/schoolStrongAward";
                                    pdfObj.heading = basePath + "strong.png";
                                    break;
                                case "boost":
                                    pdfObj.filename = "e-special-awards/schoolBoostAward";
                                    pdfObj.heading = basePath + "boost.png";
                                    pdfObj.boostDetail = award.boostDetail;
                                    break;
                                case "coach":
                                    pdfObj.filename = "e-special-awards/schoolMasterCoachAward";
                                    pdfObj.heading = basePath + "coach.png";
                                    pdfObj.coachName = award.coachName;
                                    break;
                                case "rising":
                                    pdfObj.filename = "e-special-awards/risingStar";
                                    pdfObj.newFilename = award.award.name + "_" + award.sports[0].name + ".pdf";
                                    pdfObj.heading = basePath + "rising.png";
                                    break;
                                case "champion":
                                    pdfObj.filename = "e-special-awards/championsAward";
                                    pdfObj.heading = basePath + "champion.png";
                                    break;
                            }

                            callback(null, pdfObj, award.award.awardType);
                        },

                        function (pdfObj, awardType, callback) {
                            function calculateSchoolAthelete() {
                                var matchObj = {
                                    $or: [{
                                        "school.name": pdfObj.school.schoolName
                                    }, {
                                        "atheleteSchoolName": pdfObj.school.schoolName
                                    }]
                                };

                                Athelete.aggregate([
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
                                            includeArrayIndex: "arrayIndex", // optional
                                            preserveNullAndEmptyArrays: true // optional
                                        }
                                    },

                                    // Stage 3
                                    {
                                        $match: {
                                            $or: [{
                                                "school.name": pdfObj.school.schoolName
                                            }, {
                                                "atheleteSchoolName": pdfObj.school.schoolName
                                            }]
                                        }

                                    },
                                    {
                                        $group: {
                                            "_id": "$gender",
                                            "count": {
                                                $sum: 1
                                            }
                                        }
                                    }


                                ], function (err, allAthletes) {
                                    console.log(err, allAthletes);
                                    if (err) {
                                        callback(err, null);
                                    } else if (!_.isEmpty(allAthletes)) {
                                        console.log(allAthletes);
                                        pdfObj.maleAthCount = (_.find(allAthletes, ['_id', "male"])).count;
                                        pdfObj.femaleAthCount = (_.find(allAthletes, ['_id', "female"])).count;
                                        pdfObj.totalAthCount = pdfObj.maleAthCount + pdfObj.femaleAthCount;
                                        pdfObj.generate = true;
                                        callback(null, pdfObj);
                                    } else {
                                        pdfObj.generate = false;
                                        callback(null, pdfObj);
                                    }
                                });
                            }

                            function calculateMedalsWon() {
                                Medal.find({
                                    "school.schoolName": pdfObj.school.schoolName
                                }).deepPopulate("team").lean().exec(function (err, medals) {

                                    if (err) {
                                        callback(err, null);
                                    } else if (!_.isEmpty(medals)) {
                                        async.concatSeries(medals, function (medal, callback) {
                                            var indexArr = [];
                                            _.forEach(medal.school, function (n, ind) {
                                                if (n.schoolName == pdfObj.school.schoolName) {
                                                    indexArr.push(ind);
                                                }
                                            });
                                            medal.indexArr = indexArr;
                                            medal.school = _.pullAt(medal.school, indexArr);

                                            if (!_.isEmpty(medal.team)) {
                                                medal.player = [];
                                                medal.team = _.pullAt(medal.team, indexArr);
                                                callback(null, medal);
                                            } else {
                                                medal.player = _.pullAt(medal.player, indexArr);
                                                callback(null, medal);
                                            }
                                        }, function (err, result) {
                                            result = _.groupBy(result, 'medalType');
                                            fcallback(null, result);
                                        });
                                    } else {
                                        callback(null, []);
                                    }
                                })
                            }
                            // console.log("awardType",awardType);
                            switch (awardType) {
                                case "strong":
                                    calculateSchoolAthelete();
                                    break;
                                case "champion":
                                    Result.getMedalsSchool(" ", function (err, data) {
                                        console.log("getMedalsSchool data", data);
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            data = _.find(data.medalRank, ['name', pdfObj.school.schoolName]);
                                            console.log("data", data);
                                            if (!_.isEmpty(data)) {
                                                pdfObj.totalCount = data.totalCount;
                                                var gold = _.find(data.medal, ['name', 'gold']);
                                                if (gold) {
                                                    pdfObj.goldCount = gold.count;
                                                } else {
                                                    pdfObj.goldCount = 0;
                                                }
                                                var silver = _.find(data.medal, ['name', 'silver']);
                                                if (silver) {
                                                    pdfObj.silverCount = silver.count;
                                                } else {
                                                    pdfObj.silverCount = 0;
                                                }
                                                var bronze = _.find(data.medal, ['name', 'bronze']);
                                                console.log("bronze", bronze);
                                                if (bronze) {
                                                    pdfObj.bronzeCount = bronze.count;
                                                } else {
                                                    pdfObj.bronzeCount = 0;
                                                }
                                                pdfObj.generate = true;
                                                callback(null, pdfObj);
                                            } else {
                                                pdfObj.generate = false;
                                                callback(null, pdfObj);
                                            }
                                        }
                                    });
                                    break;
                                default:
                                    pdfObj.generate = true;
                                    callback(null, pdfObj);
                            }
                        }

                    ], function (err, result) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (result.generate) {
                                Config.generatePdf(result, function (err, pdfRespo) {
                                    if (err) {
                                        callback(null, err);
                                    } else if (pdfRespo) {
                                        // result.pdfname = pdfRespo;
                                        pdfArray.push(pdfRespo);
                                        callback(null, pdfRespo);
                                    } else {
                                        callback(null, "Some Error Occured in Config Property");
                                    }
                                });
                            } else {
                                callback(null, "Some Error Occured while generating " + result.award.name);
                            }


                        }
                    });

                }, function (err, result) {
                    callback(null, result);
                });
            }
        });

    },

    getAllAthleteByGender: function (data, callback) {
        if (_.isEmpty(data.input)) {
            var matchObj = {
                gender: data.gender
            };
        } else {
            var matchObj = {
                gender: data.gender,
                $or: [{
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
                    fields: ['firstName', 'sfaId', 'surname', 'middleName'],
                    term: data.keyword
                }
            },
            sort: {
                desc: 'createdAt'
            },
            start: (page - 1) * maxRow,
            count: maxRow
        };
        Athelete.find(matchObj)
            .sort({
                createdAt: -1
            })
            .order(options)
            .keyword(options)
            .deepPopulate("school")
            .page(options, function (err, found) {
                if (err) {
                    callback(err, null);
                } else if (_.isEmpty(found)) {
                    callback(null, "Data is empty");
                } else {
                    console.log("found", found);
                    callback(null, found);
                }
            });
    },

};
module.exports = _.assign(module.exports, exports, model);