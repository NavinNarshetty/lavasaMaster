module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    getAllIndividual: function (req, res) {
        if (req.body) {
            OldHeat.getAllPlayer(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    getAllTeam: function (req, res) {
        if (req.body) {
            OldHeat.getAllTeam(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    saveHeatMatch: function (req, res) {
        if (req.body) {
            async.waterfall([
                    function (callback) {
                        //     OldHeat.saveHeatMatchIndividual(req.body, function (err, matchData) {
                        //         callback(null, matchData);
                        //     });
                        // },
                        // function (importData, callback) {
                        OldHeat.saveHeatMatchTeam(req.body, function (err, matchData) {
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
            // OldHeat.saveHeatMatchIndividual(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },


};
module.exports = _.assign(module.exports, controller);