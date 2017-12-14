var schema = new Schema({
    schoolId: {
        type: Schema.Types.ObjectId,
        ref: 'Registration'
    },
    schoolName: String,
    totalStrength: Number,
    maleCount: Number,
    femaleCount: Number,
    genderRatio: String,
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
    // highestParticipation: [{
    //     name: String,
    //     count: Number
    // }],
    // lowestParticipation: [{
    //     name: String,
    //     count: Number
    // }],

    highestParticipation:[{
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
    lowestParticipation:[{
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

    getOneReportCard:function(data,callback){
        var matchObj={
            "schoolName":data.name
        }

        Reportcard.findOne(matchObj).exec(function(err,result){
            if(err){
                callback(err,null);
            }else if(!_.isEmpty(result)){
                callback(null,result);
            }else{
                callback("No Data Found",null);
            }
        });
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
                    // console.log("-------------------------");
                    obj.sport = _(obj.arr)
                        .groupBy('sportsListSubCategory.name')
                        .map(function (values, key1) {
                            var returnObj = {};
                            returnObj.sportName = key1;
                            returnObj.subCategoryId = values[0].sportsListSubCategory._id;
                            // console.log("values====================================================================",values);
                            returnObj.totalStrength = values.length;
                            var noShow = _.remove(values, function (n) {
                                return n.noShow == true;
                            });
                            // console.log("noShow",noShow);
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

                            // console.log(returnObj.malePercent, returnObj.femalePercent);

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
                                "femaleCount": 0
                            };

                            _.each(matchedObjs, function (n) {
                                addObj.subCategoryId = n.subCategoryId;
                                addObj.totalStrength += n.totalStrength;
                                addObj.maleCount += n.maleCount;
                                addObj.femaleCount += n.femaleCount;
                                n.removeThis = true;
                            });

                            addObj.malePercent = _.round(addObj.maleCount / (addObj.maleCount + addObj.femaleCount) * 100);
                            addObj.femalePercent = _.round(addObj.femaleCount / (addObj.maleCount + addObj.femaleCount) * 100);
                            // console.log(addObj.malePercent, addObj.femalePercent);
                            if (_.isNaN(addObj.malePercent)) {
                                addObj.malePercent = 0;
                            }
                            if (_.isNaN(addObj.femalePercent)) {
                                addObj.femalePercent = 0;
                            }

                            obj.sport.push(addObj);

                        }

                        // console.log("matchedObjs", matchedObjs);
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
                    // console.log("obj.sport",obj.sport);
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
                var low = obj.lowestParticipation =  _.orderBy(obj.sport, 'totalStrength', ['asc']);
                console.log("obj.highestParticipation",obj.highestParticipation);
                console.log("obj.lowestParticipation",obj.lowestParticipation);
                callback(obj);
            })

        };

        // async.cobn
        Registration.find({
            'status': "Verified"
        }, "_id schoolName").exec(function (err, schoolsList) {
            async.concatLimit(schoolsList, 1, function (school, callback) {
                var saveObj = {};
                saveObj.schoolName = school.schoolName;
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
                                        callback(err, null);
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
                                        callback(err, null);
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
                            // console.log("array hai",arr.length);
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
                                // console.log("singleData.sportsListSubCategory.name", singleData)
                                // console.log("resultVar", resultVar);
                                matchObj[resultVar.opponentsVar] = singleData._id;
                                var pullProperties = resultVar.resultVar + " " + "excelType";
                                // console.log("pullProperties",pullProperties);
                                Match.findOne(matchObj, pullProperties).lean().exec(function (err, result) {
                                    if (err) {
                                        callback(err, null);
                                    } else if (!_.isEmpty(result)) {

                                        if (result[resultVar.resultVar]) {
                                            console.log("----");
                                            var findByKey = '';
                                            var noShow = function (obj) {
                                                // console.log("obj",obj);
                                                if (!_.isEmpty(obj)) {
                                                    singleData.noShow = obj.noShow;
                                                } else {
                                                    singleData.delete = true;
                                                }
                                            };
                                            switch (singleData.sportsListSubCategory.type) {
                                                case 'Combat Sports':
                                                case 'Racquet Sports':
                                                case 'Team Sports':
                                                    findByKey = 'player';
                                                    break;
                                                case 'Individual Sports':
                                                    findByKey = 'id';
                                                    if (singleData.sportsListSubCategory.name == "Carrom") {
                                                        findByKey = 'player';
                                                    } else if (singleData.sportsListSubCategory.name == "Chess") {
                                                        noShow = function (obj) {
                                                            if (singleData.sportsListSubCategory.type == "Combat Sports") {
                                                                // console.log("obj",obj);
                                                            }

                                                            if (obj.score && obj.rank) {
                                                                singleData.noShow = true;
                                                            } else {
                                                                singleData.delete = true;
                                                            }
                                                        }
                                                    }
                                                    break;
                                                case 'Aquatics Sports':
                                                    break;
                                                case 'Target Sports':
                                                    if (singleData.sportsListSubCategory.name == "Archery") {
                                                        if (result.excelType == 'qualifying') {
                                                            findByKey = 'id';
                                                            resultVar['resultVar'] = resultVar.resultVar1;
                                                        } else if (result.excelType == 'knockout') {
                                                            findByKey = 'player';
                                                            resultVar['resultVar'] = resultVar.resultVar2;
                                                        }
                                                    }
                                                    break;
                                            }
                                            // console.log("result[resultVar.opponentsVar]",result[resultVar.opponentsVar]);

                                            if (resultVar.opponentsVar == 'opponentsSingle') {
                                                if (singleData.sportsListSubCategory.name != "Shooting") {
                                                    var obj = _.find(result[resultVar.resultVar].players, [findByKey, singleData.athleteId._id.toString()]);
                                                    noShow(obj);
                                                    callback();
                                                } else {
                                                    noShow(result[resultVar.resultVar]);
                                                    callback();
                                                }
                                            } else if (resultVar.opponentsVar == 'opponentsTeam') {
                                                var sendObj = {};
                                                _.each(result[resultVar.resultVar].teams, function (n) {
                                                    if (_.findIndex(n.players, [findByKey, singleData.athleteId._id.toString()]) != -1) {
                                                        sendObj = n
                                                    }
                                                });
                                                noShow(sendObj);
                                                callback();
                                            }
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
                            // console.log(null,parallelResult)
                            callback(null, parallelResult);
                        })

                    },
                    function (parallelResult, callback) {
                        // console.log("before",parallelResult.length);
                        _.remove(parallelResult, function (n) {
                            return n.delete == true;
                        });
                        // console.log("after",parallelResult.length);                        
                        var obj = {
                            "name": school.schoolName,
                            "arr": parallelResult
                        }
                        calTotalAth(_.cloneDeep(obj), function (data) {
                            saveObj.totalStrength = data.totalStrength;
                            saveObj.maleCount = data.maleCount;
                            saveObj.femaleCount = data.femaleCount;
                            saveObj.genderRatio = data.genderRatio;
                            callback(null, obj);
                        });
                    },
                    function (mainObj, callback) {
                        // console.log("mainObj",mainObj);
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
                                    // saveObj.nonParticipatedSport=_.difference(data.totalSportArr,saveObj.participatedSport);
                                }
                                callback(null, saveObj);
                            });

                        });
                    },
                ], function (err, waterfallResult) {
                    //waterfall callback
                    callback(null, waterfallResult);
                    // save and update
                    // Reportcard.findOne({
                    //     "schoolName": saveObj.schoolName
                    // }).exec(function (err, found) {
                    //     function save() {
                    //         Reportcard.saveData(saveObj, function (err, data) {
                    //             var obj = {};
                    //             if (err) {
                    //                 console.log("err", err);
                    //                 obj.messege = "Error While Saving";
                    //             } else {
                    //                 obj.messege = "Successfully Saved";
                    //             }
                    //             callback(null, obj);
                    //         })
                    //     }
                    //     if (err) {
                    //         console.log("err while finding school");
                    //         callback(err, null);
                    //     } else if (!_.isEmpty(found)) {
                    //         saveObj._id = found
                    //         save();
                    //     } else {
                    //         save();
                    //     }
                    // });
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