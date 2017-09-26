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

};
module.exports = _.assign(module.exports, controller);