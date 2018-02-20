module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    getAllTeam: function (req, res) {
        if (req.body) {
            OldSport.getAllTeam(req.body, res.callback);
        } else {
            res.json({
                "data": "Data not Found",
                "value": false
            })
        }
    },

    saveAgeWithoutId: function (req, res) {
        if (req.body) {
            OldSport.saveAgeWithoutId(req.body, res.callback);
        } else {
            res.json({
                "data": "Data not Found",
                "value": false
            })
        }
    },

    getAllTarget: function (req, res) {
        if (req.body) {
            OldSport.getAllTarget(req.body, res.callback);
        } else {
            res.json({
                "data": "Data not Found",
                "value": false
            })
        }
    },

    getAllRacquet: function (req, res) {
        if (req.body) {
            async.waterfall([
                function (callback) {
                    OldSport.getAllRacquetSingle(req.body, function (err, category) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(category)) {
                                callback(null, []);
                            } else {
                                callback(null, category);
                            }
                        }
                    });
                },
                function (category, callback) {
                    OldSport.getAllRacquetDouble(req.body, function (err, category) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(category)) {
                                callback(null, []);
                            } else {
                                callback(null, category);
                            }
                        }
                    });
                },
            ], function (err, found) {
                res.callback(null, found);
            });

        } else {
            res.json({
                "data": "Data not Found",
                "value": false
            })
        }
    },

    getAllAcquatics: function (req, res) {
        if (req.body) {
            OldSport.getAllAcquatics(req.body, res.callback);
        } else {
            res.json({
                "data": "Data not Found",
                "value": false
            })
        }
    },

    getAllIndividual: function (req, res) {
        if (req.body) {
            OldSport.getAllIndividual(req.body, res.callback);
        } else {
            res.json({
                "data": "Data not Found",
                "value": false
            })
        }
    },

    getAllCombat: function (req, res) {
        if (req.body) {
            OldSport.getAllCombat(req.body, res.callback);
        } else {
            res.json({
                "data": "Data not Found",
                "value": false
            })
        }
    },

    setCombat: function (req, res) {
        if (req.body) {
            async.waterfall([
                function (callback) {
                    OldSport.getAllFencing(req.body, function (err, category) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(category)) {
                                callback(null, []);
                            } else {
                                callback(null, category);
                            }
                        }
                    });
                },
                function (category, callback) {
                    OldSport.getAllKata(req.body, function (err, category) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(category)) {
                                callback(null, []);
                            } else {
                                callback(null, category);
                            }
                        }
                    });
                },
                function (category, callback) {
                    OldSport.getAllKumite(req.body, function (err, category) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(category)) {
                                callback(null, []);
                            } else {
                                callback(null, category);
                            }
                        }
                    });
                },
                function (category, callback) {
                    OldSport.getAllJudo(req.body, function (err, category) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(category)) {
                                callback(null, []);
                            } else {
                                callback(null, category);
                            }
                        }
                    });
                },
                function (category, callback) {
                    OldSport.getAllBoxing(req.body, function (err, category) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(category)) {
                                callback(null, []);
                            } else {
                                callback(null, category);
                            }
                        }
                    });
                },
                function (category, callback) {
                    OldSport.getAllSportsMMA(req.body, function (err, category) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(category)) {
                                callback(null, []);
                            } else {
                                callback(null, category);
                            }
                        }
                    });
                },
                function (category, callback) {
                    OldSport.getAllTaekwondo(req.body, function (err, category) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(category)) {
                                callback(null, []);
                            } else {
                                callback(null, category);
                            }
                        }
                    });
                },
            ], function (err, found) {
                res.callback(null, found);
            });
            // OldSport.getAllKata(req.body, res.callback);
        } else {
            res.json({
                "data": "Data not Found",
                "value": false
            })
        }
    }

};
module.exports = _.assign(module.exports, controller);