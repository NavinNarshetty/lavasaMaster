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
    getOneBySfaId: function (req, res) {
        if (req.body) {
            Registration.getOneBySfaId(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    getOneBySfaIdStatus: function (req, res) {
        if (req.body) {
            Registration.getOneBySfaIdStatus(req.body, res.callback);
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
        if (req.body) {
            console.log(req.body);
            Registration.generateExcel(req.body, res);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    generateExcelOld: function (req, res) {
        Registration.generateExcelOld(res);
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
        async.waterfall([
                function (callback) {
                    ConfigProperty.find().lean().exec(function (err, property) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(property)) {
                                callback(null, []);
                            } else {
                                callback(null, property);
                            }
                        }
                    });
                },
                function (property, callback) {
                    req.body.property = property[0];
                    Registration.cronSchoolWithPaymentDue(req.body, res.callback);
                }
            ],
            function (err, data2) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    callback(null, data2);
                }

            });

    },

    updateSchoolContactDetails: function (req, res) {
        if (req.body) {
            Registration.updateSchoolContactDetails(req.body, res.callback);
        } else {
            res.json({
                data: "No data found",
                value: false
            });
        }

    },
    getSchoolPayuStatus: function (req, res) {
        if (req.body) {
            Registration.getSchoolPayuStatus(req.body, res.callback);
        } else {
            res.json({
                data: "No data found",
                value: false
            });
        }
    },
    getOTP: function (req, res) {
        if (req.body && req.body.sfaId) {
            Registration.getOTP(req.body, res.callback);
        } else {
            res.json({
                data: "Please provide parameters",
                value: false
            });
        }

    }


};
module.exports = _.assign(module.exports, controller);