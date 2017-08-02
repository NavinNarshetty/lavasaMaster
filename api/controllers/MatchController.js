module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    getOneMatch: function (req, res) {
        if (req.body) {
            if (req.body._id) {
                Match.getOneMatch(req.body, res.callback);
            } else {

            }
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },
    getAll: function (req, res) {
        Match.getAll(req.body, res.callback);
    }
};
module.exports = _.assign(module.exports, controller);