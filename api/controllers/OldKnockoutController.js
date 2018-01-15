module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    getAllIndividual: function (req, res) {
        if (req.body) {
            // async.waterfall([
            //         function (callback) {
            OldKnockout.getAllPlayer(req.body, function (err, athelete) {
                if (err) {
                    callback(err, null);
                } else {
                    if (_.isEmpty(athelete)) {
                        var err = {
                            error: "no athelete",
                            data: athelete
                        }
                        res.callback(null, err);
                    } else {
                        res.callback(null, athelete);
                    }
                }
            });
            //     },
            //     function (found, callback) {
            //         OldKnockout.getAllPlayer2(req.body, function (err, athelete) {
            //             if (err) {
            //                 callback(err, null);
            //             } else {
            //                 if (_.isEmpty(athelete)) {
            //                     var err = {
            //                         error: "no athelete",
            //                         data: athelete
            //                     }
            //                     callback(null, err);
            //                 } else {
            //                     callback(null, athelete);
            //                 }
            //             }
            //         });
            //     }
            // ],
            // function (err, found) {
            //     res.callback(null, found);
            // });
            // OldKnockout.getAllIndividual(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    getAllTeam: function (req, res) {
        if (req.body) {
            async.waterfall([
                    function (callback) {
                        OldKnockout.getAllTeam1(req.body, function (err, athelete) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(athelete)) {
                                    var err = {
                                        error: "no athelete",
                                        data: athelete
                                    }
                                    callback(null, err);
                                } else {
                                    callback(null, athelete);
                                }
                            }
                        });
                    },
                    function (found, callback) {
                        OldKnockout.getAllTeam2(req.body, function (err, athelete) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(athelete)) {
                                    var err = {
                                        error: "no athelete",
                                        data: athelete
                                    }
                                    callback(null, err);
                                } else {
                                    callback(null, athelete);
                                }
                            }
                        });
                    }
                ],
                function (err, found) {
                    res.callback(null, found);
                });
            // OldKnockout.getAllIndividual(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    saveKnockoutMatch: function (req, res) {
        if (req.body) {
            async.waterfall([
                    function (callback) {
                        OldKnockout.saveKnockoutMatchIndividual(req.body, function (err, matchData) {
                            callback(null, matchData);
                        });
                    },
                    function (importData, callback) {
                        OldKnockout.saveKnockoutMatchTeam(req.body, function (err, matchData) {
                            callback(null, matchData);
                        });
                    }
                ],
                function (err, results) {
                    if (err) {
                        res.callback(err, null);
                    } else {
                        res.callback(null, results);
                    }
                });
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },
};
module.exports = _.assign(module.exports, controller);