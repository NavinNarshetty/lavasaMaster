var schema = new Schema({
    medalType: {
        type: String,
        enum: ['gold', 'silver', 'bronze']
    },
    sport: {
        type: Schema.Types.ObjectId,
        ref: 'Sport'
    },
    school: [{
        schoolId: {
            type: Schema.Types.ObjectId,
            ref: 'School'
        },
        schoolName: {
            type: String
        }
    }],
    team: [{
        type: Schema.Types.ObjectId,
        ref: 'TeamSport'
    }],
    player: [{
        type: Schema.Types.ObjectId,
        ref: 'Athelete'
    }]
});

schema.plugin(deepPopulate, {
    populate: {
        "sport": {
            select: '_id name gender ageGroup sportslist weight'
        },
        "school": {
            select: '_id name '
        },
        "team": {
            select: ''
        },
        "player": {
            select: ''
        },
    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Medal', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    search: function (data, callback) {
        var maxRow = Config.maxRow;
        var page = 1;
        if (data && data.page) {
            page = data.page;
        }
        var field = data.field;
        var options = {
            field: data.field,
            filters: {
                keyword: {
                    fields: ['medalType'],
                    term: data.keyword
                }
            },
            sort: {
                asc: 'createdAt'
            },
            start: (page - 1) * maxRow,
            count: maxRow
        };
        var deepSearch = "player team sport sport.sportslist sport.ageGroup sport.weight sport.sportslist.sportsListSubCategory";

        Medal.find(data.keyword)
            .sort({
                createdAt: -1
            })
            .order(options)
            .keyword(options)
            .deepPopulate(deepSearch)
            .page(options, function (err, found) {
                if (err) {
                    callback(err, null);
                } else if (_.isEmpty(found)) {
                    callback(null, "Data is empty");
                } else {
                    callback(null, found);
                }
            });
    },

    getOneMedal: function (matchObj, callback) {
        var obj = {};
        Medal.findOne(matchObj).deepPopulate("sport sport.sportslist sport.ageGroup sport.weight player team").lean().exec(function (err, data) {
            if (err) {
                callback(err, null);
            } else if (!_.isEmpty(data)) {
                data.gender = data.sport.gender;
                data.ageGroup = {
                    _id: data.sport.ageGroup._id,
                    name: data.sport.ageGroup.name
                };
                data.sportslist = {
                    _id: data.sport.sportslist._id,
                    name: data.sport.sportslist.name
                };
                if (data.sport.weight) {
                    data.weight = {
                        _id: data.sport.weight._id,
                        name: data.sport.weight.name
                    }
                }

                async.concatSeries(data.player, function (n, callback) {
                    n.athleteId = {
                        "_id": n._id,
                        "atheleteSchoolName": n.atheleteSchoolName,
                        "surname": n.surname,
                        "firstName": n.firstName,
                        "gender": n.gender,
                        "dob": n.dob,
                        "city": n.city,
                        "sfaId": n.sfaId,
                        "age": n.age,
                        "school": n.school,
                        "middleName": n.middleName
                    }
                    callback(null, n);
                }, function (err, result) {
                    data.player = result;
                    callback(null, data);
                });


            } else {
                callback(null, "No Data Found");
            }


        });

    },

    saveMedal: function (data, callback) {
        console.log("1st Func");
        var matchObj = {
            "sportslist": data.sportslist,
            "gender": data.gender,
            "ageGroup": data.ageGroup
        };
        console.log(matchObj);
        if (data.weight && !_.isEmpty(data.weight)) {
            matchObj.weight = data.weight;
        }
        Sport.findOne(matchObj).exec(function (err, sport) {
            if (err) {
                console.log("1st if");
                callback(err, null);
            } else if (!_.isEmpty(sport)) {
                console.log("2nd if");
                data.sport = sport._id;
                Medal.saveData(data, function (err, medalData) {
                    if (err) {
                        console.log("err", err);
                        callback("There was an error while saving", null);
                    } else {
                        if (_.isEmpty(medalData)) {
                            callback("No order data found", null);
                        } else {
                            callback(null, medalData);
                        }
                    }
                });
            } else {
                console.log("else");
                callback("No Data Found", null);
            }
        });
    },

    getTeamsAthletesBySport: function (matchSportObj, medalId, medalType, finalCallback) {
        var sendObj = {};
        async.waterfall([
            //find sportId
            function (callback) {
                Sport.findOne(matchSportObj, function (err, sport) {
                    console.log("sport", sport);
                    if (err) {
                        callback(err, null);
                    } else if (!_.isEmpty(sport)) {
                        var sportObj = {};
                        var medalObj = {};
                        if (medalType) {
                            medalObj.medalType = medalType;
                        }
                        medalObj.sport = sendObj.sport = sportObj.sport = sport._id;
                        Medal.findOne(medalObj).lean().exec(function (err, medal) {
                            console.log("medal", medal);
                            if (err) {
                                callback(err, null);
                            } else if (!_.isEmpty(medal)) {
                                if (medalId) {
                                    if (medal._id == medalId) {
                                        sendObj.allow = true;
                                        callback(null, sportObj);
                                    } else {
                                        sendObj.allow = false;
                                        callback(sendObj, null);
                                    }
                                } else {
                                    sendObj.allow = false;
                                    callback(sendObj, null);
                                }
                            } else {
                                console.log("Medal Not Found", sportObj);
                                sendObj.allow = true;
                                callback(null, sportObj);
                            }
                        });
                    } else {
                        callback("No Data Found", null)
                    }
                });

            },
            //find teams registered with that sportId
            function (sport, callback) {
                console.log("sport", sport);
                TeamSport.find(sport, function (err, teams) {
                    if (err) {
                        callback(err, null);
                    } else if (!_.isEmpty(sport)) {
                        console.log("teams", teams);
                        sendObj.teams = teams;
                        callback(null, sport);
                    } else {
                        sendObj.teams = [];
                        callback(null, sport);
                    }
                });
            },
            //find athletes with that sportId
            function (sport, callback) {
                IndividualSport.find(sport).deepPopulate("athleteId").exec(function (err, athletes) {
                    if (err) {
                        callback(err, null);
                    } else if (!_.isEmpty(sport)) {
                        console.log("players", athletes);
                        sendObj.athletes = athletes;
                        callback(null, sendObj);
                    } else {
                        sendObj.athletes = [];
                        callback(null, sendObj);
                    }

                });
            }
        ], function (err, result) {
            console.log("result", result);
            if (err) {
                finalCallback(null, err);
            } else {
                finalCallback(null, result);
            }
        });

    },

    getCertificate: function (athlete, finalCallback) {
        var regSports = [];
        var pdfObj = {};
        pdfObj.filename = "certificate";
        async.waterfall([

            //getAthlete Details
            function (callback) {
                Athelete.findOne(athlete).deepPopulate("school").lean().exec(function (err, data) {
                    var athleteDetails = {};
                    if (err) {
                        finalCallback(err, null);
                    } else if (!_.isEmpty(data)) {
                        console.log("data", data);
                        athleteDetails = data;
                        pdfObj.athlete = _.cloneDeep(data);
                        callback(null, athleteDetails);
                    } else {
                        finalCallback("Athlete Not Found", null)
                    }
                });
            },

            //find team sports,player participated in and whether he won any of the 3 medals
            function (athleteDetails, callback) {
                var matchObj = {
                    "studentId": athlete._id
                };
                StudentTeam.find(matchObj).exec(function (err, regTeamSport) {
                    regTeamSport = _.uniq(_.map(regTeamSport, function (n) {
                        return {
                            "sport": n.sport,
                            "teamId": n.teamId
                        }
                    }));
                    callback(null, regTeamSport, athleteDetails);
                    // finalCallback(null, regTeamSport);

                });
            },

            // //find individual sports,player participated in and whether he won any of the 3 medals
            function (regTeamSport, athleteDetails, callback) {
                var matchObj = {
                    "athleteId": athlete._id
                };
                IndividualSport.find(matchObj).exec(function (err, regIndiSport) {
                    regIndiSport = _.uniq(_.flatten(_.map(regIndiSport, function (n1) {
                        return _.map(n1.sport, function (n2) {
                            return {
                                "sport": n2
                            }
                        })
                    })));
                    regSports = _.union(regTeamSport, regIndiSport);
                    athleteDetails.regSports = regSports;
                    callback(null, athleteDetails);
                    // finalCallback(null, regSport);
                });
            },

            //find medals for all sport and generate pdf for each
            function (athleteDetails, callback) {

                async.waterfall([
                    function (callback) {
                        ConfigProperty.find().lean().exec(function (err, property) {
                            if (err) {
                                callback(err, null);
                            } else if (!_.isEmpty(property)) {
                                pdfObj.sfaCity = property[0].sfaCity;
                                pdfObj.institutionType = property[0].institutionType;
                                pdfObj.year = property[0].year;
                                callback(null, property);
                            } else {
                                callback(null, property);
                            }
                        });
                    },

                    //get banner image for pdf
                    function (property, callback) {
                        CertificateBanner.find().lean().exec(function (err, banners) {
                            if (err) {
                                callback(err, null);
                            } else if (!_.isEmpty(banners)) {
                                var banner = _.filter(banners, ['city', property[0].sfaCity]);
                                pdfObj.bannerImage = "http://localhost:1337/api/upload/readFile?file=" + banner[0].banner;
                                callback(null, property);
                            } else {
                                callback("Banner Not Found", null);
                            }
                        });
                    },

                    function (property, callback) {
                        async.concatLimit(athleteDetails.regSports, 10, function (regSport, seriesCallback) {

                            async.waterfall([

                                //getSport Details for every regSport
                                function (callback) {
                                    var matchObj = {
                                        "_id": regSport.sport
                                    };
                                    Sport.findOne(matchObj).deepPopulate("sportslist sportslist.sportsListSubCategory ageGroup weight").lean().exec(function (err, sport) {
                                        if (err) {
                                            seriesCallback(err, null);
                                        } else if (!_.isEmpty(sport)) {
                                            callback(null, sport);
                                        } else {
                                            callback(null, {
                                                'notFound': regSport.sport
                                            });
                                        }
                                    });
                                },

                                //get footer image
                                function (sport, callback) {
                                    console.log(sport);
                                    if (!sport.notFound) {
                                        var certificateDetailsObj = {
                                            "city": property[0].sfaCity,
                                            "institutionType": property[0].institutionType,
                                            "sportsListSubCategory": sport.sportslist.sportsListSubCategory._id
                                        }
                                        CertificateDetails.find(certificateDetailsObj).lean().exec(function (err, detail) {
                                            console.log("--------------", certificateDetailsObj, detail);
                                            if (err) {
                                                callback(err, null);
                                            } else if (!_.isEmpty(detail)) {
                                                sport.footerImage = "http://localhost:1337/api/upload/readFile?file=" + detail[0].banner;
                                                callback(null, sport);
                                            } else {
                                                callback(null, sport);
                                            }
                                        });
                                    } else {
                                        callback(null, sport);
                                    }

                                },

                                // find medals
                                function (sport, callback) {
                                    var medalObj = {
                                        "sport": sport._id
                                    };
                                    if (regSport.teamId) {
                                        medalObj.team = sport.teamId = regSport.teamId;
                                    } else {
                                        medalObj.player = athleteDetails._id;
                                    }
                                    //find medal for this sport
                                    Medal.findOne(medalObj).lean().exec(function (err, medal) {
                                        // console.log("medal", medal);
                                        if (err) {
                                            seriesCallback(err, null);
                                        } else if (!_.isEmpty(medal)) {
                                            sport.medalType = medal.medalType;
                                        } else {
                                            sport.medalType = "participant";
                                        }
                                        callback(null, sport);
                                    });
                                },

                                //make pdfObj which will get used in certificate.ejs
                                function (sport, callback) {
                                    console.log("sport", sport);
                                    pdfObj.sportObj = sport;
                                    var basePath = "https://storage.googleapis.com/sfacertificate/"
                                    if (pdfObj.sportObj.medalType == 'gold') {
                                        pdfObj.sportObj.heading = basePath + "Gold.png";
                                    } else if (pdfObj.sportObj.medalType == 'silver') {
                                        pdfObj.sportObj.heading = basePath + "Silver.png";
                                    } else if (pdfObj.sportObj.medalType == 'bronze') {
                                        pdfObj.sportObj.heading = basePath + "Bronze.png";
                                    } else {
                                        pdfObj.sportObj.heading = basePath + "Participation.png";
                                    }
                                    // finalCallback(null, pdfObj);
                                    callback(null, pdfObj, sport);
                                },

                                //generatePdf
                                function (pdfObj, sport, callback) {
                                    if (!pdfObj.sportObj.notFound) {
                                        Config.generatePdf(pdfObj, function (err, pdfRespo) {
                                            if (err) {
                                                callback(null, err);
                                            } else if (pdfRespo) {
                                                sport.pdfname = pdfRespo;
                                                callback(null, sport);
                                            } else {
                                                callback(null, "Invalid data");
                                            }
                                        });
                                    } else {
                                        callback(null, sport);
                                    }
                                },

                                function (sportObj, callback) {
                                    seriesCallback(null, sportObj);
                                    // callback(null, sportObj);
                                }
                            ], function (err, result) {
                                callback(null, result);
                            });

                        }, function (err, result) {
                            athleteDetails.regSports = result;
                            callback(null, athleteDetails);
                        });
                    }
                ], function (err, result) {
                    callback(null, result);
                });

            }

        ], function (err, result) {
            finalCallback(null, result)
        })
    },







};
module.exports = _.assign(module.exports, exports, model);