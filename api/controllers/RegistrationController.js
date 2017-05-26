module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    saveRegistrationForm: function (req, res) {
        if (req.body) {
            Registration.saveRegistrationForm(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    generateSfaID: function (req, res) {
        if (req.body) {
            Registration.generateSfaID(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    search: function (req, res) {
        if (req.body) {
            Registration.search(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    filterSchool: function (req, res) {
        if (req.body) {
            Registration.filterSchool(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    generateExcel: function (req, res) {
        console.log("inside controller");
        Registration.generateExcel(res);
    },

    getAllRegistrationDetails: function (req, res) {
        if (req.body) {
            Registration.getAllRegistrationDetails(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    getSchoolName: function (req, res) {
        if (req.body) {
            Registration.getSchoolName(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    getOneRegistrationDetails: function (req, res) {
        if (req.body) {
            Registration.getOneRegistrationDetails(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    generateOTP: function (req, res) {
        if (req.body) {
            Registration.generateOTP(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    receiptMail: function (req, res) {
        if (req.body) {
            Registration.receiptMail(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    cronSchoolWithPaymentDue: function (req, res) {
        if (req.body) {
            Registration.cronSchoolWithPaymentDue(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },


};
module.exports = _.assign(module.exports, controller);