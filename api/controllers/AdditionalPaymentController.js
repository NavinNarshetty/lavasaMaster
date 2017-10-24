module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    search: function (req, res) {
        if (req.body) {
            AdditionalPayment.search(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },
    getOne: function (req, res) {
        if (req.body) {
            AdditionalPayment.getOne(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    // generateExcel: function (req, res) {
    //     if (req.body) {
    //         AdditionalPayment.generateExcel(req.body, res);
    //     } else {
    //         res.json({
    //             "data": "Body not Found",
    //             "value": false
    //         })
    //     }
    // },
    generateExcel: function (req, res) {
        console.log("inside controller");
        AdditionalPayment.generateExcel(res);
    },
};
module.exports = _.assign(module.exports, controller);