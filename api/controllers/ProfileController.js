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

};
module.exports = _.assign(module.exports, controller);