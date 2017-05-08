module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    schoolPayment: function (req, res) {
        if (req.body) {
            PayU.schoolPayment(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    atheletePayment: function (req, res) {
        if (req.body) {
            PayU.atheletePayment(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

};
module.exports = _.assign(module.exports, controller);