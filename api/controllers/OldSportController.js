module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    getAllTeam: function (req, res) {
        if (req.body) {
            OldSport.getAllTeam(req.body, res.callback);
        } else {
            res.json({
                "data": "Data not Found",
                "value": false
            })
        }
    },

};
module.exports = _.assign(module.exports, controller);