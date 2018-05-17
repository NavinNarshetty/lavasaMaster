module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    schoolPayment: function (req, res) {
        // console.log(req);
        if (req) {
            ConfigProperty.find().lean().exec(function (err, property) {
                if (err) {
                    callback(err, null);
                } else {
                    if (_.isEmpty(property)) {
                        callback(null, []);
                    } else {
                        var id = (req.query.id);
                        Registration.findOne({
                            _id: id
                        }).lean().exec(function (err, data) {
                            data.property = property[0];
                            PayU.schoolPayment(data, function (err, httpResponse) {
                                if (httpResponse.statusCode == 302) {
                                    res.redirect(httpResponse.headers.location);
                                } else {
                                    res.send(data);
                                }
                            });
                        });
                    }
                }
            });
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    atheletePayment: function (req, res) {
        if (req) {
            ConfigProperty.find().lean().exec(function (err, property) {
                if (err) {
                    callback(err, null);
                } else {
                    if (_.isEmpty(property)) {
                        callback(null, []);
                    } else {
                        var id = (req.query.id);
                        Athelete.findOne({
                            _id: id
                        }).lean().deepPopulate("package").exec(function (err, data) {
                            data.property = property[0];
                            PayU.atheletePayment(data, function (err, httpResponse) {
                                if (httpResponse.statusCode == 302) {
                                    res.redirect(httpResponse.headers.location);
                                } else {
                                    res.send(data);
                                }
                            });
                        });
                    }
                }
            });
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    additionalPayment: function (req, res) {
        if (req) {
            ConfigProperty.find().lean().exec(function (err, property) {
                if (err) {
                    callback(err, null);
                } else {
                    if (_.isEmpty(property)) {
                        callback(null, []);
                    } else {
                        var id = (req.query.id);
                        Athelete.findOne({
                            sfaId: id
                        }).lean().exec(function (err, data) {
                            data.property = property[0];
                            PayU.additionalPayment(data, function (err, httpResponse) {
                                if (httpResponse.statusCode == 302) {
                                    res.redirect(httpResponse.headers.location);
                                } else {
                                    res.send(data);
                                }
                            });
                        });
                    }
                }
            });
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    successErrorSchool: function (req, res) {
        var data = req.allParams();
        var param = {};

        param.schoolName = data.udf1;
        // param.transactionid = data.mihpayid;
        var status = data.status;

        console.log('Inside SuccesssErrorrr', data);
        // console.log(data.status != "success");
        if (req) {
            if (data.status == "success") {
                console.log('yes success');
                async.waterfall([
                        function (callback) {
                            PayU.verification(data, function (err, verficationData) {
                                if (err) {
                                    console.log('amoutn not match issue');
                                    res.json({
                                        value: false,
                                        data: "Invalid Request"
                                    });
                                } else {
                                    callback(null, verficationData);
                                }
                            });
                        },
                        function (verficationData, callback) {
                            if (verficationData.status == 1) {
                                param.transactionid = verficationData.transaction_details.mihpayid;
                                Registration.updatePaymentStatus(param, function (err, data) {
                                    if (err) {
                                        console.log('amoutn not match issue');
                                        res.json({
                                            value: false,
                                            data: "Invalid Request"
                                        });
                                    } else {

                                        // res.redirect("http://testmumbai2015.sfanow.in/paymentSuccess/register/school");

                                        // res.redirect("http://testmumbai2016.sfanow.in/paymentSuccess/register/school");

                                        // res.redirect("http://testmumbaischool.sfanow.in/paymentSuccess/register/school");

                                        // res.redirect("http://testmumbaicollege.sfanow.in/paymentSuccess/register/school");

                                        // res.redirect("http://testhyderabadschool.sfanow.in/paymentSuccess/register/school");

                                        // res.redirect("http://testhyderabadcollege.sfanow.in/paymentSuccess/register/school");

                                        // res.redirect("http://testahmedabadschool.sfanow.in/paymentSuccess/register/school");

                                        // res.redirect("http://testahmedabadcollege.sfanow.in/paymentSuccess/register/school");

                                        res.redirect("https://mumbaischool.sfanow.in/paymentSuccess/register/school");

                                        // res.redirect("http://mumbaischool.sfanow.in/2017/paymentSuccess/register/school");

                                        // res.redirect("http://mumbaicollege.sfanow.in/paymentSuccess/register/school");

                                        // res.redirect("http://hyderabadschool.sfanow.in/paymentSuccess/register/school");

                                        // res.redirect("http://hyderabadcollege.sfanow.in/paymentSuccess/register/school");

                                        // res.redirect("http://ahmedabadschool.sfanow.in/paymentSuccess/register/school");

                                        // res.redirect("http://ahmedabadcollege.sfanow.in/paymentSuccess/register/school");

                                        // res.redirect("https://sfanow.in/paymentSuccess/register/school");
                                    }
                                });
                            } else {
                                Registration.remove({
                                    $or: [{
                                        schoolName: param.schoolName
                                    }, {
                                        _id: id
                                    }]
                                }).exec(function (err, data) {
                                    if (err) {
                                        callback(err, null);
                                    } else if (_.isEmpty(data)) {
                                        callback(null, "Data is empty");
                                    } else {
                                        res.redirect("https://mumbaischool.sfanow.in/paymentFailure");

                                        // res.redirect("http://mumbaischool.sfanow.in/2017/paymentFailure");

                                        // res.redirect("http://mumbaicollege.sfanow.in/paymentFailure");

                                        // res.redirect("http://hyderabadschool.sfanow.in/paymentFailure");

                                        // res.redirect("http://hyderabadcollege.sfanow.in/paymentFailure");

                                        // res.redirect("http://ahmedabadschool.sfanow.in/paymentFailure");

                                        // res.redirect("http://ahmedabadcollege.sfanow.in/paymentFailure");

                                        // res.redirect("http://testmumbai2015.sfanow.in/paymentFailure");

                                        // res.redirect("http://testmumbai2016.sfanow.in/paymentFailure");

                                        // res.redirect("http://testmumbaischool.sfanow.in/paymentFailure");

                                        // res.redirect("http://testmumbaicollege.sfanow.in/paymentFailure");

                                        // res.redirect("http://testhyderabadschool.sfanow.in/paymentFailure");

                                        // res.redirect("http://testhyderabadcollege.sfanow.in/paymentFailure");

                                        // res.redirect("http://testahmedabadschool.sfanow.in/paymentFailure");

                                        // res.redirect("http://testahmedabadcollege.sfanow.in/paymentFailure");

                                        // res.redirect("https://sfanow.in/paymentFailure");
                                    }

                                });
                            }
                        }
                    ],
                    function (err, complete) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, complete);
                        }
                    });
            } else {
                // var id = (req.query.id);
                // console.log('some errror');
                // Registration.remove({
                //     $or: [{
                //         schoolName: param.schoolName
                //     }, {
                //         _id: id
                //     }]
                // }).exec(function (err, data) {
                //     if (err) {
                //         callback(err, null);
                //     } else if (_.isEmpty(data)) {
                //         callback(null, "Data is empty");
                //     } else {
                //         res.redirect("https://mumbaischool.sfanow.in/paymentFailure");

                //         // res.redirect("http://mumbaischool.sfanow.in/2017/paymentFailure");

                //         // res.redirect("http://mumbaicollege.sfanow.in/paymentFailure");

                //         // res.redirect("http://hyderabadschool.sfanow.in/paymentFailure");

                //         // res.redirect("http://hyderabadcollege.sfanow.in/paymentFailure");

                //         // res.redirect("http://ahmedabadschool.sfanow.in/paymentFailure");

                //         // res.redirect("http://ahmedabadcollege.sfanow.in/paymentFailure");

                //         // res.redirect("http://testmumbai2015.sfanow.in/paymentFailure");

                //         // res.redirect("http://testmumbai2016.sfanow.in/paymentFailure");

                //         // res.redirect("http://testmumbaischool.sfanow.in/paymentFailure");

                //         // res.redirect("http://testmumbaicollege.sfanow.in/paymentFailure");

                //         // res.redirect("http://testhyderabadschool.sfanow.in/paymentFailure");

                //         // res.redirect("http://testhyderabadcollege.sfanow.in/paymentFailure");

                //         // res.redirect("http://testahmedabadschool.sfanow.in/paymentFailure");

                //         // res.redirect("http://testahmedabadcollege.sfanow.in/paymentFailure");

                //         // res.redirect("https://sfanow.in/paymentFailure");
                //     }

                // });
                res.json({
                    value: false,
                    data: "User Not logged in"
                });
            }
        } else {
            res.json({
                value: false,
                data: "User Not logged in"
            });
        }
    },

    successErrorAthelete: function (req, res) {
        var data = req.allParams();
        var param = {};

        param.firstName = data.firstname;
        param.surname = data.lastname;
        param.email = data.email;
        param.transactionid = data.mihpayid;
        var status = data.status;

        console.log('Inside SuccesssErrorrr', data);
        console.log(data.status != "success");
        if (req) {
            if (data.status == "success") {
                console.log('yes success');
                async.waterfall([
                        function (callback) {
                            PayU.verification(data, function (err, verficationData) {
                                if (err) {
                                    console.log('amoutn not match issue');
                                    res.json({
                                        value: false,
                                        data: "Invalid Request"
                                    });
                                } else {
                                    callback(null, verficationData);
                                }
                            });
                        },
                        function (verficationData, callback) {
                            var obj = JSON.parse(verficationData.body);
                            console.log("obj", obj);
                            console.log("obj.status", obj.status);
                            if (obj.status === 1) {
                                param.transactionid = obj.transaction_details[verficationData.txnid].mihpayid;
                                Athelete.updatePaymentStatus(param, function (err, data) {
                                    if (err) {
                                        console.log('amount not match issue');
                                        res.json({
                                            value: false,
                                            data: "Invalid Request"
                                        });
                                    } else {
                                        res.redirect("https://mumbaischool.sfanow.in/paymentSuccess/register/player");

                                        // res.redirect("http://mumbaischool.sfanow.in/2017/paymentSuccess/register/player");

                                        // res.redirect("http://mumbaicollege.sfanow.in/paymentSuccess/register/player");

                                        // res.redirect("http://hyderabadschool.sfanow.in/paymentSuccess/register/player");

                                        // res.redirect("http://hyderabadcollege.sfanow.in/paymentSuccess/register/player");

                                        // res.redirect("http://ahmedabadschool.sfanow.in/paymentSuccess/register/player");

                                        // res.redirect("http://ahmedabadcollege.sfanow.in/paymentSuccess/register/player");

                                        // res.redirect("http://testmumbai2015.sfanow.in/paymentSuccess/register/player");

                                        // res.redirect("http://testmumbai2016.sfanow.in/paymentSuccess/register/player");

                                        // res.redirect("http://testmumbaischool.sfanow.in/paymentSuccess/register/player");

                                        // res.redirect("http://testmumbaicollege.sfanow.in/paymentSuccess/register/player");

                                        // res.redirect("http://testhyderabadschool.sfanow.in/paymentSuccess/register/player");

                                        // res.redirect("http://testhyderabadcollege.sfanow.in/paymentSuccess/register/player");

                                        // res.redirect("http://testahmedabadschool.sfanow.in/paymentSuccess/register/player");

                                        // res.redirect("http://testahmedabadcollege.sfanow.in/paymentSuccess/register/player");

                                        // res.redirect("https://sfanow.in/paymentSuccess/register/player");
                                    }
                                });
                            } else {
                                var id = (req.query.id);
                                console.log('some errror');
                                Athelete.remove({
                                    $or: [{
                                        firstName: param.firstName
                                    }, {
                                        surname: param.surname
                                    }, {
                                        email: param.email
                                    }, {
                                        _id: id
                                    }]
                                }).exec(function (err, data) {
                                    if (err) {
                                        callback(err, null);
                                    } else if (_.isEmpty(data)) {
                                        callback(null, "Data is empty");
                                    } else {

                                        // res.redirect("https://mumbaischool.sfanow.in/sorryAthelete");

                                        // res.redirect("http://mumbaischool.sfanow.in/2017/sorryAthelete");

                                        // res.redirect("http://mumbaicollege.sfanow.in/sorryAthelete");

                                        // res.redirect("http://hyderabadschool.sfanow.in/sorryAthelete");

                                        // res.redirect("http://hyderabadcollege.sfanow.in/sorryAthelete");

                                        // res.redirect("http://ahmedabadschool.sfanow.in/sorryAthelete");

                                        // res.redirect("http://ahmedabadcollege.sfanow.in/sorryAthelete");

                                        // res.redirect("http://testhyderabadcollege.sfanow.in/sorryAthelete");

                                        // res.redirect("http://testhyderabadschool.sfanow.in/sorryAthelete");

                                        // res.redirect("http://testahmedabadcollege.sfanow.in/sorryAthelete");

                                        // res.redirect("http://testahmedabadschool.sfanow.in/sorryAthelete");

                                        // res.redirect("http://testmumbaicollege.sfanow.in/sorryAthelete");

                                        res.redirect("http://testmumbaischool.sfanow.in/sorryAthelete");

                                        // res.redirect("http://testmumbai2016.sfanow.in/sorryAthelete");

                                        // res.redirect("http://testmumbai2015.sfanow.in/sorryAthelete");

                                        // res.redirect("https://sfanow.in/sorryAthelete");
                                    }
                                });
                            }
                        }
                    ],
                    function (err, complete) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, complete);
                        }
                    });
            } else if (data.status == "failure" || data.status == "pending") {
                var id = (req.query.id);
                console.log('some errror');
                Athelete.remove({
                    $or: [{
                        firstName: param.firstName
                    }, {
                        surname: param.surname
                    }, {
                        email: param.email
                    }, {
                        _id: id
                    }]
                }).exec(function (err, data) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(data)) {
                        callback(null, "Data is empty");
                    } else {

                        // res.redirect("https://mumbaischool.sfanow.in/sorryAthelete");

                        // res.redirect("http://mumbaischool.sfanow.in/2017/sorryAthelete");

                        // res.redirect("http://mumbaicollege.sfanow.in/sorryAthelete");

                        // res.redirect("http://hyderabadschool.sfanow.in/sorryAthelete");

                        // res.redirect("http://hyderabadcollege.sfanow.in/sorryAthelete");

                        // res.redirect("http://ahmedabadschool.sfanow.in/sorryAthelete");

                        // res.redirect("http://ahmedabadcollege.sfanow.in/sorryAthelete");

                        // res.redirect("http://testhyderabadcollege.sfanow.in/sorryAthelete");

                        // res.redirect("http://testhyderabadschool.sfanow.in/sorryAthelete");

                        // res.redirect("http://testahmedabadcollege.sfanow.in/sorryAthelete");

                        // res.redirect("http://testahmedabadschool.sfanow.in/sorryAthelete");

                        // res.redirect("http://testmumbaicollege.sfanow.in/sorryAthelete");

                        res.redirect("http://testmumbaischool.sfanow.in/sorryAthelete");

                        // res.redirect("http://testmumbai2016.sfanow.in/sorryAthelete");

                        // res.redirect("http://testmumbai2015.sfanow.in/sorryAthelete");

                        // res.redirect("https://sfanow.in/sorryAthelete");
                    }
                });
            } else {
                res.redirect("https://mumbaischool.sfanow.in/paymentPending/player");
            }
        } else {
            res.json({
                value: false,
                data: "User Not logged in"
            });
        }
    },
    // ------------------------UPGRADE PACKAGE PAYMENT ---------------------------------------------

    upgradeAthletePayment: function (req, res) {
        if (req) {
            ConfigProperty.find().lean().exec(function (err, property) {
                if (err) {
                    callback(err, null);
                } else {
                    if (_.isEmpty(property)) {
                        callback(null, []);
                    } else {
                        var id = (req.query.id);
                        Athelete.findOne({
                            _id: id
                        }).lean().deepPopulate("package").exec(function (err, data) {
                            data.property = property[0];
                            PayU.atheleteUpgradePayment(data, function (err, httpResponse) {
                                if (httpResponse.statusCode == 302) {
                                    res.redirect(httpResponse.headers.location);
                                } else {
                                    res.send(data);
                                }
                            });
                        });
                    }
                }
            });
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    successUpgradeErrorAthelete: function (req, res) {
        var data = req.allParams();
        var param = {};

        param.firstName = data.firstname;
        param.surname = data.lastname;
        param.email = data.email;
        param.transactionid = data.mihpayid;
        var status = data.status;

        console.log('Inside SuccesssErrorrr', data);
        console.log(data.status != "success");
        if (req) {
            if (data.status == "success") {
                console.log('yes success');
                param.success = true;
                Accounts.updateAthletePaymentStatus(param, function (err, data) {
                    if (err) {
                        console.log('amount not match issue');
                        res.json({
                            value: false,
                            data: "Invalid Request"
                        });
                    } else {
                        res.redirect("https://mumbaischool.sfanow.in/paymentSuccess/upgrade/player");

                        // res.redirect("http://mumbaischool.sfanow.in/2017/paymentSuccess/upgrade/player");

                        // res.redirect("http://mumbaicollege.sfanow.in/paymentSuccess/upgrade/player");

                        // res.redirect("http://hyderabadschool.sfanow.in/paymentSuccess/upgrade/player");

                        // res.redirect("http://hyderabadcollege.sfanow.in/paymentSuccess/upgrade/player");

                        // res.redirect("http://ahmedabadschool.sfanow.in/paymentSuccess/upgrade/player");

                        // res.redirect("http://ahmedabadcollege.sfanow.in/paymentSuccess/upgrade/player");

                        // res.redirect("http://testmumbai2015.sfanow.in/paymentSuccess/upgrade/player");

                        // res.redirect("http://testmumbai2016.sfanow.in/paymentSuccess/upgrade/player");

                        // res.redirect("http://testmumbaischool.sfanow.in/paymentSuccess/upgrade/player");

                        // res.redirect("http://testmumbaicollege.sfanow.in/paymentSuccess/upgrade/player");

                        // res.redirect("http://testhyderabadschool.sfanow.in/paymentSuccess/upgrade/player");

                        // res.redirect("http://testhyderabadcollege.sfanow.in/paymentSuccess/upgrade/player");

                        // res.redirect("http://testahmedabadschool.sfanow.in/paymentSuccess/upgrade/player");

                        // res.redirect("http://testahmedabadcollege.sfanow.in/paymentSuccess/upgrade/player");

                        // res.redirect("https://sfanow.in/paymentSuccess/upgrade/player");
                    }
                });

            } else {
                param.success = false;
                Accounts.updateAthletePaymentStatus(param, function (err, data) {
                    if (err) {
                        console.log('amount not match issue');
                        res.json({
                            value: false,
                            data: "Invalid Request"
                        });
                    } else {
                        // res.redirect("https://mumbaischool.sfanow.in/sorryAthelete");

                        // res.redirect("http://mumbaischool.sfanow.in/2017/sorryAthelete");

                        // res.redirect("http://mumbaicollege.sfanow.in/sorryAthelete");

                        // res.redirect("http://hyderabadschool.sfanow.in/sorryAthelete");

                        // res.redirect("http://hyderabadcollege.sfanow.in/sorryAthelete");

                        // res.redirect("http://ahmedabadschool.sfanow.in/sorryAthelete");

                        // res.redirect("http://ahmedabadcollege.sfanow.in/sorryAthelete");

                        // res.redirect("http://testhyderabadcollege.sfanow.in/sorryAthelete");

                        // res.redirect("http://testhyderabadschool.sfanow.in/sorryAthelete");

                        // res.redirect("http://testahmedabadcollege.sfanow.in/sorryAthelete");

                        // res.redirect("http://testahmedabadschool.sfanow.in/sorryAthelete");

                        // res.redirect("http://testmumbaicollege.sfanow.in/sorryAthelete");

                        res.redirect("http://testmumbaischool.sfanow.in/sorryAthelete");

                        // res.redirect("http://testmumbai2016.sfanow.in/sorryAthelete");

                        // res.redirect("http://testmumbai2015.sfanow.in/sorryAthelete");

                        // res.redirect("https://sfanow.in/sorryAthelete");
                    }
                });
            }
        } else {
            res.json({
                value: false,
                data: "User Not logged in"
            });
        }
    },

    upgradeSchoolPayment: function (req, res) {
        if (req) {
            ConfigProperty.find().lean().exec(function (err, property) {
                if (err) {
                    callback(err, null);
                } else {
                    if (_.isEmpty(property)) {
                        callback(null, []);
                    } else {
                        var id = (req.query.id);
                        Registration.findOne({
                            _id: id
                        }).lean().exec(function (err, data) {
                            console.log("property", property[0]);
                            data.property = property[0];
                            PayU.schoolUpgradePayment(data, function (err, httpResponse) {
                                if (httpResponse.statusCode == 302) {
                                    res.redirect(httpResponse.headers.location);
                                } else {
                                    res.send(data);
                                }
                            });
                        });
                    }
                }
            });
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    successUpgradeErrorSchool: function (req, res) {
        var data = req.allParams();
        var param = {};

        param.schoolName = data.udf1;
        param.transactionid = data.mihpayid;
        var status = data.status;

        console.log('Inside SuccesssErrorrr', data);
        console.log(data.status != "success");
        if (req) {
            if (data.status == "success") {
                param.success = true;
                console.log('yes success');
                Accounts.updateSchoolPaymentStatus(param, function (err, data) {
                    if (err) {
                        console.log('amoutn not match issue');
                        res.json({
                            value: false,
                            data: "Invalid Request"
                        });
                    } else {

                        // res.redirect("http://testmumbai2015.sfanow.in/paymentSuccess/upgrade/school");

                        // res.redirect("http://testmumbai2016.sfanow.in/paymentSuccess/upgrade/school");

                        // res.redirect("http://testmumbaischool.sfanow.in/paymentSuccess/upgrade/school");

                        // res.redirect("http://testmumbaicollege.sfanow.in/paymentSuccess/upgrade/school");

                        // res.redirect("http://testhyderabadschool.sfanow.in/paymentSuccess/upgrade/school");

                        // res.redirect("http://testhyderabadcollege.sfanow.in/paymentSuccess/upgrade/school");

                        // res.redirect("http://testahmedabadschool.sfanow.in/paymentSuccess/upgrade/school");

                        // res.redirect("http://testahmedabadcollege.sfanow.in/paymentSuccess/upgrade/school");

                        res.redirect("https://mumbaischool.sfanow.in/paymentSuccess/upgrade/school");

                        // res.redirect("http://mumbaischool.sfanow.in/2017/paymentSuccess/upgrade/school");

                        // res.redirect("http://mumbaicollege.sfanow.in/paymentSuccess/upgrade/school");

                        // res.redirect("http://hyderabadschool.sfanow.in/paymentSuccess/upgrade/school");

                        // res.redirect("http://hyderabadcollege.sfanow.in/paymentSuccess/upgrade/school");

                        // res.redirect("http://ahmedabadschool.sfanow.in/paymentSuccess/upgrade/school");

                        // res.redirect("http://ahmedabadcollege.sfanow.in/paymentSuccess/upgrade/school");

                        // res.redirect("https://sfanow.in/paymentSuccess/upgrade/school");
                    }
                });

            } else {
                param.success = false;
                var id = (req.query.id);
                console.log('some errror');
                Registration.remove({
                    $or: [{
                        schoolName: param.schoolName
                    }, {
                        _id: id
                    }]
                }).exec(function (err, data) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(data)) {
                        callback(null, "Data is empty");
                    } else {
                        res.redirect("https://mumbaischool.sfanow.in/paymentFailure");

                        // res.redirect("http://mumbaischool.sfanow.in/2017/paymentFailure");

                        // res.redirect("http://mumbaicollege.sfanow.in/paymentFailure");

                        // res.redirect("http://hyderabadschool.sfanow.in/paymentFailure");

                        // res.redirect("http://hyderabadcollege.sfanow.in/paymentFailure");

                        // res.redirect("http://ahmedabadschool.sfanow.in/paymentFailure");

                        // res.redirect("http://ahmedabadcollege.sfanow.in/paymentFailure");

                        // res.redirect("http://testmumbai2015.sfanow.in/paymentFailure");

                        // res.redirect("http://testmumbai2016.sfanow.in/paymentFailure");

                        // res.redirect("http://testmumbaischool.sfanow.in/paymentFailure");

                        // res.redirect("http://testmumbaicollege.sfanow.in/paymentFailure");

                        // res.redirect("http://testhyderabadschool.sfanow.in/paymentFailure");

                        // res.redirect("http://testhyderabadcollege.sfanow.in/paymentFailure");

                        // res.redirect("http://testahmedabadschool.sfanow.in/paymentFailure");

                        // res.redirect("http://testahmedabadcollege.sfanow.in/paymentFailure");

                        // res.redirect("https://sfanow.in/paymentFailure");
                    }

                });
            }
        } else {
            res.json({
                value: false,
                data: "User Not logged in"
            });
        }
    },
};
module.exports = _.assign(module.exports, controller);