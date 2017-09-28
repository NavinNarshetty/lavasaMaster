module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    saveInTeam: function (req, res) {
        if (req.body) {
            async.waterfall([
                    function (callback) {
                        ConfigProperty.find().lean().exec(function (err, property) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(property)) {
                                    callback(null, []);
                                } else {
                                    console.log('controller property', property);
                                    callback(null, property);
                                }
                            }
                        });
                    },
                    function (property, callback) {
                        console.log('controller property', property);
                        req.body.property = property[0];
                        TeamSport.saveInTeam(req.body, function (err, teamData) {
                            if (err) {
                                console.log("err", err);
                                callback("There was an error ", null);
                            } else {
                                if (_.isEmpty(teamData)) {
                                    callback("No data found", null);
                                } else {
                                    callback(null, teamData);
                                }
                            }
                        });

                    }
                ],
                function (err, data2) {
                    res.callback(null, data2)
                });
        } else {
            res.json({
                value: false,
                data: "User Not logged in"
            });
        }

    },

    teamConfirm: function (req, res) {
        async.waterfall([
                function (callback) {
                    ConfigProperty.find().lean().exec(function (err, property) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(property)) {
                                callback(null, []);
                            } else {
                                callback(null, property);
                            }
                        }
                    });
                },
                function (property, callback) {
                    if (req.body.schoolToken) {
                        if (property[0].institutionType == "school") {
                            req.body.createdBy = "School";
                        } else {
                            req.body.createdBy = "College";
                        }
                        Registration.findOne({
                            accessToken: req.body.schoolToken
                        }).exec(function (err, found) {
                            if (err) {
                                res.json({
                                    value: false,
                                    data: "Incorrect Login Details"
                                });
                            } else if (_.isEmpty(found)) {
                                // callback("Incorrect Login Details", null);
                                res.json({
                                    value: false,
                                    data: "Incorrect Login Details"
                                });
                            } else {
                                req.body.schoolSFA = found.sfaID;
                                req.body.schoolName = found.schoolName;
                                req.school = found._id;
                                TeamSport.teamConfirm(req.body, res.callback);
                            }
                        });
                    } else if (req.body.athleteToken) {
                        req.body.createdBy = "Athlete";
                        TeamSport.teamConfirmAthlete(req.body, res.callback);
                    } else {
                        res.json({
                            value: false,
                            data: "User Not logged in"
                        });
                    }

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

    },

    rejectionTeam: function (req, res) {
        if (req.body) {
            TeamSport.rejectionTeam(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "User Not logged in"
            });
        }

    },

    search: function (req, res) {
        if (req.body) {
            TeamSport.search(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "User Not logged in"
            });
        }

    },

    generateExcel: function (req, res) {
        TeamSport.generateExcel(res);
    },

    editTeam: function (req, res) {
        if (req.body) {
            TeamSport.editTeam(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "User Not logged in"
            });
        }

    },

    editSaveTeam: function (req, res) {
        async.waterfall([
                function (callback) {
                    ConfigProperty.find().lean().exec(function (err, property) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(property)) {
                                callback(null, []);
                            } else {
                                callback(null, property);
                            }
                        }
                    });
                },
                function (property, callback) {
                    req.body.property = property[0];
                    if (req.body.schoolToken) {
                        // req.body.createdBy = "School";
                        Registration.findOne({
                            accessToken: req.body.schoolToken
                        }).exec(function (err, found) {
                            if (err) {
                                res.json({
                                    value: false,
                                    data: "Incorrect Login Details"
                                });
                            } else if (_.isEmpty(found)) {
                                // callback("Incorrect Login Details", null);
                                res.json({
                                    value: false,
                                    data: "Incorrect Login Details"
                                });
                            } else {
                                req.body.schoolSFA = found.sfaID;
                                // req.body.schoolName = found.schoolName;
                                // req.school = found._id;
                                TeamSport.editSaveTeam(req.body, res.callback);
                            }
                        });
                    } else if (req.body.athleteToken) {
                        req.body.createdBy = "Athlete";
                        TeamSport.editteamAthlete(req.body, res.callback);
                    } else {
                        res.json({
                            value: false,
                            data: "User Not logged in"
                        });
                    }
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


    },




};
module.exports = _.assign(module.exports, controller);