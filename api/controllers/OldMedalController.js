module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    saveMedalsPlayer: function (req, res) {
        if (req.body) {
            OldMedal.saveMedalsPlayer(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "User Not logged in"
            });
        }

    },

    saveMedalsTeam: function (req, res) {
        if (req.body) {
            OldMedal.saveMedalsTeam(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "User Not logged in"
            });
        }

    },
};
module.exports = _.assign(module.exports, controller);