module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    getAthletePerSchool: function (req, res) {
        if (req.body) {
            if (req.body.schoolToken) {
                Sport.getAthletePerSchool(req.body, res.callback);
            } else if (req.body.athleteToken) {
                Sport.getAthlete(req.body, res.callback);
            } else {
                res.json({
                    value: false,
                    data: "Invalid User"
                });
            }
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    getSportPerTeam: function (req, res) {
        if (req.body) {
            Sport.getSportPerTeam(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "User Not logged in"
            });
        }

    },

    getSportPerTeam: function (req, res) {
        if (req.body) {
            Sport.search(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "User Not logged in"
            });
        }

    },

    saveSport: function (req, res) {
        if (req.body) {
            Sport.saveSport(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "User Not logged in"
            });
        }
    },

    generateExcel: function (req, res) {
        Sport.generateExcel(res);
    },
};
module.exports = _.assign(module.exports, controller);