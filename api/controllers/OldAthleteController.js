module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    getAllStudent: function (req, res) {
        if (req.body) {
            OldAthlete.getAllStudent(req.body, res.callback);
        } else {
            res.json({
                "data": "Match Id not Found",
                "value": false
            })
        }
    },

};
module.exports = _.assign(module.exports, controller);