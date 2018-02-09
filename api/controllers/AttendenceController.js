module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    getAthleteForAttendence: function (req, res) {
        if (req.body) {
            Attendence.getAthleteForAttendence(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            });
        }
    },

    saveAttendence: function (req, res) {
        if (req.body) {
            Attendence.saveAttendence(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            });
        }
    },

    getPlayersMatchSelection: function (req, res) {
        if (req.body) {
            Attendence.getPlayersMatchSelection(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            });
        }
    },

    createMatch: function (req, res) {
        if (req.body.sportType == "Heats") {
            Attendence.createMatchHeat(req.body, res.callback);
        } else if (req.body.sportType == "Qualifying Round") {
            Attendence.createMatchQualifying(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            });
        }
    },

    addPlayersToMatch: function (req, res) {
        if (req.body) {
            Attendence.addPlayersToMatch(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            });
        }
    },

    deletePlayerMatch: function (req, res) {
        if (req.body) {
            Attendence.deletePlayerMatch(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            });
        }
    },

    addQualifyingRoundPlayers: function (req, res) {
        if (req.body) {
            Attendence.addQualifyingRoundPlayers(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            });
        }
    },
};
module.exports = _.assign(module.exports, controller);