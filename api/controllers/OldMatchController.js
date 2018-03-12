module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    getAllIndividualMatch: function (req, res) {
        if (req.body) {
            OldMatch.getAllIndividualMatch(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    getAllTeamMatch: function (req, res) {
        if (req.body) {
            OldMatch.getAllTeamMatch(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
};
module.exports = _.assign(module.exports, controller);