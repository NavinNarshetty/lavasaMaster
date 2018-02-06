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
    totalMatches:Number,
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
                // get Config Details
                function(callback){
                    ConfigProperty.findOne().exec(function(err,property){
                        if(err){
                            callback(err,null);
                        }else{
                            callback(null,property);
                        }
                    });
                },

                // Contingent Strength
                function (property, callback) {

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
                            callback(null, property);
                        }
                    });

                },

                // Maximum Male Athletes
                function (property, callback) {

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
                            callback(null, property);
                        }
                    });
                },

                // Maximum Female Athletes
                function (property, callback) {
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
                            callback(null, property);
                        }
                    })
                },

                // Maximum Female Athletes
                function (property, callback) {
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
                            callback(null, property);
                        }
                    })
                },

                // Minimum No Show %
                function (property, callback) {
                    Reportcard.findOne({
                        'totalStrength': {
                            $ne: 0
                        },
                        'totalMatches': {
                            $gte :50
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
                            callback(null, property);
                        }
                    })
                },

                // Maximum Win %
                function (property, callback) {
                    Reportcard.findOne({
                        'totalMatches': {
                            $gte :50
                        }
                    }).sort({
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
                                        // console.log(data);
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

        function calTotalAth(arr, callback) {

            var returnObj = {};
            returnObj.maleCount = 0;
            returnObj.femaleCount = 0;
            returnObj.genderRatio = "0:0";

            arr = _.uniqBy(arr, function (n) {
                return JSON.stringify(n._id)
            });
            returnObj.totalStrength = arr.length;

            arr = _.groupBy(arr, 'gender');

            if (arr['male'] && arr['female']) {
                returnObj.maleCount = arr['male'].length;
                returnObj.femaleCount = arr['female'].length;
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
            } else if (arr['male']) {
                returnObj.maleCount = arr['male'].length;
                returnObj.genderRatio = "1:0";
                callback(returnObj);
            } else if (arr['female']) {
                returnObj.femaleCount = arr['female'].length;
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

        function calTotalAthByGender(obj, saveObj, callback) {

            async.waterfall([

                function (callback) {

                    obj.sport = _(obj.arr)
                        .groupBy('sportsListSubCategory.name')
                        .map(function (values, key1) {
                            var returnObj = {};
                            returnObj.sportName = key1;

                            returnObj.subCategoryId = values[0].sportsListSubCategory._id;
                            returnObj.totalStrength = values.length;
                            if(key1 == "Table Tennis" && values[0].school.name1=="Silver Oaks International School"){
                                console.log("returnObj.totalStrength",returnObj.totalStrength);
                                console.log("values",values);
                            }
                            var noShow = _.remove(values, function (n) {
                                return n.noShow;
                            });

                            var matchesNotPlayed = _.remove(values, function (n) {
                                return (n.noShow == undefined || n.noShow == null);
                            });

                            returnObj.noShowCount = noShow.length;

                            var sport = _(values)
                                .groupBy('athleteId.gender').value();

                            if (sport['male'] && sport['female']) {
                                // console.log("1st");
                                returnObj.maleCount = sport['male'].length;
                                returnObj.femaleCount = sport['female'].length;
                            } else if (sport['male']) {
                                // console.log("2nd");                        
                                returnObj.maleCount = sport['male'].length;
                                returnObj.femaleCount = 0;
                            } else if (sport['female']) {
                                // console.log("3rd");                        
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
                    obj.noShowPercent = _.round((totalNoShowSum / saveObj.noShowTotalMatches) * 100);
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

        // async.cobn
        Registration.find({
            'status': "Verified"
        }, "_id schoolName sfaID").exec(function (err, schoolsList) {
            async.concatLimit(schoolsList, 1, function (school, callback) {
                var saveObj = {};
                saveObj.schoolName = school.schoolName;
                saveObj.sfaId = school.sfaID;
                saveObj.winTotalMatches = 0;
                saveObj.noShowTotalMatches = 0;
                async.waterfall([

                    function (callback) {
                        Athelete.aggregate(
                            [{
                                $lookup: {
                                    "from": "schools",
                                    "localField": "school",
                                    "foreignField": "_id",
                                    "as": "school"
                                }
                            }, {
                                $unwind: {
                                    path: "$school",
                                    includeArrayIndex: "arrayIndex", // optional
                                    preserveNullAndEmptyArrays: true // optional
                                }
                            }, {
                                $match: {
                                    $or: [{
                                        "school.name": school.schoolName
                                    }, {
                                        "atheleteSchoolName": school.schoolName
                                    }]
                                }
                            }],
                            function (err, result) {
                                calTotalAth(_.cloneDeep(result), function (data) {
                                    saveObj.totalStrength = data.totalStrength;
                                    saveObj.maleCount = data.maleCount;
                                    saveObj.femaleCount = data.femaleCount;
                                    saveObj.genderRatio = data.genderRatio;
                                    callback();
                                });
                            }
                        );

                    },

                    function (callback) {
                        async.parallel([
                            //Individual Sports
                            function (callback) {
                                var indSportPipeline = [{
                                        //athletes 
                                        $lookup: {
                                            "from": "atheletes",
                                            "localField": "athleteId",
                                            "foreignField": "_id",
                                            "as": "athleteId"
                                        }
                                    }, {
                                        //athletes
                                        $unwind: {
                                            path: "$athleteId",
                                            includeArrayIndex: "arrayIndex", // optional
                                        }
                                    }, {
                                        //schools
                                        $lookup: {
                                            "from": "schools",
                                            "localField": "athleteId.school",
                                            "foreignField": "_id",
                                            "as": "athleteId.school"
                                        }
                                    }, {
                                        //schools
                                        $unwind: {
                                            path: "$athleteId.school",
                                            includeArrayIndex: "arrayIndex", // optional
                                            preserveNullAndEmptyArrays: true // optional
                                        }
                                    }, {
                                        //by schoolName
                                        $match: {
                                            $or: [{
                                                "athleteId.school.name": school.schoolName
                                            }, {
                                                "athleteId.atheleteSchoolName": school.schoolName
                                            }]
                                        }
                                    }, {
                                        //sportslistsubcategories
                                        $lookup: {
                                            "from": "sportslistsubcategories",
                                            "localField": "sportsListSubCategory",
                                            "foreignField": "_id",
                                            "as": "sportsListSubCategory"
                                        }
                                    }, {
                                        //sportslistsubcategories
                                        $unwind: {
                                            path: "$sportsListSubCategory",
                                            includeArrayIndex: "arrayIndex", // optional
                                        }
                                    }, {
                                        //sportslistcategories
                                        $lookup: {
                                            "from": "sportslistcategories",
                                            "localField": "sportsListSubCategory.sportsListCategory",
                                            "foreignField": "_id",
                                            "as": "sportsListSubCategory.sportsListCategory"
                                        }
                                    }, {
                                        // sportslistcategories
                                        $unwind: {
                                            path: "$sportsListSubCategory.sportsListCategory",
                                            includeArrayIndex: "arrayIndex", // optional
                                        }
                                    }, {
                                        // sport
                                        $unwind: {
                                            path: "$sport",
                                            includeArrayIndex: "arrayIndex", // optional
                                            preserveNullAndEmptyArrays: false // optional
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
                                            "athleteId.isBib": "$athleteId.isBib",
                                            "school.name1": "$athleteId.school.name",
                                            "school.name2": "$athleteId.atheleteSchoolName",
                                            "school._id": "$athleteId.school._id",
                                            "type": "indi",
                                            "sport": 1,

                                        }
                                    },

                                ];
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
                                    // by schoolName
                                    $match: {
                                        "schoolName": school.schoolName
                                    }
                                }, {
                                    // sports
                                    $lookup: {
                                        "from": "sports",
                                        "localField": "sport",
                                        "foreignField": "_id",
                                        "as": "sport"
                                    }
                                }, {
                                    // sports
                                    $unwind: {
                                        path: "$sport",
                                        includeArrayIndex: "arrayIndex", // optional
                                    }
                                }, {
                                    // sportslists
                                    $lookup: {
                                        "from": "sportslists",
                                        "localField": "sport.sportslist",
                                        "foreignField": "_id",
                                        "as": "sport.sportslist"
                                    }
                                }, {
                                    // sportslists
                                    $unwind: {
                                        path: "$sport.sportslist",
                                        includeArrayIndex: "arrayIndex", // optional
                                    }
                                }, {
                                    // sportslistsubcategories
                                    $lookup: {
                                        "from": "sportslistsubcategories",
                                        "localField": "sport.sportslist.sportsListSubCategory",
                                        "foreignField": "_id",
                                        "as": "sport.sportslist.sportsListSubCategory"
                                    }
                                }, {
                                    // sportslistsubcategories
                                    $unwind: {
                                        path: "$sport.sportslist.sportsListSubCategory",
                                        includeArrayIndex: "arrayIndex", // optional
                                    }
                                }, {
                                    // sportslistcategories
                                    $lookup: {
                                        "from": "sportslistcategories",
                                        "localField": "sport.sportslist.sportsListSubCategory.sportsListCategory",
                                        "foreignField": "_id",
                                        "as": "sport.sportslist.sportsListSubCategory.sportsListCategory"
                                    }
                                }, {
                                    // sportslistcategories
                                    $unwind: {
                                        path: "$sport.sportslist.sportsListSubCategory.sportsListCategory",
                                        includeArrayIndex: "arrayIndex", // optional
                                    }
                                }, {
                                    // studentteams
                                    $lookup: {
                                        "from": "studentteams",
                                        "localField": "studentTeam",
                                        "foreignField": "_id",
                                        "as": "studentTeam"
                                    }
                                }, {
                                    // studentteams
                                    $unwind: {
                                        path: "$studentTeam",
                                        includeArrayIndex: "arrayIndex", // optional
                                        preserveNullAndEmptyArrays: true // optional
                                    }
                                }, {
                                    // atheletes
                                    $lookup: {
                                        "from": "atheletes",
                                        "localField": "studentTeam.studentId",
                                        "foreignField": "_id",
                                        "as": "studentTeam.studentId"
                                    }
                                }, {
                                    // atheletes
                                    $unwind: {
                                        path: "$studentTeam.studentId",
                                        includeArrayIndex: "arrayIndex", // optional
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
                                        "athleteId.isBib": "$athleteId.isBib",
                                        "teamId": "$teamId",
                                        "type": "team",
                                        "sport": "$sport._id",
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
                            var winLoose = [];
                            winLoose[0] = _.cloneDeep(parallelResult[0]);
                            winLoose[1] = _.uniqBy(_.cloneDeep(parallelResult[1]), 'teamId');

                            arr = _.flatten(parallelResult);
                            winLoose = _.flatten(winLoose);

                            callback(null, arr, winLoose);
                        });
                    },

                    function (parallelResult, winLoose, callback) {
                        var parallelObj = {
                            "name": school.schoolName,
                            "arr": parallelResult
                        };
                        var winLooseObj = {
                            "name": school.schoolName,
                            "arr": winLoose
                        }
                        // obj1 = _.cloneDeep(obj);
                        // obj1.arr = winLoose;
                        // callback(null, obj1, obj);
                        callback(null, winLooseObj, parallelObj);

                    },

                    function (winLoose, parallelResult, callback) {
                        var totalMatches = [];
                        async.concatSeries(winLoose.arr, function (single, callback) {
                            
                            var resultVar = Match.getResultVar(single.sportsListSubCategory.name, single.sportsListSubCategory.type);

                            if (resultVar == null) {
                                callback();
                            } else {
                                var matchObj = {};
                                matchObj[resultVar.opponentsVar] = single._id;
                                var pullProperties = resultVar.resultVar + " " + "excelType, matchId";

                                Match.find(matchObj, pullProperties).lean().exec(function (err, matches) {
                                    var studArr = _.filter(parallelResult.arr, {
                                        '_id': single._id,
                                        sport: single.sport
                                    });
                               
                                    saveObj.winTotalMatches = saveObj.winTotalMatches + matches.length;
                                    saveObj.noShowTotalMatches = saveObj.noShowTotalMatches + (studArr.length * matches.length);
                                    if (err) {
                                        callback(err, null);
                                    } else if (!_.isEmpty(matches)) {

                                        async.concatSeries(matches, function (result, callback) {

                                            singleData = _.cloneDeep(single);
                                            singleData.matchId = result.matchId;
                                            if (result[resultVar.resultVar]) {
                                                var findByKey = '';

                                                //for knockout and league knockout
                                                var noShowKnock = function (obj) {
                                                    if (!_.isEmpty(obj)) {
                                                        singleData.noShow = obj.noShow;
                                                    } else {
                                                        // singleData.delete = true;
                                                    }
                                                };

                                                //for knockout and league knockout
                                                var winKnock = function (obj) {
                                                    if (singleData.type == 'indi') {
                                                        // console.log("Indi winKnock");
                                                        if (obj.status == "IsCompleted" && !(obj && obj.winner && !_.isEmpty(obj.winner)) && obj.isNoMatch == false) {
                                                            singleData.isDraw = true;
                                                            singleData.delete = true;
                                                        } else {
                                                            if (obj && obj.winner && obj.winner.opponentsSingle && (obj.winner.opponentsSingle == _.toString(singleData._id))) {
                                                                singleData.won = true;
                                                            } else {
                                                                singleData.won = false;
                                                            }
                                                        }
                                                    } else if (singleData.type == 'team') {
                                                        // console.log("Team winKnock");                                                        
                                                        if (obj.status == "IsCompleted" && !(obj && obj.winner && !_.isEmpty(obj.winner))) {
                                                            singleData.isDraw = true;
                                                            singleData.delete = true;
                                                        } else {
                                                            if (obj && obj.winner && obj.winner.player && (obj.winner.player == _.toString(singleData._id))) {
                                                                singleData.won = true;
                                                            } else {
                                                                singleData.won = false;
                                                            }
                                                        }

                                                    }
                                                }

                                                var noShowHeat = function (obj) {
                                                    if (obj && obj.result) {
                                                        if (obj.result == '-') {
                                                            singleData.noShow = true;
                                                        } else {
                                                            singleData.noShow = false;
                                                        }
                                                    } else {
                                                        singleData.delete = true;
                                                    }
                                                }

                                                var winHeat = function (obj) {
                                                    // console.log("winHeat");                                                                                                            
                                                    if (obj && obj.result) {
                                                        // console.log("winHeat");                                                        
                                                        if (obj.result == "QF" || obj.result == 1 || obj.result == 2 || obj.result == 3) {
                                                            // console.log("won Heat",singleData.sportsListSubCategory.name);                                                        
                                                            singleData.won = true;
                                                        } else if (obj.result == "DNQ") {
                                                            // console.log("Loss Heat",singleData.sportsListSubCategory.name);                                                                                                                
                                                            singleData.won = false;
                                                        }
                                                    } else {
                                                        // console.log("noShow Not Found",singleData.sportsListSubCategory.name);                                               
                                                        singleData.delete = true; //doubt
                                                    }
                                                }

                                                switch (singleData.sportsListSubCategory.type) {
                                                    case 'Combat Sports':
                                                    case 'Racquet Sports':
                                                    case 'Team Sports':
                                                        findByKey = 'team';
                                                        if (singleData.sportsListSubCategory.name == "Tennis" || singleData.sportsListSubCategory.name == "Table Tennis" || singleData.sportsListSubCategory.name == "Badminton" || singleData.sportsListSubCategory.name == "Judo" || singleData.sportsListSubCategory.name == "Fencing" || singleData.sportsListSubCategory.name == "Karate") {
                                                            findByKey = 'player';
                                                        }
                                                        noShow = noShowKnock;
                                                        win = winKnock;
                                                        break;
                                                    case 'Individual Sports':
                                                        findByKey = 'id';

                                                        if (singleData.sportsListSubCategory.name == "Carrom") {
                                                            findByKey = 'player';
                                                            noShow = noShowKnock;
                                                            win = winKnock;
                                                        } else if (singleData.sportsListSubCategory.name == "Chess") {
                                                            // noShow = function (obj) {
                                                            //     if (obj && obj.score && obj.rank) {
                                                            //         singleData.noShow = false;
                                                            //     } else {
                                                            //         singleData.delete = true;
                                                            //     }
                                                            // }
                                                            noShow = noShowKnock;
                                                            win = winKnock;
                                                        } else if (singleData.sportsListSubCategory.name == "Athletics" || singleData.sportsListSubCategory.name == "Athletics 4x100m Relay" || singleData.sportsListSubCategory.name == "Athletics 4x50m Relay" || singleData.sportsListSubCategory.name == "Athletics Medley Relay") {
                                                            findByKey = 'id';
                                                            noShow = noShowHeat;
                                                            win = winHeat;
                                                        }
                                                        break;
                                                    case 'Aquatics Sports':
                                                        if (singleData.sportsListSubCategory.name != "Water Polo") {
                                                            findByKey = 'id';
                                                            noShow = noShowHeat;
                                                            win = winHeat;
                                                        } else {
                                                            findByKey = 'player';
                                                            noShow = noShowKnock;
                                                            win = winKnock;
                                                        }
                                                        break;
                                                    case 'Target Sports':
                                                        if (singleData.sportsListSubCategory.name == "Archery") {
                                                            if (result.excelType == 'qualifying') {
                                                                resultVar['resultVar'] = resultVar.resultVar1;
                                                                noShow = noShowHeat;

                                                                win = winHeat;
                                                            } else if (result.excelType == 'knockout') {
                                                                findByKey = 'player';
                                                                resultVar['resultVar'] = resultVar.resultVar2;
                                                                noShow = noShowKnock;
                                                                win = winKnock;
                                                            }
                                                        } else if (singleData.sportsListSubCategory.name == "Shooting") {
                                                            noShow = noShowHeat;
                                                            win = winHeat;
                                                        }
                                                        break;
                                                }

                                                if (resultVar.opponentsVar == 'opponentsSingle') {

                                                    if (singleData.sportsListSubCategory.name != "Shooting" && singleData.sportsListSubCategory.name != "Archery" && singleData.sportsListSubCategory.name != "Athletics") {
                                                        var obj = _.find(result[resultVar.resultVar].players, [findByKey, singleData.athleteId._id.toString()]);

                                                        noShow(obj);
                                                        win(result[resultVar.resultVar]);
                                                        // console.log("singleData",singleData);
                                                        callback(null, singleData);
                                                    } else if (singleData.sportsListSubCategory.name == "Shooting" || singleData.sportsListSubCategory.name == "Archery") {
                                                        var obj = result[resultVar.resultVar].player;

                                                        noShow(obj);
                                                        win(obj);
                                                        // console.log("singleData",singleData);
                                                        
                                                        callback(null, singleData);
                                                    } else if (singleData.sportsListSubCategory.name == "Athletics" || singleData.sportsListSubCategory.name == "Swimming") {
                                                        var obj = _.find(result[resultVar.resultVar].players, [findByKey, singleData._id]);

                                                        noShow(obj);
                                                        win(obj);
                                                        // console.log("singleData",singleData);
                                                        callback(null, singleData);
                                                    }
                                                } else if (resultVar.opponentsVar == 'opponentsTeam') {

                                                    if (singleData.sportsListSubCategory.name != "Athletics 4x100m Relay" && singleData.sportsListSubCategory.name != "Athletics 4x50m Relay" && singleData.sportsListSubCategory.name != "Athletics Medley Relay" && singleData.sportsListSubCategory.name != "Swimming 4x50m Freestyle Relay" && singleData.sportsListSubCategory.name != "Swimming 4x50m Medley Relay") {
                                                        var sendObj = {};
                                                        sendObj = _.find(result[resultVar.resultVar].teams, [findByKey, _.toString(singleData._id)]);
                                                        noShow(sendObj);
                                                        win(result[resultVar.resultVar]);
                                                        callback(null, singleData);
                                                    } else {
                                                        var obj = _.find(result[resultVar.resultVar].teams, ['id', singleData._id]);
                                                        noShow(obj);
                                                        win(obj);
                                                        callback(null, singleData);
                                                    }
                                                }
                                            } else {
                                                singleData.delete = true;
                                                callback(null, singleData);
                                            }

                                        }, function (err, matchesResult) {
                                            // console.log("matchesResult",matchesResult);
                                            totalMatches.push(matchesResult);
                                            if (err) {
                                                callback(err, null);
                                            } else {

                                                var ignore = _.find(matchesResult, ['delete', true]);
                                                if (_.isEmpty(ignore)) {
                                                    var obj = _.find(matchesResult, ['noShow', true]);
                                                    if (_.isEmpty(obj)) {
                                                        single.noShow = false;
                                                    } else {
                                                        single.noShow = true;
                                                    }
                                                }

                                                studArr = _.map(studArr, function (n) {
                                                    n.noShow = single.noShow
                                                    return n;
                                                });
                                                callback(null, studArr);
                                            }
                                        });

                                    } else {
                                        single.delete = true;
                                        callback(null, "Not Found");
                                    }

                                });
                            }
                        }, function (err, result) {
                            _.remove(result, function (n) {
                                return n == "Not Found";
                            });
                            winLoose.arr = result;
                            winLoose.totalMatches = _.flatten(totalMatches);
                            callback(null, winLoose);
                        })
                    },

                    function (winLoose, callback) {
                        calTotalAthByGender(winLoose,saveObj, function (obj) {
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
                                callback(null,winLoose);
                            });
                        });
                    },

                    function (winLoose, callback) {
                        var isDrawCount = (_.filter(winLoose.totalMatches, ['isDraw', true])).length;
                        // _.remove(winLoose.totalMatches, function (n) {
                        //     return n.delete == true;
                        // });

                        var wonArr = _.filter(winLoose.totalMatches, ['won', true]);
                        var looseArr = _.filter(winLoose.totalMatches, ['won', false]);

                        saveObj.winCount = wonArr.length;
                        saveObj.looseCount = looseArr.length;
                        var winPercent = _.round((saveObj.winCount / saveObj.winTotalMatches) * 100);
                        saveObj.winPercent = _.isNaN(winPercent) ? 0 : winPercent;
                        saveObj.totalMatches = saveObj.winTotalMatches;
                        callback(null, {'winLoose':winLoose,'saveObj':saveObj});
                    },

                ], function (err, waterfallResult) {
                    // callback(null, waterfallResult);
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