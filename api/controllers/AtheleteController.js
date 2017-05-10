module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    saveAthelete: function (req, res) {
        if (req.body) {
            Athelete.saveAthelete(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    generateAtheleteSfaID: function (req, res) {
        if (req.body) {
            Athelete.generateAtheleteSfaID(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    getAllAtheleteDetails: function (req, res) {
        if (req.body) {
            Athelete.getAllAtheleteDetails(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    getOneAtheleteDetails: function (req, res) {
        if (req.body) {
            Athelete.getOneAtheleteDetails(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    generateEmailOTP: function (req, res) {
        if (req.body) {
            Athelete.generateEmailOTP(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    generateMobileOTP: function (req, res) {
        if (req.body) {
            Athelete.generateMobileOTP(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    registeredAtheletePaymentMail: function (req, res) {
        if (req.body) {
            Athelete.registeredAtheletePaymentMail(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },




};
module.exports = _.assign(module.exports, controller);