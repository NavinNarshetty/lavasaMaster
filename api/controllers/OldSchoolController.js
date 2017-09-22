module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    getAllSchool: function (req, res) {
        if (req.body) {
            OldSchool.getAllSchool(req.body, res.callback);
        } else {
            res.json({
                "data": "Data not Found",
                "value": false
            })
        }
    },

};
module.exports = _.assign(module.exports, controller);