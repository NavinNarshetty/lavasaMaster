module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

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
        console.log('******req.body******', req.body);
        if (req.body.resultType && req.body.matchId || req.body.thirdPlace || req.body.range) {
            async.waterfall([
                    function (callback) {
                        Config.importGS(req.body.file, function (err, importData) {
                            if (err || _.isEmpty(importData)) {
                                callback(err, null);
                            } else {
                                callback(null, importData);
                            }
                        });
                    },
                    function (importData, callback) {
                        if (req.body.resultType == "knockout" || req.body.excelType == 'knockout') {
                            var excelLength = importData.length;
                            var range = req.body.range;
                            var sum = 0;
                            while (range >= 1) {
                                sum = parseInt(sum) + range;
                                range = range / 2;
                            }
                            if (req.body.thirdPlace == "yes") {
                                sum = sum + 1;
                            }
                            if (excelLength == sum) {
                                req.body.rangeTotal = sum;
                                callback(null, importData);
                            } else {
                                var resData = [];
                                var obj = {};
                                err = "excel row do not match with selected range";
                                obj.error = err;
                                obj.success = importData;
                                resData.push(obj);
                                callback(null, resData);
                            }
                        } else {
                            callback(null, importData);
                        }

                    },
                    function (importData, callback) {
                        if (importData[0].error) {
                            callback(null, importData);
                        } else {
                            if (req.body.resultType == "knockout" && req.body.playerType == "individual") {
                                // var header = [];
                                // var headerFlag = 0;
                                // header.push("DATE");
                                // header.push("TIME");
                                // header.push("EVENT");
                                // header.push("AGE GROUP");
                                // header.push("GENDER");
                                // header.push("WEIGHT CATEGORIES");
                                // header.push("SPORT");
                                // header.push("SFAID 1");
                                // header.push("ROUND NAME");
                                // _.each(header, function (n) {
                                //     if (_.has(importData[0], n) == true) {
                                //         headerFlag++;
                                //     }
                                // });
                                // if (headerFlag == header.length) {
                                Match.saveKnockoutIndividual(importData, req.body, function (err, complete) {
                                    if (err || _.isEmpty(complete)) {
                                        callback(err, null);
                                    } else {
                                        callback(null, complete);
                                    }
                                });
                                // } else {
                                //     console.log("indise false knockout");
                                //     callback(null, [{
                                //         error: "Headers may have wrong values. Follow Headers Below !",
                                //         success: header
                                //     }]);
                                // }
                            } else if (req.body.resultType == "knockout" && req.body.playerType == "team") {
                                // var header = [];
                                // var headerFlag = 0;
                                // header.push("DATE");
                                // header.push("TIME");
                                // header.push("EVENT");
                                // header.push("AGE GROUP");
                                // header.push("GENDER");
                                // header.push("WEIGHT CATEGORIES");
                                // header.push("SPORT");
                                // header.push("TEAMID 1");
                                // header.push("ROUND NAME");
                                // _.each(header, function (n) {
                                //     if (_.has(importData[0], n) == true) {
                                //         headerFlag++;
                                //     }
                                // });
                                // if (headerFlag == header.length) {
                                Match.saveKnockoutTeam(importData, req.body, function (err, complete) {
                                    if (err || _.isEmpty(complete)) {
                                        callback(err, null);
                                    } else {
                                        callback(null, complete);
                                    }
                                });
                                // } else {
                                //     callback(null, [{
                                //         error: "Headers may have wrong values. Follow Headers Below !",
                                //         success: header
                                //     }]);
                                // }
                            } else if (req.body.resultType == "heat" && req.body.playerType == "individual") {
                                // var header = [];
                                // var headerFlag = 0;
                                // header.push("DATE");
                                // header.push("EVENT ");
                                // header.push("AGE GROUP");
                                // header.push("GENDER");
                                // header.push("SPORT");
                                // header.push("SFA ID");
                                // header.push("ROUND ");
                                // header.push("HEAT NUMBER");
                                // header.push("LANE NUMBER");

                                // _.each(header, function (n) {
                                //     // var header = _.has(importData[0], n);
                                //     if (_.has(importData[0], n) == true) {
                                //         headerFlag++;
                                //     }
                                // });
                                // if (headerFlag == header.length) {
                                var roundTypes = _.groupBy(importData, 'ROUND ');
                                _.each(roundTypes, function (roundType, key) {
                                    roundTypes[key] = _.groupBy(roundType, 'HEAT NUMBER');
                                    // console.log(heatType, "---------------------");
                                });
                                Match.saveHeatIndividual(roundTypes, req.body, function (err, complete) {
                                    if (err || _.isEmpty(complete)) {
                                        callback(err, null);
                                    } else {
                                        callback(null, complete);
                                    }
                                });
                                // } else {
                                //     callback(null, [{
                                //         error: "Headers may have wrong values. Follow Headers Below !",
                                //         success: header
                                //     }]);
                                // }
                            } else if (req.body.resultType == "heat" && req.body.playerType == "team") {
                                // var header = [];
                                // var headerFlag = 0;
                                // header.push("DATE");
                                // header.push("EVENT ");
                                // header.push("AGE GROUP");
                                // header.push("GENDER");
                                // header.push("SPORT");
                                // header.push("TEAM ID");
                                // header.push("ROUND ");
                                // header.push("HEAT NUMBER");
                                // header.push("LANE NUMBER");

                                // _.each(header, function (n) {
                                //     if (_.has(importData[0], n) == true) {
                                //         headerFlag++;
                                //     }
                                // });
                                // if (headerFlag == header.length) {
                                var roundTypes = _.groupBy(importData, 'ROUND ');
                                console.log(roundTypes, "Before---------------------");
                                _.each(roundTypes, function (roundType, key) {
                                    roundTypes[key] = _.groupBy(roundType, 'HEAT NUMBER');
                                    console.log(roundTypes, "After---------------------");
                                });
                                Match.saveHeatTeam(roundTypes, req.body, function (err, complete) {
                                    if (err || _.isEmpty(complete)) {
                                        callback(err, null);
                                    } else {
                                        callback(null, complete);
                                    }
                                });
                                // } else {
                                //     callback(null, [{
                                //         error: "Headers may have wrong values. Follow Headers Below !",
                                //         success: header
                                //     }]);
                                // }
                            } else if (req.body.resultType == "qualifying-round") {
                                // var header = [];
                                // var headerFlag = 0;
                                // header.push("DATE");
                                // header.push("TIME");
                                // header.push('EVENT ');
                                // header.push("AGE GROUP");
                                // header.push("GENDER");
                                // header.push("WEIGHT CATEGORIES");
                                // header.push("SPORT");
                                // header.push("SFA ID");
                                // header.push("ROUND");
                                // _.each(header, function (n) {
                                //     if (_.has(importData[0], n) == true) {
                                //         headerFlag++;
                                //     }
                                // });
                                // if (headerFlag == header.length) {
                                Match.saveQualifyingRoundIndividual(importData, req.body, function (err, complete) {
                                    if (err || _.isEmpty(complete)) {
                                        callback(err, null);
                                    } else {
                                        callback(null, complete);
                                    }
                                });
                                // } else {
                                //     callback(null, [{
                                //         error: "Headers may have wrong values. Follow Headers Below !",
                                //         success: header
                                //     }]);
                                // }
                            } else if (req.body.resultType == "qualifying-knockout" && req.body.excelType == "qualifying") {
                                // var header = [];
                                // var headerFlag = 0;
                                // header.push("DATE");
                                // header.push("TIME");
                                // header.push('EVENT ');
                                // header.push("AGE GROUP");
                                // header.push("GENDER");
                                // // header.push("WEIGHT CATEGORIES");
                                // header.push("SPORT");
                                // header.push("SFA ID");
                                // header.push("ROUND ");
                                // _.each(header, function (n) {
                                //     if (_.has(importData[0], n) == true) {
                                //         headerFlag++;
                                //     }
                                // });
                                // if (headerFlag == header.length) {
                                Match.saveQualifyingIndividual(importData, req.body, function (err, complete) {
                                    if (err || _.isEmpty(complete)) {
                                        callback(err, null);
                                    } else {
                                        callback(null, complete);
                                    }
                                });
                                // } else {
                                //     callback(null, [{
                                //         error: "Headers may have wrong values. Follow Headers Below !",
                                //         success: header
                                //     }]);
                                // }
                            } else if (req.body.resultType == "qualifying-knockout" && req.body.excelType == "knockout") {
                                // var header = [];
                                // var headerFlag = 0;
                                // header.push("DATE");
                                // header.push("TIME");
                                // header.push('EVENT ');
                                // header.push("AGE GROUP");
                                // header.push("GENDER");
                                // // header.push("WEIGHT CATEGORIES");
                                // header.push("SPORT");
                                // header.push("SFA ID");
                                // header.push("ROUND ");
                                // _.each(header, function (n) {
                                //     if (_.has(importData[0], n) == true) {
                                //         headerFlag++;
                                //     }
                                // });
                                // if (headerFlag == header.length) {
                                Match.saveKnockoutIndividual(importData, req.body, function (err, complete) {
                                    if (err || _.isEmpty(complete)) {
                                        callback(err, null);
                                    } else {
                                        callback(null, complete);
                                    }
                                });
                                // } else {
                                //     callback(null, [{
                                //         error: "Headers may have wrong values. Follow Headers Below !",
                                //         success: header
                                //     }]);
                                // }
                            } else {
                                callback(null, importData);
                            }
                        }
                    }
                ],
                function (err, results) {
                    // console.log("results", results);
                    if (err || _.isEmpty(results)) {
                        res.callback(results, null);
                    } else {
                        res.callback(null, results);
                    }
                });
        } else {
            var data = [{
                error: "All Fields Required !"
            }];
            res.callback(null, data);
        }
    },

    generateBlankExcel: function (req, res) {
        req.body.match = "blank";
        if (req.body) {
            Match.generateBlankExcel(req.body, res);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
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

    updateExcelMatch: function (req, res) {
        if (req.body) {
            async.waterfall([
                    function (callback) {
                        Config.importGS(req.body.file, function (err, importData) {
                            if (err || _.isEmpty(importData)) {
                                callback(err, null);
                            } else {
                                callback(null, importData);
                            }
                        });
                    },
                    function (importData, callback) {
                        if (importData[0].error) {
                            callback(null, importData);
                        } else {
                            if (req.body.resultType == "heat" && req.body.playerType == "individual") {
                                var roundTypes = _.groupBy(importData, 'ROUND ');
                                _.each(roundTypes, function (roundType, key) {
                                    roundTypes[key] = _.groupBy(roundType, 'HEAT NUMBER');
                                });
                                Match.UpdateHeatIndividual(roundTypes, function (err, complete) {
                                    if (err || _.isEmpty(complete)) {
                                        callback(err, null);
                                    } else {
                                        callback(null, complete);
                                    }
                                });
                            } else if (req.body.resultType == "heat" && req.body.playerType == "team") {
                                var roundTypes = _.groupBy(importData, 'ROUND ');
                                _.each(roundTypes, function (roundType, key) {
                                    roundTypes[key] = _.groupBy(roundType, 'HEAT NUMBER');
                                });
                                Match.UpdateHeatTeam(roundTypes, function (err, complete) {
                                    if (err || _.isEmpty(complete)) {
                                        callback(err, null);
                                    } else {
                                        callback(null, complete);
                                    }
                                });
                            } else if (req.body.resultType == "qualifying-round" && req.body.playerType == "individual") {
                                Match.updateQualifyingRoundIndividual(importData, req.body, function (err, complete) {
                                    if (err || _.isEmpty(complete)) {
                                        callback(err, null);
                                    } else {
                                        callback(null, complete);
                                    }
                                });
                            } else if (req.body.resultType == "qualifying-knockout" && req.body.excelType == "qualifying") {
                                Match.updateQualifying(importData, req.body, function (err, complete) {
                                    if (err || _.isEmpty(complete)) {
                                        callback(err, null);
                                    } else {
                                        callback(null, complete);
                                    }
                                });
                            } else {
                                callback(null, importData);
                            }
                        }
                    }
                ],
                function (err, results) {
                    if (err || _.isEmpty(results)) {
                        res.callback(results, null);
                    } else {
                        res.callback(null, results);
                    }
                });
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            });
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
                        } else if (req.body.resultType == "qualifying-round") {
                            Match.generateExcelQualifyingRound(req.body, res);
                        } else if (req.body.resultType == "qualifying-knockout" && req.body.excelType == "qualifying") {
                            Match.generateExcelQualifying(req.body, res);
                        } else if (req.body.resultType == "qualifying-knockout" && req.body.excelType == "knockout") {
                            Match.generateExcelQualifyingKnockout(req.body, res);
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
    },

    getQuickSportId: function (req, res) {
        if (req.body) {
            if (req.body && req.body.sportslist && req.body.gender && req.body.ageGroup) {
                var matchObj = {
                    sportslist: req.body.sportslist,
                    gender: req.body.gender,
                    ageGroup: req.body.ageGroup,
                }
                if (!_.isEmpty(req.body.weight)) {
                    matchObj.weight = req.body.weight;
                }
                Match.getQuickSportId(matchObj, res.callback);
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

    getPerSport: function (req, res) {
        if (req.body) {
            if (req.body && req.body.sportslist && req.body.gender && req.body.ageGroup) {
                // var matchObj = {
                //     sportslist: req.body.sportslist,
                //     gender: req.body.gender,
                //     ageGroup: req.body.ageGroup,
                // }
                // if (!_.isEmpty(req.body.weight)) {
                //     matchObj.weight = req.body.weight;
                // }
                Match.getPerSport(req.body, res.callback);
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

    addPreviousMatch: function (req, res) {
        if (req.body) {
            Match.addPreviousMatch(req.body, res.callback);
        } else {
            res.json({
                "data": "Match Id not Found",
                "value": false
            })
        }
    },


};
module.exports = _.assign(module.exports, controller);