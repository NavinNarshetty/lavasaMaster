module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    getresultSport: function (req, res) {
        if (req.body) {
            ResultInitialize.getresultSport(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

};
module.exports = _.assign(module.exports, controller);