module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    setAthlete: function (req, res) {
        if (req.body) {
            OldAthelete.setAthlete(req.body, res.callback);
        } else {
            res.json({
                "data": "OldAthelete Id not Found",
                "value": false
            })
        }
    },

};
module.exports = _.assign(module.exports, controller);