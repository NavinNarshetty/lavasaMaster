module.exports = _.cloneDeep(require("sails-wohlig-controller"));

var controller = {
    getAll: function (req, res) {
        Weight.getAll(req.body, res.callback);
    },

    getWeightsByEvent: function(req,res){
        if(req.body && req.body.sportslist && req.body.ageGroup && req.body.gender){
            var matchObj = {
                "sportslist":req.body.sportslist,
                "ageGroup":req.body.ageGroup,
                "gender":req.body.gender
            }
            Weight.getWeightsByEvent(matchObj,res.callback);

        }else{

        }
    },

    getWeightPerSportslist: function (req, res) {
        Weight.getWeightPerSportslist(req.body, res.callback);
    },

    getAthletesByEvent: function (req, res) {
        if (req.body) {
            if (req.body && req.body.sport) {
                var matchObj = {
                    "_id": req.body.sport
                }

                if (req.body.weight) {
                    matchObj = req.body.weight;
                }

                var sendObj = {};
                async.waterfall([
                    function (callback) {
                        Sport.findOne(matchObj, "ageGroup sportslist gender").deepPopulate("ageGroup sportslist sportslist.sportsListSubCategory").lean().exec(function (err, data) {
                            if(err){
                                callback(err,null);
                            }else if(!_.isEmpty(data)){
                                sendObj.oldSportId = data._id;
                                sendObj.ageGroup = data.ageGroup;
                                sendObj.sportslist = data.sportslist;
                                sendObj.gender = data.gender;
                                callback();
                            }else{
                                callback("Sport Not Found",null);
                            }
                        });
                    },
                    function (callback) {
                        Weight.getAthletesByEvent({
                            "sport": sendObj.oldSportId
                        }, function (err, athletes) {
                            if (err) {
                                res.json({
                                    data: err,
                                    value: false
                                });
                            } else if (!_.isEmpty(athletes)) {
                                sendObj.athletes = athletes;
                                callback(null, sendObj);
                            } else {
                                res.json({
                                    data: "No Athletes Found",
                                    value: false
                                });
                            }
                        });
                    }
                ], function (err, data) {
                    res.callback(null, data);
                });
            } else {
                res.json({
                    data: "Some Fields are Missing",
                    value: false
                });
            }
        } else {
            res.json({
                data: "Body Not Found",
                value: false
            });
        }
    },

    generateMatches: function (req, res) {
        if (req.body && req.body.range && req.body.prefix && req.body.sport && req.body.rounds) {


            async.waterfall([
                function (callback) {
                    var arr = [];
                    var totalMatches;
                    var range = req.body.range;
                    while (range != 1) {
                        arr.push(range);
                        range = range / 2;
                    }
                    totalMatches = _.sum(arr);
                    arr.push(1);
                    if (req.body.thirdPlace) {
                        totalMatches = totalMatches + 2;
                        arr.push(1);
                        req.body.rounds+=",Third Place";
                    } else {
                        totalMatches = totalMatches + 1;
                    }
                    callback(null, arr, totalMatches);
                },

                function (arr, totalMatches, callback) {
                    var roundListNames = _.split(req.body.rounds, ',');
                    var roundListNames = _.map(roundListNames, function (n) {
                        return Athelete.toTitleCase(_.trim(n));
                    });         
                    if (arr.length == roundListNames.length) {
                        var sendArr = [];
                        async.eachOfSeries(arr, function (item, index, callback) {
                            async.timesSeries(item, function(n, next) {
                                var sendObj = {
                                    "matchId": req.body.prefix,
                                    "round": roundListNames[index],
                                    "sport": req.body.sport,
                                    "opponentsSingle": [],
                                    "opponentsTeam": []
                                }
                                Match.saveMatch(sendObj, function (err, data) {
                                    next(null, data);
                                });
                            }, function(err, result) {
                                sendArr.push(result);
                                callback();
                            });

                        }, function (err) {
                            if (err) {
                                callback(err, null);
                            } else {
                                // callback(null,{
                                //     "arr":arr,
                                //     "totalMatches":totalMatches,
                                //     "roundListNames":roundListNames
                                // });
                                callback(null, sendArr);
                            }
                        })
                        // callback(null,{
                        //     "arr":arr,
                        //     "totalMatches":totalMatches,
                        //     "roundListNames":roundListNames
                        // });
                    } else {
                        callback("Rounds Names Dont match Range", null);
                    }

                },

                function(result,callback){
                    var matchObj ={
                        "sport":req.body.sport,
                        "range":req.body.range,
                        "isLeagueKnockout":false
                    }

                    if(req.body.thirdPlace){
                        matchObj.thirdPlace = "yes";
                    }

                    Match.addPreviousMatch(matchObj,function(err,data){
                        console.log("err,data",err,data);
                        if(err){
                            callback(err,null);
                        }else{
                            callback(null,data);
                        }
                    });
                }
            ], function (err, result) {
                if (err) {
                    res.callback(err, null);
                } else {
                    res.callback(null, result);
                }
            });
        } else {
            res.json({
                data: "Insufficient Data",
                value: false
            });
        }
    },

    toUpper:function(req,res){
        res.callback(null,Athelete.toTitleCase(req.body.str));
    }

   


};
module.exports = _.assign(module.exports, controller);