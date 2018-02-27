module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    setRegistration: function (req, res) {
        if (req.body) {
            OldRegistration.setRegistration(req.body, res.callback);
        } else {
            res.json({
                "data": "OldRegistration Id not Found",
                "value": false
            })
        }
    },
};
module.exports = _.assign(module.exports, controller);