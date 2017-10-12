module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    saveAthelete: function (req, res) {
        if (req.body) {
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
                        Athelete.saveAthelete(req.body, res.callback);

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

    searchByFilter:function(req,res){
       Athelete.searchByFilter(req.body,res.callback);
    },

    search: function (req, res) {
        if (req.body) {
            Athelete.search(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    getOneBySfaId: function (req, res) {
        if (req.body) {
            Athelete.getOneBySfaId(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    generateExcelOld: function (req, res) {
        Athelete.generateExcelOld(res);
    },

    generateExcel: function (req, res) {
        if (req.body) {
            console.log(req.body);
            Athelete.generateExcel(req.body, res);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    filterAthlete: function (req, res) {
        if (req.body) {
            Athelete.filterAthlete(req.body, res.callback);
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
                        req.body.propertyType = property[0].institutionType;
                        req.body.city = property[0].sfaCity;
                        req.body.year = property[0].year;
                        req.body.eventYear = property[0].eventYear;
                        Athelete.generateEmailOTP(req.body, res.callback);
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

    cronAthleteWithPaymentDue: function (req, res) {
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
                    console.log("property", req.body.property);
                    Athelete.cronAthleteWithPaymentDue(req.body, res.callback);

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
};
module.exports = _.assign(module.exports, controller);