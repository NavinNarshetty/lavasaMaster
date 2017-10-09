module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    getAllIndividual: function (req, res) {
        if (req.body) {
            OldQualifyingKnockout.getAllPlayer(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    saveKnockoutMatch: function (req, res) {
        if (req.body) {
            async.waterfall([
                    function (callback) {
                        OldQualifyingKnockout.saveQualifyingMatchIndividual(req.body, function (err, matchData) {
                            callback(null, matchData);
                        });
                    },
                    function (importData, callback) {
                        OldQualifyingKnockout.saveknockoutMatchIndividual(req.body, function (err, matchData) {
                            callback(null, matchData);
                        });
                    },
                    // function (importData, callback) {
                    //     OldLeagueKnockout.saveLeagueMatchTeam(req.body, function (err, matchData) {
                    //         callback(null, matchData);
                    //     });
                    // },
                    // function (importData, callback) {
                    //     OldLeagueKnockout.saveknockoutMatchTeam(req.body, function (err, matchData) {
                    //         callback(null, matchData);
                    //     });
                    // }
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