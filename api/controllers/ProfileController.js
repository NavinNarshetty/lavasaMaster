module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    searchAthlete: function (req, res) {
        if (req.body) {
            Profile.searchAthlete(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    searchSchool: function (req, res) {
        if (req.body) {
            Profile.searchSchool(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    searchTeam: function (req, res) {
        if (req.body) {
            Profile.searchTeam(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    getAthleteProfile: function (req, res) {
        if (req.body) {
            Profile.getAthleteProfile(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    getTeamProfile: function (req, res) {
        if (req.body) {
            Profile.getTeamProfile(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    getSchoolProfile: function (req, res) {
        if (req.body) {
            Profile.getSchoolProfile(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    getAthleteStats: function (req, res) {
        if (req.body) {
            Profile.getAthleteStats(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

};
module.exports = _.assign(module.exports, controller);