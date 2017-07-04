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
                req.body.createdBy = "School";
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
                        req.body.school = found._id;
                        TeamSport.teamConfirm(req.body, res.callback);
                    }
                });
            } else if (req.body.athleteToken) {
                req.body.createdBy = "Athlete";
                Athelete.findOne({
                    accessToken: req.body.athleteToken
                }).exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(found)) {
                        callback("Incorrect Login Details", null);
                    } else {
                        req.body.athleteSFA = found.sfaId;
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

    generateExcel: function (req, res) {
        TeamSport.generateExcel(res);
    },




};
module.exports = _.assign(module.exports, controller);