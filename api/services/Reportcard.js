var schema = new Schema({
    schoolId: {
        type: Schema.Types.ObjectId,
        ref: 'Registration'
    },
    schoolName: String,
    sfaId: String,
    totalStrength: Number,
    maleCount: Number,
    femaleCount: Number,
    genderRatio: String,
    myRank: Number,
    sport: [{
        subCategoryId: {
            type: Schema.Types.ObjectId,
            ref: 'Sport'
        },
        sportName: String,
        totalStrength: Number,
        maleCount: Number,
        femaleCount: Number,
        noShowCount: Number
    }],
    totalSportCount: Number,
    sportParticipationCount: Number,
    nonParticipatedSport: [String],
    noShowPercent: Number,
    winCount: Number,
    looseCount: Number,
    winPercent: Number,
    // highestParticipation: [{
    //     name: String,
    //     count: Number
    // }],
    // lowestParticipation: [{
    //     name: String,
    //     count: Number
    // }],

    highestParticipation: [{
        subCategoryId: {
            type: Schema.Types.ObjectId,
            ref: 'Sport'
        },
        sportName: String,
        totalStrength: Number,
        maleCount: Number,
        femaleCount: Number,
        noShowCount: Number
    }],
    lowestParticipation: [{
        subCategoryId: {
            type: Schema.Types.ObjectId,
            ref: 'Sport'
        },
        sportName: String,
        totalStrength: Number,
        maleCount: Number,
        femaleCount: Number,
        noShowCount: Number
    }],
    performance: [{
        topSchoolName: String,
        criteria: String,
        topPerformance: Number,
        myPerformance: Number
    }]
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Reportcard', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getOneReportCard: function (data, callback) {

        function calPerformance(obj, callback) {

            async.waterfall([
                function (callback) {

                    Reportcard.findOne().sort({
                        "totalStrength": -1
                    }).exec(function (err, result) {
                        if (err) {
                            obj.performance.push({
                                "criteria": "Contingent Strength"
                            })
                        } else if (!_.isEmpty(result)) {
                            obj.performance.push({
                                "topSchoolName": result.schoolName,
                                "criteria": "Contingent Strength",
                                "topPerformance": result.totalStrength,
                                "myPerformance": obj.contingent.totalStrength
                            });
                            callback();
                        }
                    });

                },
                function (callback) {

                    Reportcard.findOne().sort({
                        "maleCount": -1
                    }).exec(function (err, result) {

                        if (err || _.isEmpty(result)) {
                            obj.performance.push({
                                "criteria": "Maximum Male Athletes"
                            })
                        } else if (!_.isEmpty(result)) {
                            obj.performance.push({
                                "topSchoolName": result.schoolName,
                                "criteria": "Maximum Male Athletes",
                                "topPerformance": result.maleCount,
                                "myPerformance": obj.contingent.maleCount
                            });
                            callback();
                        }
                    });
                },
                function (callback) {
                    Reportcard.findOne().sort({
                        "femaleCount": -1
                    }).exec(function (err, result) {

                        if (err || _.isEmpty(result)) {
                            obj.performance.push({
                                "criteria": "Maximum Female Athletes"
                            })
                        } else if (!_.isEmpty(result)) {
                            obj.performance.push({
                                "topSchoolName": result.schoolName,
                                "criteria": "Maximum Female Athletes",
                                "topPerformance": result.femaleCount,
                                "myPerformance": obj.contingent.femaleCount
                            })
                            callback();
                        }
                    })
                },
                function (callback) {
                    Reportcard.findOne().sort({
                        "femaleCount": -1
                    }).exec(function (err, result) {

                        if (err || _.isEmpty(result)) {
                            obj.performance.push({
                                "criteria": "Maximum Female Athletes"
                            })
                        } else if (!_.isEmpty(result)) {
                            obj.performance.push({
                                "topSchoolName": result.schoolName,
                                "criteria": "Maximum Sports Participated",
                                "topPerformance": result.sportParticipationCount,
                                "myPerformance": obj.contingent.sportParticipationCount
                            })
                            callback();
                        }
                    })
                },
                function (callback) {
                    Reportcard.findOne({
                        'totalStrength': {
                            $ne: 0
                        }
                    }).sort({
                        "noShowPercent": 1
                    }).exec(function (err, result) {
                        if (err || _.isEmpty(result)) {
                            obj.performance.push({
                                "criteria": "Minimum No Show %"
                            })
                        } else if (!_.isEmpty(result)) {
                            obj.performance.push({
                                "topSchoolName": result.schoolName,
                                "criteria": "Minimum No Show %",
                                "topPerformance": result.noShowPercent,
                                "myPerformance": obj.contingent.noShowPercent
                            })
                            callback();
                        }
                    })
                },
                function (callback) {
                    Reportcard.findOne().sort({
                        'winPercent': -1,
                        'schoolRank': 1
                    }).exec(function (err, result) {
                        if (err || _.isEmpty(result)) {
                            obj.performance.push({
                                "criteria": "Maximum Win %"
                            })
                        } else if (!_.isEmpty(result)) {
                            obj.performance.push({
                                "topSchoolName": result.schoolName,
                                "criteria": "Maximum Win %",
                                "topPerformance": result.winPercent,
                                "myPerformance": obj.contingent.winPercent
                            })
                            callback();
                        }
                    })
                }
            ], function (err, result) {
                callback(obj);
            });
        };

        async.waterfall([
            function (callback) {
                var sendObj = {};
                var matchObj = {
                    "schoolName": data.name
                }

                Reportcard.findOne(matchObj).exec(function (err, result) {
                    if (err) {
                        callback(err, null);
                    } else if (!_.isEmpty(result)) {
                        sendObj.contingent = result;
                        callback(null, sendObj);
                    } else {
                        callback("No Data Found", null);
                    }
                });
            },
            function (sendObj, callback) {
                Rank.getSchoolByRanks(function (err, result) {
                    if (err) {
                        callback(err, null);
                    } else {
                        sendObj.totalSchoolCount = result.length;
                        var index = _.findIndex(result, ['name', data.name]);
                        if (index != -1) {
                            sendObj.schoolRank = index + 1;
                            sendObj.medalsTally = result[index];
                            sendObj.performance = sendObj.contingent.performance;


                            var maxTotalMedalsWon = _.maxBy(result, 'totalCount');
                            var maxGoldMedalsWon = _.maxBy(result, 'medal.gold.count');

                            sendObj.performance.push({
                                topSchoolName: result[0].name,
                                criteria: "School Rank (Out of " + result.length + ")",
                                topPerformance: 1,
                                myPerformance: index + 1
                            }, {
                                topSchoolName: maxTotalMedalsWon.name,
                                criteria: "Maximum Medals Won",
                                topPerformance: maxTotalMedalsWon.totalCount,
                                myPerformance: result[index].totalCount
                            }, {
                                topSchoolName: maxGoldMedalsWon.name,
                                criteria: "Maximum Gold Medals Won",
                                topPerformance: maxGoldMedalsWon.medal.gold.count,
                                myPerformance: (result[index].medal && result[index].medal.gold) ? result[index].medal.gold.count : 0
                            });


                        } else {
                            sendObj.schoolRank = "NA";
                        }

                        async.concatSeries(sendObj.medalsTally.sportData, function (singleData, callback) {
                            var matchObj = {
                                "name": singleData.name
                            }
                            Rank.getSchoolBySport(matchObj, function (err, schoolSportData) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    singleData.totalSchoolCount = schoolSportData.table.length;
                                    var index = _.findIndex(schoolSportData.table, ['_id', data.name]);
                                    if (index != -1) {
                                        singleData.schoolRank = index + 1;
                                    } else {
                                        singleData.schoolRank = "NA";
                                    }
                                    callback(null, singleData);
                                }
                            });

                        }, function (err, finalResult) {
                            sendObj.medalsTally.sportData = finalResult;

                            ConfigProperty.findOne().exec(function (err, data) {

                                if (sendObj.medalsTally && sendObj.medalsTally.medal && sendObj.medalsTally.medal['gold'] && sendObj.medalsTally.medal['gold'].count) {
                                    sendObj.medalsTally.medal['gold'].totalGold = data['goldMedal'];
                                } else {
                                    if (sendObj.medalsTally && sendObj.medalsTally.medal) {
                                        sendObj.medalsTally.medal['gold'] = {
                                            "totalGold": data['goldMedal']
                                        }
                                    } else {
                                        console.log(data);
                                        sendObj.medalsTally.medal = {
                                            'gold': {
                                                "totalGold": data['goldMedal']
                                            }
                                        }
                                    }
                                }

                                if (sendObj.medalsTally && sendObj.medalsTally.medal && sendObj.medalsTally.medal['silver'] && sendObj.medalsTally.medal['silver'].count) {
                                    sendObj.medalsTally.medal['silver'].totalSilver = data['silverMedal'];
                                } else {
                                    sendObj.medalsTally.medal['silver'] = {
                                        "totalSilver": data['silverMedal']
                                    }
                                }

                                if (sendObj.medalsTally && sendObj.medalsTally.medal && sendObj.medalsTally.medal['bronze'] && sendObj.medalsTally.medal['bronze'].count) {
                                    sendObj.medalsTally.medal['bronze'].totalBronze = data['bronzeMedal'];
                                } else {
                                    sendObj.medalsTally.medal['bronze'] = {
                                        "totalBronze": data['bronzeMedal']
                                    }
                                }
                                callback(null, sendObj);
                            });
                        });
                    }
                })
            },
            // calPerformance
            function (sendObj, callback) {
                calPerformance(sendObj, function (obj) {
                    callback(null, obj);
                })
            }
        ], function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, result);
            }

        })


    },

    generateReportCard: function (fcallback) {

        function calTotalAth(obj, callback) {

            var returnObj = {};
            returnObj.maleCount = 0;
            returnObj.femaleCount = 0;
            returnObj.genderRatio = "0:0";

            obj.arr = _.uniqBy(obj.arr, function (n) {
                return JSON.stringify(n.athleteId._id)
            });
            returnObj.totalStrength = obj.arr.length;

            var wonArr = _.filter(obj.arr, ['won', true]);
            var looseArr = _.filter(obj.arr, ['won', false]);

            returnObj.winCount = wonArr.length;
            returnObj.looseCount = looseArr.length;
            var winPercent = _.round((returnObj.winCount / (returnObj.winCount + returnObj.looseCount)) * 100);
            returnObj.winPercent = _.isNaN(winPercent) ? 0 : winPercent;
            obj.arr = _.groupBy(obj.arr, 'athleteId.gender');

            if (obj.arr['male'] && obj.arr['female']) {
                returnObj.maleCount = obj.arr['male'].length;
                returnObj.femaleCount = obj.arr['female'].length;
                var incr = 2;
                var malNum = returnObj.maleCount;
                var fNum = returnObj.femaleCount;
                var stopCount;
                var divideBy = 1;
                var stopCount = 1;
                while (stopCount != 9) {
                    if (malNum % incr == 0 && fNum % incr == 0) {
                        malNum = malNum / incr;
                        fNum = fNum / incr;
                        divideBy = divideBy * incr;
                        incr = 2;
                        stopCount = 1;
                    } else {
                        ++stopCount;
                        ++incr;
                    }

                    if (stopCount == 9) {
                        returnObj.genderRatio = returnObj.maleCount / divideBy + ":" + returnObj.femaleCount / divideBy;
                        callback(returnObj);
                    }
                }
            } else if (obj.arr['male']) {
                returnObj.maleCount = obj.arr['male'].length;
                returnObj.genderRatio = "1:0";
                callback(returnObj);
            } else if (obj.arr['female']) {
                returnObj.femaleCount = obj.arr['female'].length;
                returnObj.genderRatio = "0:1";
                callback(returnObj);
            } else {
                callback(returnObj);
            }


        };

        function calSportDetails(obj, callback) {

            async.waterfall([

                function (callback) {
                    obj.sport = _(obj.arr)
                        .groupBy('sportsListSubCategory.name')
                        .map(function (values, key1) {
                            var returnObj = {};
                            returnObj.sportName = key1;
                            returnObj.subCategoryId = values[0].sportsListSubCategory._id;
                            returnObj.totalStrength = values.length;
                            var noShow = _.remove(values, function (n) {
                                return n.noShow == true;
                            });


                            returnObj.noShowCount = noShow.length;

                            var sport = _(values)
                                .groupBy('athleteId.gender').value();

                            if (sport['male'] && sport['female']) {
                                returnObj.maleCount = sport['male'].length;
                                returnObj.femaleCount = sport['female'].length;
                            } else if (sport['male']) {
                                returnObj.maleCount = sport['male'].length;
                                returnObj.femaleCount = 0;
                            } else if (sport['female']) {
                                returnObj.maleCount = 0;
                                returnObj.femaleCount = sport['female'].length;
                            } else {
                                returnObj.maleCount = 0;
                                returnObj.femaleCount = 0;
                            }

                            returnObj.malePercent = _.round(returnObj.maleCount / (returnObj.maleCount + returnObj.femaleCount) * 100);
                            returnObj.femalePercent = _.round(returnObj.femaleCount / (returnObj.maleCount + returnObj.femaleCount) * 100);

                            if (_.isNaN(returnObj.malePercent)) {
                                returnObj.malePercent = 0;
                            }
                            if (_.isNaN(returnObj.femalePercent)) {
                                returnObj.femalePercent = 0;
                            }

                            return returnObj;
                        }).value();

                    callback();
                },

                function (callback) {
                    var sportsToMerge = ['Tennis', 'Badminton', 'Table Tennis', 'Athletics', 'Swimming'];

                    _.each(sportsToMerge, function (sportName, k) {
                        var matchedObjs = _.filter(obj.sport, function (sport) {
                            if (sport.sportName.indexOf(sportName) != -1 && !sport.sportName.indexOf(sportName) > 0) {
                                return sport;
                            }
                        })

                        if (!_.isEmpty(matchedObjs) && matchedObjs.length > 1) {
                            var addObj = {
                                "sportName": sportName,
                                "totalStrength": 0,
                                "maleCount": 0,
                                "femaleCount": 0,
                                "noShowCount": 0
                            };

                            _.each(matchedObjs, function (n) {
                                addObj.subCategoryId = n.subCategoryId;
                                addObj.totalStrength += n.totalStrength;
                                addObj.maleCount += n.maleCount;
                                addObj.femaleCount += n.femaleCount;
                                addObj.noShowCount += n.noShowCount;
                                n.removeThis = true;
                            });

                            addObj.malePercent = _.round(addObj.maleCount / (addObj.maleCount + addObj.femaleCount) * 100);
                            addObj.femalePercent = _.round(addObj.femaleCount / (addObj.maleCount + addObj.femaleCount) * 100);
                            if (_.isNaN(addObj.malePercent)) {
                                addObj.malePercent = 0;
                            }
                            if (_.isNaN(addObj.femalePercent)) {
                                addObj.femalePercent = 0;
                            }

                            obj.sport.push(addObj);

                        }

                        if (sportsToMerge.length - 1 == k) {
                            obj.sport = _.filter(obj.sport, function (n) {
                                return !n.removeThis;
                            });
                            callback();
                        }
                    })

                },
                function (callback) {
                    // calculate participated sport
                    obj.participatedSport = [];
                    if (!_.isEmpty(obj.sport)) {
                        _.each(obj.sport, function (n, k) {
                            obj.participatedSport.push(n.sportName);
                            if (obj.sport.length - 1 == k) {
                                callback();
                            }
                        });
                    } else {
                        callback();
                    }
                },
                function (callback) {
                    // calculate noShow %
                    var totalStrengthSum = _.sumBy(obj.sport, 'totalStrength');
                    var totalNoShowSum = _.sumBy(obj.sport, 'noShowCount');
                    obj.noShowPercent = _.round((totalNoShowSum / totalStrengthSum) * 100);
                    if (_.isNaN(obj.noShowPercent)) {
                        obj.noShowPercent = 0;
                    }
                    callback();
                }
            ], function (err, result) {
                var high = obj.highestParticipation = _.orderBy(obj.sport, ['totalStrength'], ['desc']);
                var low = obj.lowestParticipation = _.orderBy(obj.sport, 'totalStrength', ['asc']);
                var highIndex = 0;
                var lowIndex = 0;
                for (var i = 0; i < high.length; i++) {
                    if (high[i] && high[i + 1]) {
                        if ((high[i].totalStrength != high[i + 1].totalStrength)) {
                            highIndex = i;
                            break
                        }
                    } else {
                        highIndex = i;
                    }
                }

                for (var i = 0; i < low.length; i++) {
                    if (low[i] && low[i + 1]) {
                        if ((low[i].totalStrength != low[i + 1].totalStrength)) {
                            lowIndex = i;
                            break
                        }
                    } else {
                        lowIndex = i;
                    }
                }

                obj.highestParticipation = obj.highestParticipation.splice(0, highIndex + 1);
                obj.lowestParticipation = obj.lowestParticipation.splice(0, lowIndex + 1);

                callback(obj);
            })

        };

        function calPerformance(obj, callback) {
            async.waterfall([
                // calSchoolRank
                function (callback) {

                },
            ], function (err, result) {

            });
        };

        // async.cobn
        Registration.find({
            'status': "Verified"
        }, "_id schoolName sfaID").exec(function (err, schoolsList) {
            async.concatLimit(schoolsList, 1, function (school, callback) {
                var saveObj = {};
                saveObj.schoolName = school.schoolName;

                saveObj.sfaId = school.sfaID;
                async.waterfall([

                    function (callback) {
                        async.parallel([
                            //Individual Sports
                            function (callback) {
                                var indSportPipeline = [{
                                    $lookup: {
                                        "from": "atheletes",
                                        "localField": "athleteId",
                                        "foreignField": "_id",
                                        "as": "athleteId"
                                    }
                                }, {
                                    $unwind: {
                                        path: "$athleteId",
                                        includeArrayIndex: "arrayIndex", // optional
                                        preserveNullAndEmptyArrays: false // optional
                                    }
                                }, {
                                    $lookup: {
                                        "from": "schools",
                                        "localField": "athleteId.school",
                                        "foreignField": "_id",
                                        "as": "athleteId.school"
                                    }
                                }, {
                                    $unwind: {
                                        path: "$athleteId.school",
                                        includeArrayIndex: "arrayIndex", // optional
                                        preserveNullAndEmptyArrays: true // optional
                                    }
                                }, {
                                    $match: {
                                        $or: [{
                                            "athleteId.school.name": school.schoolName
                                        }, {
                                            "athleteId.atheleteSchoolName": school.schoolName
                                        }]
                                    }
                                }, {
                                    $lookup: {
                                        "from": "sportslistsubcategories",
                                        "localField": "sportsListSubCategory",
                                        "foreignField": "_id",
                                        "as": "sportsListSubCategory"
                                    }
                                }, {
                                    $unwind: {
                                        path: "$sportsListSubCategory",
                                        includeArrayIndex: "arrayIndex", // optional
                                        preserveNullAndEmptyArrays: true // optional
                                    }
                                }, {
                                    $lookup: {
                                        "from": "sportslistcategories",
                                        "localField": "sportsListSubCategory.sportsListCategory",
                                        "foreignField": "_id",
                                        "as": "sportsListSubCategory.sportsListCategory"
                                    }
                                }, {
                                    $unwind: {
                                        path: "$sportsListSubCategory.sportsListCategory",
                                        includeArrayIndex: "arrayIndex", // optional
                                        preserveNullAndEmptyArrays: true // optional
                                    }
                                }, {
                                    $project: {
                                        // specifications
                                        "_id": "$_id",
                                        "sportsListSubCategory._id": "$sportsListSubCategory._id",
                                        "sportsListSubCategory.name": "$sportsListSubCategory.name",
                                        "sportsListSubCategory.type": "$sportsListSubCategory.sportsListCategory.name",
                                        "athleteId._id": "$athleteId._id",
                                        "athleteId.gender": "$athleteId.gender",
                                        "school.name1": "$athleteId.school.name",
                                        "school.name2": "$athleteId.atheleteSchoolName",
                                        "school._id": "$athleteId.school._id",
                                        "type": "indi"
                                    }
                                }];
                                IndividualSport.aggregate(indSportPipeline, function (err, result) {
                                    if (err) {
                                        fcallback(err, null);
                                    } else {
                                        callback(null, result);
                                    }
                                });
                            },
                            //Team Sports
                            function (callback) {
                                var teamSportPipeline = [{
                                    $match: {
                                        "schoolName": school.schoolName
                                    }
                                }, {
                                    $lookup: {
                                        "from": "sports",
                                        "localField": "sport",
                                        "foreignField": "_id",
                                        "as": "sport"
                                    }
                                }, {
                                    $unwind: {
                                        path: "$sport",
                                        includeArrayIndex: "arrayIndex", // optional
                                        preserveNullAndEmptyArrays: false // optional
                                    }
                                }, {
                                    $lookup: {
                                        "from": "sportslists",
                                        "localField": "sport.sportslist",
                                        "foreignField": "_id",
                                        "as": "sport.sportslist"
                                    }
                                }, {
                                    $unwind: {
                                        path: "$sport.sportslist",
                                        includeArrayIndex: "arrayIndex", // optional
                                        preserveNullAndEmptyArrays: false // optional
                                    }
                                }, {
                                    $lookup: {
                                        "from": "sportslistsubcategories",
                                        "localField": "sport.sportslist.sportsListSubCategory",
                                        "foreignField": "_id",
                                        "as": "sport.sportslist.sportsListSubCategory"
                                    }
                                }, {
                                    $unwind: {
                                        path: "$sport.sportslist.sportsListSubCategory",
                                        includeArrayIndex: "arrayIndex", // optional
                                        preserveNullAndEmptyArrays: false // optional
                                    }
                                }, {
                                    $lookup: {
                                        "from": "sportslistcategories",
                                        "localField": "sport.sportslist.sportsListSubCategory.sportsListCategory",
                                        "foreignField": "_id",
                                        "as": "sport.sportslist.sportsListSubCategory.sportsListCategory"
                                    }
                                }, {
                                    $unwind: {
                                        path: "$sport.sportslist.sportsListSubCategory.sportsListCategory",
                                        includeArrayIndex: "arrayIndex", // optional
                                        preserveNullAndEmptyArrays: false // optional
                                    }
                                }, {
                                    $lookup: {
                                        "from": "studentteams",
                                        "localField": "studentTeam",
                                        "foreignField": "_id",
                                        "as": "studentTeam"
                                    }
                                }, {
                                    $unwind: {
                                        path: "$studentTeam",
                                        includeArrayIndex: "arrayIndex", // optional
                                        preserveNullAndEmptyArrays: false // optional
                                    }
                                }, {
                                    $lookup: {
                                        "from": "atheletes",
                                        "localField": "studentTeam.studentId",
                                        "foreignField": "_id",
                                        "as": "studentTeam.studentId"
                                    }
                                }, {
                                    $unwind: {
                                        path: "$studentTeam.studentId",
                                        includeArrayIndex: "arrayIndex", // optional
                                        preserveNullAndEmptyArrays: false // optional
                                    }
                                }, {
                                    $project: {
                                        // specifications
                                        "_id": "$_id",
                                        "sportsListSubCategory._id": "$sport.sportslist.sportsListSubCategory._id",
                                        "sportsListSubCategory.name": "$sport.sportslist.sportsListSubCategory.name",
                                        "sportsListSubCategory.type": "$sport.sportslist.sportsListSubCategory.sportsListCategory.name",
                                        "school.name": "$schoolName",
                                        "athleteId._id": "$studentTeam.studentId._id",
                                        "athleteId.gender": "$studentTeam.studentId.gender",
                                        "type": "team"
                                    }
                                }];
                                TeamSport.aggregate(teamSportPipeline, function (err, result) {
                                    if (err) {
                                        fcallback(err, null);
                                    } else {
                                        callback(null, result);
                                    }
                                });
                            }
                        ], function (err, parallelResult) {
                            //parallel callback
                            var arr = [];

                            // arr = parallelResult[0].concat(parallelResult[1]);
                            arr = _.flatten(parallelResult);
                            callback(null, arr);
                        });
                    },

                    function (parallelResult, callback) {
                        async.concatSeries(parallelResult, function (singleData, callback) {
                            var resultVar = Match.getResultVar(singleData.sportsListSubCategory.name, singleData.sportsListSubCategory.type);

                            if (resultVar == null) {
                                singleData.ignoreMe = true;
                                callback();
                            } else {
                                var matchObj = {};
                                matchObj[resultVar.opponentsVar] = singleData._id;
                                var pullProperties = resultVar.resultVar + " " + "excelType";

                                Match.findOne(matchObj, pullProperties).lean().exec(function (err, result) {
                                    if (err) {
                                        callback(err, null);
                                    } else if (!_.isEmpty(result)) {

                                        if (result[resultVar.resultVar]) {
                                            var findByKey = '';

                                            var noShow = function (obj) {
                                                if (!_.isEmpty(obj)) {
                                                    singleData.noShow = obj.noShow;
                                                } else {
                                                    singleData.delete = true;
                                                }
                                            };

                                            var win=function(obj){
                                                if (singleData.type == 'indi') {
                                                    if (obj && obj.winner && obj.winner.opponentsSingle && (obj.winner.opponentsSingle == _.toString(singleData._id))) {
                                                        singleData.won = true;
                                                    } else {
                                                        singleData.won = false;
                                                    }
                                                } else if (singleData.type == 'team') {
                                                    if (obj && obj.winner && obj.winner.player && (obj.winner.player == _.toString(singleData._id))) {
                                                        singleData.won = true;
                                                    } else {
                                                        singleData.won = false;
                                                    }
                                                }
                                            }             
                                            callback();                            

                                            // switch (singleData.sportsListSubCategory.type) {
                                            //     case 'Combat Sports':
                                            //     case 'Racquet Sports':
                                            //     case 'Team Sports':
                                            //         findByKey = 'player';
                                            //         break;
                                            //     case 'Individual Sports':
                                            //         findByKey = 'id';
                                            //         if (singleData.sportsListSubCategory.name == "Carrom") {
                                            //             findByKey = 'player';
                                            //         } else if (singleData.sportsListSubCategory.name == "Chess") {
                                            //             noShow = function (obj) {
                                            //                 if (obj.score && obj.rank) {
                                            //                     singleData.noShow = false;
                                            //                 } else {
                                            //                     singleData.delete = true;
                                            //                 }
                                            //             }
                                            //         } else if (singleData.sportsListSubCategory.name == "Athletics" || singleData.sportsListSubCategory.name == "Athletics 4x100m Relay" || singleData.sportsListSubCategory.name == "Athletics 4x50m Relay" || singleData.sportsListSubCategory.name == "Athletics Medley Relay") {
                                            //             findByKey = 'id';
                                            //             noShow = function (obj) {
                                            //                 if (obj && obj.result) {
                                            //                     if (obj.result == '-') {
                                            //                         singleData.noShow = true;
                                            //                     } else {
                                            //                         singleData.noShow = false;
                                            //                     }
                                            //                 } else {
                                            //                     singleData.delete = true;
                                            //                 }
                                            //             }

                                            //             win = function(obj){
                                            //                 console.log("obj",obj);
                                            //                 console.log("singleData.athleteId._id",singleData.athleteId._id);
                                            //                 console.log("resultVar",resultVar);
                                            //                 console.log("result",result[resultVar.resultVar]);
                                            //                 if(obj.result){
                                            //                     if(obj.result == "Won" || obj.result == 1 || obj.result == 2 || obj.result == 3){
                                            //                         singleData.won = true;
                                            //                     }else if(obj.result == "Loss"){
                                            //                         singleData.won=false;
                                            //                     }
                                            //                 }else{
                                            //                     singleData.delete = true;//doubt
                                            //                 }
                                            //             }
                                            //         }
                                            //         break;
                                            //     case 'Aquatics Sports':
                                            //         noShow = function (obj) {
                                            //             if (obj && obj.result) {
                                            //                 if (obj.result == '-') {
                                            //                     singleData.noShow = true;
                                            //                 } else {
                                            //                     singleData.noShow = false;
                                            //                 }
                                            //             } else {
                                            //                 singleData.delete = true;
                                            //             }
                                            //         }

                                            //         win = function(obj){
                                            //             if(obj.result){
                                            //                 if(obj.result == "Won" || obj.result == 1 || obj.result == 2 || obj.result == 3){
                                            //                     singleData.won = true;
                                            //                 }else if(obj.result == "Loss"){
                                            //                     singleData.won=false;
                                            //                 }
                                            //             }else{
                                            //                 singleData.delete = true;//doubt
                                            //             }
                                            //         }
                                            //         break;
                                            //     case 'Target Sports':
                                            //         if (singleData.sportsListSubCategory.name == "Archery") {
                                            //             if (result.excelType == 'qualifying') {
                                            //                 findByKey = 'id';
                                            //                 resultVar['resultVar'] = resultVar.resultVar1;
                                            //                 win = function(obj){
                                            //                     if(obj.result){
                                            //                         if(obj.result == "Won" || obj.result == 1 || obj.result == 2 || obj.result == 3){
                                            //                             singleData.won = true;
                                            //                         }else if(obj.result == "Loss"){
                                            //                             singleData.won=false;
                                            //                         }
                                            //                     }else{
                                            //                         singleData.delete = true;//doubt
                                            //                     }
                                            //                 }
                                            //             } else if (result.excelType == 'knockout') {
                                            //                 findByKey = 'player';
                                            //                 resultVar['resultVar'] = resultVar.resultVar2;
                                            //             }
                                            //         } else if (singleData.sportsListSubCategory.name == "Shooting") {
                                            //             noShow = function (obj) {
                                            //                 if (obj && obj.result) {
                                            //                     if (obj.result == '-') {
                                            //                         singleData.noShow = true;
                                            //                     } else {
                                            //                         singleData.noShow = false;
                                            //                     }
                                            //                 } else {
                                            //                     singleData.delete = true;
                                            //                 }
                                            //             };

                                            //             win = function(obj){
                                            //                 if(obj.result){
                                            //                     if(obj.result == "Won" || obj.result == 1 || obj.result == 2 || obj.result == 3){
                                            //                         singleData.won = true;
                                            //                     }else if(obj.result == "Loss"){
                                            //                         singleData.won=false;
                                            //                     }
                                            //                 }else{
                                            //                     singleData.delete = true;//doubt
                                            //                 }
                                            //             }


                                            //         }
                                            //         break;
                                            // }

                                            // if (resultVar.opponentsVar == 'opponentsSingle') {
                                            //     if (singleData.sportsListSubCategory.name != "Shooting") {
                                            //         var obj = _.find(result[resultVar.resultVar].players, [findByKey, singleData.athleteId._id.toString()]);
                                            //         noShow(obj);
                                            //         win(obj);
                                            //         callback();
                                            //     } else {
                                            //         var obj = _.find(result[resultVar.resultVar].players, [findByKey, singleData._id.toString()]);
                                            //         noShow(obj);
                                            //         callback();
                                            //     }
                                            // } else if (resultVar.opponentsVar == 'opponentsTeam') {
                                            //     var sendObj = {};
                                            //     _.each(result[resultVar.resultVar].teams, function (n) {
                                            //         if (_.findIndex(n.players, [findByKey, singleData.athleteId._id.toString()]) != -1) {
                                            //             sendObj = n
                                            //         }
                                            //     });
                                            //     noShow(sendObj);
                                            //     win(sendObj);
                                            //     callback();
                                            // }
                                        } else {
                                            singleData.delete = true;
                                            callback();
                                        }

                                    } else {
                                        singleData.noShow = true;
                                        callback(null, "Not Found");
                                    }

                                });
                            }
                        }, function (err, result) {
                            callback(null, parallelResult);
                        })
                    },

                    function (parallelResult, callback) {
                        _.remove(parallelResult, function (n) {
                            return n.delete == true;
                        });
                        var obj = {
                            "name": school.schoolName,
                            "arr": parallelResult
                        }
                        calTotalAth(_.cloneDeep(obj), function (data) {
                            saveObj.totalStrength = data.totalStrength;
                            saveObj.maleCount = data.maleCount;
                            saveObj.femaleCount = data.femaleCount;
                            saveObj.genderRatio = data.genderRatio;
                            saveObj.winCount = data.winCount;
                            saveObj.looseCount = data.looseCount;
                            saveObj.winPercent = data.winPercent;
                            callback(null, obj);
                        });
                    },

                    function (mainObj, callback) {
                        calSportDetails(_.cloneDeep(mainObj), function (obj) {
                            saveObj.sport = obj.sport;
                            saveObj.highestParticipation = obj.highestParticipation;
                            saveObj.lowestParticipation = obj.lowestParticipation;
                            saveObj.sportParticipationCount = saveObj.sport.length;
                            saveObj.noShowPercent = obj.noShowPercent;
                            ConfigProperty.findOne().lean().exec(function (err, data) {
                                if (err) {
                                    saveObj.totalSportCount = null;
                                } else {
                                    saveObj.totalSportCount = data.totalSport;
                                    saveObj.nonParticipatedSport = _.difference(data.sports, obj.participatedSport);
                                }
                                callback(null, saveObj);
                            });
                        });
                    },

                ], function (err, waterfallResult) {
                    //waterfall callback
                    // callback(null, waterfallResult);
                    // save and update
                    Reportcard.findOne({
                        "schoolName": saveObj.schoolName
                    }).exec(function (err, found) {
                        function save() {
                            Reportcard.saveData(saveObj, function (err, data) {
                                var obj = {};
                                if (err) {
                                    obj.messege = err;
                                } else {
                                    obj.messege = "Successfully Saved";
                                }
                                callback(null, obj);
                            });
                        }
                        if (err) {
                            callback(err, null);
                        } else if (!_.isEmpty(found)) {
                            saveObj._id = found
                            save();
                        } else {
                            save();
                        }
                    });
                });
            }, function (err, result) {
                //concatLimit callbacknonParticipatedSport
                if (err) {
                    fcallback(err, null);
                } else {
                    fcallback(null, result);
                }
            })
        })
    },




};
module.exports = _.assign(module.exports, exports, model);