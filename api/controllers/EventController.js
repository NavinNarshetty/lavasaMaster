module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    setEvent: function (req, res) {
        if (req.body) {
            Event.setEvent(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            });
        }
    },

};
module.exports = _.assign(module.exports, controller);