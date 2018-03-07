module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    getAllSports: function (req, res) {
        if (req.body) {
            OldSport.getAllSports(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    getOldSport: function (req, res) {
        if (req.body) {
            OldSport.getOldSport(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

};
module.exports = _.assign(module.exports, controller);