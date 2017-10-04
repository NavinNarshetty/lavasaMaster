module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    getAllIndividual: function (req, res) {
        if (req.body) {
            OldHeat.getAllPlayer(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    saveHeatMatch: function (req, res) {
        if (req.body) {
            OldHeat.saveHeatMatch(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },


};
module.exports = _.assign(module.exports, controller);