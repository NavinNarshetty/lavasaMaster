module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    getAllMatch: function (req, res) {
        if (req.body) {
            res.connection.setTimeout(200000000);
            req.connection.setTimeout(200000000);
            async.waterfall([
                function (callback) {
                    OldMatch.getAllIndividualMatch(req.body, function (err, individualData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, individualData);
                        }
                    });
                },
                function (individualData, callback) {
                    OldMatch.getAllTeamMatch(req.body, function (err, teamData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, teamData);
                        }
                    });
                }
            ], function (err, complete) {
                if (err) {
                    res.callback(err, null);
                } else {
                    res.callback(null, complete);
                }
            });

        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    // getAllTeamMatch: function (req, res) {
    //     if (req.body) {
    //         OldMatch.getAllTeamMatch(req.body, res.callback);
    //     } else {
    //         res.json({
    //             value: false,
    //             data: "Invalid Request"
    //         });
    //     }
    // },
};
module.exports = _.assign(module.exports, controller);