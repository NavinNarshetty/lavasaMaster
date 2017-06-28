module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    saveInTeam: function (req, res) {
        if (req.body) {
            TeamSport.saveInTeam(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "User Not logged in"
            });
        }

    },

    teamConfirm: function (req, res) {
        if (req.body) {
            if (req.body.schoolToken) {
                Registration.findOne({
                    accessToken: req.body.schoolToken
                }).exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(found)) {
                        callback("Incorrect Login Details", null);
                    } else {
                        req.body.schoolSFA = found.sfaID;
                        TeamSport.teamConfirm(req.body, res.callback);
                    }
                });
            }

        } else {
            res.json({
                value: false,
                data: "User Not logged in"
            });
        }

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


};
module.exports = _.assign(module.exports, controller);