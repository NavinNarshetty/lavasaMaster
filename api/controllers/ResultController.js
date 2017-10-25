module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    getMedalsSchool: function (req, res) {
        if (req.body) {
            Result.getMedalsSchool(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },
    getRankSchool: function (req, res) {
        if (req.body) {
            Result.getRankSchool(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },
};
module.exports = _.assign(module.exports, controller);