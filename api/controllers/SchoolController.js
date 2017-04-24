module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    updateSFAID: function (req, res) {
        if (req.body) {
            School.updateSFAID(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

};
module.exports = _.assign(module.exports, controller);