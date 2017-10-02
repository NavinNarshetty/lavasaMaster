module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    getAllIndividual: function (req, res) {
        if (req.body) {
            async.waterfall([
                    function (callback) {
                        OldSwissLeague.getAllPlayer1(req.body, function (err, athelete) {
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
                        OldSwissLeague.getAllPlayer2(req.body, function (err, athelete) {
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
            // OldSwissLeague.getAllIndividual(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

};
module.exports = _.assign(module.exports, controller);