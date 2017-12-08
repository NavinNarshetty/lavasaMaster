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
        sportId: {
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
    highestParticipation: Number,
    lowestParticipation: Number,
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
    generateReportCard: function (fcallback) {

        // async.cobn
        Registration.find({'status':"Verified"}, "_id schoolName").exec(function (err, schoolsList) {
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
                                    $project: {
                                        // specifications
                                        "_id": "$_id",
                                        "sportsListSubCategory.name": "$sportsListSubCategory.name",
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
                                        "sportsListSubCategory.name": "$sport.sportslist.sportsListSubCategory.name",
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
                            arr = parallelResult[0].concat(parallelResult[1]);
                            // console.log("array hai",arr.length);
                            callback(null, arr);
                        });
                    },
                    function (parallelResult, callback) {
                        callback(null, parallelResult);
                    },
                    function (parallelResult, callback) {
                        var obj = {
                            "name": school.schoolName,
                            "arr": parallelResult
                        }
                        Reportcard.calTotalAth(_.cloneDeep(obj), function (data) {
                            saveObj.totalStrength = data.totalStrength;
                            saveObj.maleCount = data.maleCount;
                            saveObj.femaleCount = data.femaleCount;
                            saveObj.genderRatio = data.genderRatio;
                            callback(null, obj);
                        });
                    },function(mainObj,callback){
                        console.log("mainObj",mainObj);
                        callback(null,mainObj);
                    },
                ], function (err, waterfallResult) {
                    //waterfall callback
                    Reportcard.findOne({
                        "schoolName": saveObj.schoolName
                    }).exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else if (!_.isEmpty(found)) {
                            saveObj._id = found
                        }
                        Reportcard.saveData(saveObj, function (err, data) {
                            var obj = {};
                            if (err) {
                                obj.messege = "Error While Saving";
                            } else {
                                obj.messege = "Successfully Saved";
                            }
                            callback(null, obj);
                        })
                    });
                });
            }, function (err, result) {
                //concatLimit callback
                if (err) {
                    fcallback(err, null);
                } else {
                    fcallback(null, result);
                }
            })
        })
    },

    tp: function (callback) {
        async.parallel([
                function (callback) {
                    setTimeout(function () {
                        callback(null, [{
                            "one": "one"
                        }, {
                            "one": "one"
                        }]);
                    }, 200);
                },
                function (callback) {
                    setTimeout(function () {
                        callback(null, [{
                            'two': 'two'
                        }, {
                            'two': 'two'
                        }]);
                    }, 100);
                }
            ],
            // optional callback
            function (err, results) {
                callback(null, results);
                // the results array will equal ['one','two'] even though
                // the second function had a shorter timeout.
            });
    },

    calTotalAth: function (obj, callback) {
        
        var returnObj = {};
        returnObj.maleCount = 0;
        returnObj.femaleCount = 0;
        returnObj.genderRatio="0:0";
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
        } else if(obj.arr['male']){
            returnObj.maleCount = obj.arr['male'].length;
            returnObj.genderRatio = "1:0";
            callback(returnObj);
        } else if(obj.arr['female']){
            returnObj.femaleCount = obj.arr['female'].length;
            returnObj.genderRatio = "0:1";          
            callback(returnObj);
        }else{          
            callback(returnObj);
        }
    }
};
module.exports = _.assign(module.exports, exports, model);