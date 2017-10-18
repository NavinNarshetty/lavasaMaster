module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    getAllTeamSport: function (req, res) {
        if (req.body) {
            EventBib.getAllTeamSport(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            });
        }
    },

    getAllAthleteBySchoolId: function (req, res) {
        if (req.body) {
            EventBib.getAllAthleteBySchoolId(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            });
        }
    },

    getPlayerPerTeam: function (req, res) {
        if (req.body) {
            EventBib.getPlayerPerTeam(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            });
        }
    },

};
module.exports = _.assign(module.exports, controller);