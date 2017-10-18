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
            var data = {};
            data.options = options;
            data.results = arr;
            SpecialAwardDetails.aggregate(countPipeline, function (err, count) {
                console.log("totalCount",count);
                data.total = count[0].totalCount;
                callback(null, data);
            });

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
                    console.log("property", property);
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
                async.concatSeries(SpecialAwards, function (award, callback) {
                    console.log("----------------", award);

                    //make pdfObj as per Specific Award
                    var basePath = "https://storage.googleapis.com/sfacertificate/";
                    pdfObj.athlete = award.athlete;
                    pdfObj.newFilename = _.join(_.split(award.award.name,  ' '), '_') + ".pdf";
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
                            pdfObj.filename = "sportMaxAwardAthlete";
                            pdfObj.totalSportsReg = award.sports.length;
                            pdfObj.heading = basePath + "max.png";
                            break;
                        case "strong":
                            pdfObj.filename = "schoolStrongAward";
                            pdfObj.heading = basePath + "strong.png";
                            break;
                        case "boost":
                            pdfObj.filename = "schoolBoostAward";
                            pdfObj.heading = basePath + "boost.png";
                            break;
                        case "coach":
                            pdfObj.filename = "schoolMasterCoachAward";
                            pdfObj.heading = basePath + "coach.png";
                            pdfObj.coachName = award.coachName;
                            break;
                        case "rising":
                            pdfObj.filename = "risingStar";
                            pdfObj.newFilename = award.award.name + "_" + award.sports[0].name + ".pdf";
                            pdfObj.heading = basePath + "rising.png";
                            break;
                        case "champion":
                            pdfObj.filename = "championsAward";
                            pdfObj.heading = basePath + "champion.png";
                            break;
                    }

                    Config.generatePdf(pdfObj, function (err, pdfRespo) {
                        if (err) {
                            callback(null, err);
                        } else if (pdfRespo) {
                            pdfObj.pdfname = pdfRespo;
                            callback(null, pdfObj);
                        } else {
                            callback(null, "Invalid data");
                        }
                    });



                }, function (err, result) {
                    callback(null, result);
                });
            }
        });

    }

};
module.exports = _.assign(module.exports, exports, model);