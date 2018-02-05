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
        "sport.sportslist": {
            select: '_id name sportsListSubCategory'
        },
        "sport.sportslist.sportsListSubCategory": {
            select: '_id name isTeam'
        },
        "sport.ageGroup": {
            select: '_id name '
        },
        "school": {
            select: '_id name '
        },
        "team": {
            select: ''
        },
        "team.studentTeam": {
            select: '_id studentId teamId'
        },
        "team.studentTeam.studentId": {
            select: 'sfaId firstName surname middleName'
        },
        "player": {
            select: ''
        },
        "player.school": {
            select: 'id name'
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


        if (data.type == "Sport") {
            Medal.aggregate(
                [{
                        $lookup: {
                            "from": "sports",
                            "localField": "sport",
                            "foreignField": "_id",
                            "as": "sport"
                        }
                    },
                    {
                        $unwind: {
                            path: "$sport",
                        }
                    },
                    {
                        $lookup: {
                            "from": "sportslists",
                            "localField": "sport.sportslist",
                            "foreignField": "_id",
                            "as": "sport.sportslist"
                        }
                    },
                    {
                        $unwind: {
                            path: "$sport.sportslist",
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
                    {
                        $unwind: {
                            path: "$sport.ageGroup",
                        }
                    },
                    {
                        $lookup: {
                            "from": "weights",
                            "localField": "sport.weight",
                            "foreignField": "_id",
                            "as": "sport.weight"
                        }
                    },
                    {
                        $unwind: {
                            path: "$sport.weight",
                            preserveNullAndEmptyArrays: true // optional
                        }
                    },
                    {
                        $lookup: {
                            "from": "sportslistsubcategories",
                            "localField": "sport.sportslist.sportsListSubCategory",
                            "foreignField": "_id",
                            "as": "sport.sportslist.sportsListSubCategory"
                        }
                    },
                    {
                        $unwind: {
                            path: "$sport.sportslist.sportsListSubCategory",
                        }
                    },
                    {
                        $lookup: {
                            "from": "atheletes",
                            "localField": "player",
                            "foreignField": "_id",
                            "as": "player"
                        }
                    },
                    {
                        $lookup: {
                            "from": "teamsports",
                            "localField": "team",
                            "foreignField": "_id",
                            "as": "team"
                        }
                    },
                    {
                        $match: {

                            $or: [{
                                    "sport.sportslist.name": {
                                        $regex: data.input,
                                        $options: 'i'
                                    }
                                },
                                {
                                    "sport.sportslist.sportsListSubCategory.name": {
                                        $regex: data.input,
                                        $options: "i"
                                    }
                                },
                                {
                                    "sport.ageGroup.name": {
                                        $regex: data.input,
                                        $options: "i"
                                    }
                                },
                                {
                                    "sport.gender": {
                                        $regex: data.input,
                                        $options: "i"
                                    }
                                },
                                {
                                    "sport.weight.name": {
                                        $regex: data.input,
                                        $options: "i"
                                    }
                                }
                            ]

                        }
                    },
                    {
                        $sort: {
                            "createdAt": -1
                        }
                    }
                ],
                function (err, returnReq) {
                    console.log("returnReq : ", returnReq);
                    if (err) {
                        console.log(err);
                        callback(null, err);
                    } else {
                        if (_.isEmpty(returnReq)) {
                            var count = returnReq.length;
                            console.log("count", count);

                            var data = {};
                            data.options = options;
                            data.results = returnReq;
                            data.total = count;
                            callback(null, data);
                        } else {
                            var count = returnReq.length;
                            console.log("count", count);

                            var data = {};
                            data.options = options;
                            data.results = returnReq;
                            data.total = count;
                            callback(null, data);

                        }
                    }
                });
        } else {
            var deepSearch = "player team sport sport.sportslist sport.ageGroup sport.weight sport.sportslist.sportsListSubCategory";

            Medal.find()
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
        }
    },

    getOneMedal: function (matchObj, callback) {
        var obj = {};
        Medal.findOne(matchObj).deepPopulate("sport sport.sportslist sport.ageGroup sport.weight player team team.studentTeam team.studentTeam.studentId").lean().exec(function (err, data) {
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
                TeamSport.find(sport).deepPopulate("studentTeam studentTeam.studentId").exec(function (err, teams) {
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
                        if(data.atheleteSchoolName){
                            data.schoolName = data.atheleteSchoolName;
                        }else{
                            data.schoolName = data.school.name;
                        }
                        pdfObj.athlete = _.cloneDeep(data);
                        if (pdfObj.athlete.middleName) {
                            pdfObj.athleteName = pdfObj.athlete.firstName + ' ' + pdfObj.athlete.middleName + ' ' + pdfObj.athlete.surname;
                        } else {
                            pdfObj.athleteName = pdfObj.athlete.firstName + ' ' + pdfObj.athlete.surname;
                        }
                        pdfObj.athleteName=_.startCase(_.toLower(pdfObj.athleteName));
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
                            "sport": _.toString(n.sport),
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
                                "sport": _.toString(n2),
                            }
                        })
                    })));
                    regSports = _.union(regTeamSport, regIndiSport);
                    regSports = _.uniqBy(regSports,'sport');
                    athleteDetails.regSports = regSports;
                    callback(null, athleteDetails);
                    // finalCallback(null, regSport);
                });
            },

            //find medals for all sport and generate pdf for each
            function (athleteDetails, callback) {

                async.waterfall([
                    // get city information from config
                    function (callback) {
                        ConfigProperty.find().lean().exec(function (err, property) {
                            if (err) {
                                callback(err, null);
                            } else if (!_.isEmpty(property)) {
                                pdfObj.sfaCity = property[0].sfaCity;
                                pdfObj.institutionType = property[0].institutionType;
                                pdfObj.year = property[0].year;
                                if (_.isEmpty(property[0].reqUrl)) {
                                    pdfObj.tang = 'http://localhost:8080/js/certificateFonts/Tangerine-Regular.ttf';
                                    pdfObj.fjalla = 'http://localhost:8080/js/certificateFonts/FjallaOne-Regular.ttf';
                                    pdfObj.opens = 'http://localhost:8080/js/certificateFonts/OpenSans-CondLight.ttf';
                                } else if (property[0].reqUrl == 'test') {
                                    pdfObj.baseUrl = 'http://testhyderabadschool.sfanow.in/js/certificateFonts/'
                                    if (property[0].sfaCity == 'Mumbai') {
                                        if (property[0].institutionType == 'school') {
                                            pdfObj.tang = 'http://testmumbaischool.sfanow.in/js/certificateFonts/Tangerine-Regular.ttf';
                                            pdfObj.fjalla = 'http://testmumbaischool.sfanow.in/js/certificateFonts/FjallaOne-Regular.ttf';
                                            pdfObj.opens = 'http://testmumbaischool.sfanow.in/js/certificateFonts/OpenSans-CondLight.ttf';
                                        } else {
                                            pdfObj.tang = 'http://testmumbaicollege.sfanow.in/js/certificateFonts/Tangerine-Regular.ttf';
                                            pdfObj.fjalla = 'http://testmumbaicollege.sfanow.in/js/certificateFonts/FjallaOne-Regular.ttf';
                                            pdfObj.opens = 'http://testmumbaicollege.sfanow.in/js/certificateFonts/OpenSans-CondLight.ttf';
                                        }

                                    } else if (property[0].sfaCity == 'Hyderabad') {
                                        pdfObj.tang = 'http://testhyderabadschool.sfanow.in/js/certificateFonts/Tangerine-Regular.ttf';
                                        pdfObj.fjalla = 'http://testhyderabadschool.sfanow.in/js/certificateFonts/FjallaOne-Regular.ttf';
                                        pdfObj.opens = 'http://testhyderabadschool.sfanow.in/js/certificateFonts/OpenSans-CondLight.ttf';
                                    }
                                } else if (property[0].reqUrl == 'live') {
                                    if (property[0].sfaCity == 'Mumbai') {
                                        if (property[0].institutionType == 'school') {
                                            pdfObj.tang = 'http://mumbaischool.sfanow.in/js/certificateFonts/Tangerine-Regular.ttf';
                                            pdfObj.fjalla = 'http://mumbaischool.sfanow.in/js/certificateFonts/FjallaOne-Regular.ttf';
                                            pdfObj.opens = 'http://mumbaischool.sfanow.in/js/certificateFonts/OpenSans-CondLight.ttf';
                                        } else {
                                            pdfObj.tang = 'http://mumbaicollege.sfanow.in/js/certificateFonts/Tangerine-Regular.ttf';
                                            pdfObj.fjalla = 'http://mumbaicollege.sfanow.in/js/certificateFonts/FjallaOne-Regular.ttf';
                                            pdfObj.opens = 'http://mumbaicollege.sfanow.in/js/certificateFonts/OpenSans-CondLight.ttf';
                                        }

                                    } else if (property[0].sfaCity == 'Hyderabad') {
                                        pdfObj.tang = 'http://hyderabadschool.sfanow.in/js/certificateFonts/Tangerine-Regular.ttf';
                                        pdfObj.fjalla = 'http://hyderabadschool.sfanow.in/js/certificateFonts/FjallaOne-Regular.ttf';
                                        pdfObj.opens = 'http://hyderabadschool.sfanow.in/js/certificateFonts/OpenSans-CondLight.ttf';
                                    }
                                }
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
                                pdfObj.bannerImage = env.realHost + "/api/upload/readFile?file=" + banner[0].banner;
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
                                        "_id": ObjectId(regSport.sport)
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
                                            // console.log("--------------", certificateDetailsObj, detail);
                                            if (err) {
                                                callback(err, null);
                                            } else if (!_.isEmpty(detail)) {
                                                sport.footerImage = env.realHost + "/api/upload/readFile?file=" + detail[0].banner;
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
                                            sport.medalStatement = "securing a";
                                        } else {
                                            sport.medalType = "participant";
                                            sport.medalStatement = " ";
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
                                        pdfObj.sportObj.heading = "https://storage.googleapis.com/sfacertificate/Sliver.png";
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
                                    console.log('data***************', pdfObj, sport);
                                    if (!pdfObj.sportObj.notFound) {
                                        pdfObj.newFilename = pdfObj.athlete.sfaId + "-" + pdfObj.sportObj.sportslist.name + "-" +  pdfObj.sportObj.ageGroup.name + "-" + pdfObj.sportObj.gender + "-" + pdfObj.sportObj.sportslist.sportsListSubCategory.name + "-" + pdfObj.filename + ".pdf";
                                        // pdfObj.newFilename = pdfObj.sportObj.sportslist.sportsListSubCategory.name + "-" + pdfObj.sportObj.ageGroup.name + "-" + pdfObj.sportObj.gender + "-" + pdfObj.sportObj.sportslist.name + "-" + pdfObj.filename + ".pdf";
                                        Config.generatePdf(pdfObj, function (err, pdfRespo) {
                                            if (err) {
                                                callback(null, err);
                                            } else if (pdfRespo) {
                                                sport.pdfname = pdfRespo;
                                                callback(null, pdfRespo.name);
                                            } else {
                                                callback(null, "Invalid data");
                                            }
                                        });
                                    } else {
                                        callback(null, sport);
                                    }
                                },

                                function (fileNameArr, callback) {
                                    seriesCallback(null, fileNameArr);
                                }
                            ], function (err, fileNameArr) {
                                callback(null, fileNameArr);
                            });

                        }, function (err, fileNameArr) {
                            callback(null, fileNameArr);
                        });
                    },

                    function(fileNameArr, callback){
                        var path="pdf/";
                        console.log("athleteDetails",athleteDetails);
                        if(fileNameArr.length>1){
                            if(athleteDetails.middleName){
                                var fileName=athleteDetails.sfaId + "-" + athleteDetails.firstName + athleteDetails.middleName + athleteDetails.surname ;
                            }else{
                                var fileName=athleteDetails.sfaId + "-" + athleteDetails.firstName + athleteDetails.surname ;                                
                            }
                            Config.merge2pdfs(fileNameArr,path,fileName,function(data){
                                callback(null,fileName+ ".pdf");
                            });
                        }else if(fileNameArr.length==1){
                            callback(null,fileNameArr[0]);
                        }
                    }
                ], function (err, result) {
                    callback(null, result);
                });

            }

        ], function (err, result) {
            finalCallback(null, result)
        })
    },

    oldgenerateExcel: function (res) {
        async.waterfall([
                function (callback) {
                    var deepSearch = "player player.school team sport sport.sportslist sport.ageGroup sport.weight sport.sportslist.sportsListSubCategory";
                    Medal.find().deepPopulate(deepSearch).lean().exec(function (err, found) {
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
                    var i = 1;
                    var singleData = [];
                    async.eachSeries(found, function (mainData, callback1) {
                            if (mainData.player.length > 0) {
                                async.concatSeries(mainData.player, function (playerData, callback2) {
                                    var obj = {};
                                    obj["Sr No"] = i;
                                    obj["Medal Type"] = mainData.medalType;
                                    obj["Sport Name"] = mainData.sport.sportslist.sportsListSubCategory.name;
                                    obj["Age Group"] = mainData.sport.ageGroup.name;
                                    obj["Gender"] = mainData.sport.gender;
                                    if (mainData.sport.weight) {
                                        obj["Weight"] = mainData.sport.weight.name;
                                    } else {
                                        obj["Weight"] = '-';
                                    }
                                    obj["Event Name"] = mainData.sport.sportslist.name;
                                    obj["Type"] = 'Individual';
                                    obj["ID"] = playerData.sfaId;
                                    if (playerData.middleName) {
                                        obj["Winner"] = playerData.firstName + ' ' + playerData.middleName + ' ' + playerData.surname;
                                    } else {
                                        obj["Winner"] = playerData.firstName + ' ' + playerData.surname;
                                    }
                                    if (playerData.atheleteSchoolName) {
                                        obj["School"] = playerData.atheleteSchoolName;
                                    } else {
                                        obj["School"] = playerData.school.name;
                                    }
                                    i++;
                                    singleData.push(obj);
                                    callback2(null, obj);
                                }, function (err, data1) {
                                    callback1(null, data1);
                                });
                            } else if (mainData.team.length > 0) {
                                async.concatSeries(mainData.team, function (teamData, callback3) {
                                    var obj = {};
                                    obj["Sr No"] = i;
                                    obj["Medal Type"] = mainData.medalType;
                                    obj["Sport Name"] = mainData.sport.sportslist.sportsListSubCategory.name;
                                    obj["Age Group"] = mainData.sport.ageGroup.name;
                                    obj["Gender"] = mainData.sport.gender;
                                    if (mainData.sport.weight) {
                                        obj["Weight"] = mainData.sport.weight.name;
                                    } else {
                                        obj["Weight"] = '-';
                                    }
                                    obj["Event Name"] = mainData.sport.sportslist.name;
                                    obj["Type"] = 'Team';
                                    obj["ID"] = teamData.teamId;
                                    obj["Winner"] = teamData.schoolName;
                                    obj["School"] = teamData.schoolName;
                                    i++;
                                    singleData.push(obj);
                                    callback3(null, obj);
                                }, function (err, data2) {
                                    callback1(null, data2);
                                });
                            }
                        },
                        function (err) {
                            Config.generateExcel("Medal", singleData, res);
                        });
                },
            ],
            function (err, excelData) {
                if (err) {
                    console.log(err);
                    callback(null, []);
                } else if (excelData) {
                    if (_.isEmpty(excelData)) {
                        callback(null, []);
                    } else {
                        callback(null, excelData);
                    }
                }
            });
    },

    generateExcel: function (res) {
        async.waterfall([
                function (callback) {
                    var deepSearch = "player player.school team sport sport.sportslist sport.ageGroup sport.weight sport.sportslist.sportsListSubCategory";
                    Medal.find().deepPopulate(deepSearch).lean().exec(function (err, found) {
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
                    var i = 1;
                    var singleData = [];
                    _.each(found, function (mainData) {
                        if (mainData.player.length > 0) {
                            _.each(mainData.player, function (playerData) {
                                var obj = {};
                                obj["Sr No"] = i;
                                obj["Medal Type"] = mainData.medalType;
                                obj["Sport Name"] = mainData.sport.sportslist.sportsListSubCategory.name;
                                obj["Age Group"] = mainData.sport.ageGroup.name;
                                obj["Gender"] = mainData.sport.gender;
                                if (mainData.sport.weight) {
                                    obj["Weight"] = mainData.sport.weight.name;
                                } else {
                                    obj["Weight"] = '-';
                                }
                                obj["Event Name"] = mainData.sport.sportslist.name;
                                obj["Type"] = 'Individual';
                                obj["ID"] = playerData.sfaId;
                                if (playerData.middleName) {
                                    obj["Winner"] = playerData.firstName + ' ' + playerData.middleName + ' ' + playerData.surname;
                                } else {
                                    obj["Winner"] = playerData.firstName + ' ' + playerData.surname;
                                }
                                if (playerData.atheleteSchoolName) {
                                    obj["School"] = playerData.atheleteSchoolName;
                                } else {
                                    obj["School"] = playerData.school.name;
                                }
                                i++;
                                singleData.push(obj);
                            });
                        } else if (mainData.team.length > 0) {
                            _.each(mainData.team, function (teamData, callback3) {
                                var obj = {};
                                obj["Sr No"] = i;
                                obj["Medal Type"] = mainData.medalType;
                                obj["Sport Name"] = mainData.sport.sportslist.sportsListSubCategory.name;
                                obj["Age Group"] = mainData.sport.ageGroup.name;
                                obj["Gender"] = mainData.sport.gender;
                                if (mainData.sport.weight) {
                                    obj["Weight"] = mainData.sport.weight.name;
                                } else {
                                    obj["Weight"] = '-';
                                }
                                obj["Event Name"] = mainData.sport.sportslist.name;
                                obj["Type"] = 'Team';
                                obj["ID"] = teamData.teamId;
                                obj["Winner"] = teamData.schoolName;
                                obj["School"] = teamData.schoolName;
                                i++;
                                singleData.push(obj);
                            });
                        }
                    });
                    callback(null, singleData);
                },
            ],
            function (err, excelData) {
                if (err) {
                    console.log(err);
                    callback(null, []);
                } else if (excelData) {
                    if (_.isEmpty(excelData)) {
                        callback(null, []);
                    } else {
                        Config.generateExcel("Medal", excelData, res);
                    }
                }
            });
    },



    // var fullName = '';
    // if (pdfObj.athlete.middleName) {
    //     fullName = pdfObj.athlete.sfaId + '-' + pdfObj.athlete.firstName + '' + pdfObj.athlete.middleName + '' + pdfObj.athlete.surname;
    // } else {
    //     fullName = pdfObj.athlete.sfaId + '-' + pdfObj.athlete.firstName + '' + pdfObj.athlete.surname;
    // }


};
module.exports = _.assign(module.exports, exports, model);