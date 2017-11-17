module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    searchAthlete: function (req, res) {
        if (req.body) {
            Profile.searchAthlete(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    searchSchool: function (req, res) {
        if (req.body) {
            Profile.searchSchool(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    searchTeam: function (req, res) {
        if (req.body) {
            Profile.searchTeam(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    getAthleteProfile: function (req, res) {
        if (req.body) {
            async.waterfall([
                    function (callback) {
                        if (!_.isEmpty(req.sfaId)) {
                            var matchObj = {
                                sfaId: "MA16" + req.body.sfaId
                            };
                        } else {
                            var matchObj = {
                                _id: req.body.athleteId
                            };
                        }
                        Athelete.findOne(matchObj).lean().exec(function (err, athlete) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(athlete)) {
                                    callback(null, []);
                                } else {
                                    callback(null, athlete);
                                }
                            }
                        });
                    },
                    function (athlete, callback) {
                        req.body.athleteId = athlete._id;
                        Profile.getAthleteProfile(req.body, res.callback);
                    }
                ],
                function (err, data2) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    } else {
                        callback(null, data2);
                    }

                });
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    getTeamProfile: function (req, res) {
        if (req.body) {
            Profile.getTeamProfile(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    getSchoolProfile: function (req, res) {
        if (req.body) {
            Profile.getSchoolProfile(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    getAthleteStats: function (req, res) {
        if (req.body) {
            Profile.getAthleteStats(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    getTeamStats: function (req, res) {
        if (req.body) {
            Profile.getTeamStats(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    getSchoolStats: function (req, res) {
        if (req.body) {
            Profile.getSchoolStats(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    getSchoolRank: function (req, res) {
        if (req.body) {
            Profile.getSchoolRank(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            });
        }
    },

    getSchoolPerChoice: function (req, res) {
        if (req.body.choice == "top20") {
            Profile.getTop20School(req.body, res.callback);
        } else if (req.body.choice == "all") {
            Profile.getAllRegisteredSchool(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            });
        }
    },

    getDrawFormats: function (req, res) {
        if (req.body) {
            async.concatSeries(req.body.sportsListSubCategory, function (sportName, callback) {
                SportsList.find({
                    sportsListSubCategory: sportName
                }).lean().deepPopulate("sportsListCategory drawFormat").exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(found)) {
                        callback(null, []);
                    } else {
                        callback(null, found);
                    }
                });
            }, function (err, complete) {
                res.callback(null, complete);
            });
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            });
        }
    },

    getSchoolAthlete: function (req, res) {
        if (req.body) {
            Profile.getSchoolAthlete(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            });
        }
    },


};
module.exports = _.assign(module.exports, controller);