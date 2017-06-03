module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    getAllSportByType: function (req, res) {
        if (req.body) {
            SportsList.getAllSportByType(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    getRulesPerSports: function (req, res) {
        if (req.body) {
            SportsList.getRulesPerSports(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

};
module.exports = _.assign(module.exports, controller);