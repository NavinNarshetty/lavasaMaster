module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    getOneMatch: function (req, res) {
        if (req.body) {
            Match.getOneMatch(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    getAll: function (req, res) {
        Match.getAll(req.body, res.callback);
    },

    getOne: function (req, res) {
        if (req.body && req.body.matchId) {
            Match.getOne(req.body, res.callback);
        } else {
            res.json({
                "data": "Match Id not Found",
                "value": false
            })
        }
    },

    saveMatch: function (req, res) {
        if (req.body) {
            Match.saveMatch(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    search: function (req, res) {
        if (req.body) {
            Match.search(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    uploadExcelMatch: function (req, res) {
        if (req.body.resultType && req.body.playerType && req.body.matchId || req.body.thirdPlace || req.body.range) {
            Match.uploadExcelMatch(req.body, res.callback);
        } else {
            var data = [{
                error: "All Fields Required !"
            }];
            res.callback(null, data);
        }
    },

    getSportId: function (req, res) {
        if (req.body) {
            Match.getSportId(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    updateResult: function (req, res) {
        if (req.body) {
            Match.updateResult(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    generateExcel: function (req, res) {
        async.waterfall([
                function (callback) {
                    var paramData = {};
                    paramData.name = req.body.sportslist.name;
                    paramData.age = req.body.ageGroup.name;
                    paramData.gender = req.body.gender;
                    Match.getSportId(paramData, function (err, sportData) {
                        if (err || _.isEmpty(sportData)) {
                            err = "Sport,Event,AgeGroup,Gender may have wrong values";
                            callback(null, {
                                error: err,
                                success: sportData
                            });
                        } else {
                            callback(null, sportData);
                        }
                    });
                },
                function (sportData, callback) {
                    if (sportData.error) {
                        res.json({
                            "data": sportData.error,
                            "value": false
                        })
                    } else {
                        console.log("sports", sportData);
                        req.body.sport = sportData.sportId;
                        if (req.body.resultType == "knockout") {
                            Match.generateExcelKnockout(req.body, res);
                        } else if (req.body.resultType == "heat") {
                            Match.generateExcelHeat(req.body, res);
                        } else {
                            res.json({
                                "data": "Body not Found",
                                "value": false
                            })
                        }
                    }
                }
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

    getSportSpecificRounds: function (req, res) {
        if (req.body) {
            console.log(req.body);
            if (req.body && req.body.sport) {
                Match.getSportSpecificRounds(req.body, res.callback);
            } else {
                res.json({
                    data: "Sport Not Found",
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

    knockoutMatchesByRound: function (req, res) {
        if (req.body) {
            if (req.body && req.body.round) {
                Match.knockoutMatchesByRound(req.body, res.callback);
            } else {
                res.json({
                    data: "Round Not Found",
                    value: false
                });
            }
        } else {
            res.json({
                data: "Body Not Found",
                value: false
            });
        }
    }


};
module.exports = _.assign(module.exports, controller);