module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    schoolPayment: function (req, res) {
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
                        }).lean().exec(function (err, data) {
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

        param.schoolName = data.firstname;
        param.transactionid = data.mihpayid;
        var status = data.status;

        console.log('Inside SuccesssErrorrr', data);
        console.log(data.status != "success");
        if (req) {
            if (data.status == "success") {
                console.log('yes success');
                Registration.updatePaymentStatus(param, function (err, data) {
                    if (err) {
                        console.log('amoutn not match issue');
                        res.json({
                            value: false,
                            data: "Invalid Request"
                        });
                    } else {

                        // res.redirect("http://testmumbaischool.sfanow.in/paymentSuccess");

                        // res.redirect("http://testmumbaicollege.sfanow.in/paymentSuccess");

                        // res.redirect("http://testhyderabadschool.sfanow.in/paymentSuccess");

                        // res.redirect("http://testhyderabadcollege.sfanow.in/paymentSuccess");

                        // res.redirect("http://testahmedabadschool.sfanow.in/paymentSuccess");

                        // res.redirect("http://testahmedabadcollege.sfanow.in/paymentSuccess");

                        // res.redirect("http://mumbaischool.sfanow.in/paymentSuccess");

                        res.redirect("http://mumbaicollege.sfanow.in/paymentSuccess");

                        // res.redirect("http://hyderabadschool.sfanow.in/paymentSuccess");

                        // res.redirect("http://hyderabadcollege.sfanow.in/paymentSuccess");

                        // res.redirect("http://ahmedabadschool.sfanow.in/paymentSuccess");

                        // res.redirect("http://ahmedabadcollege.sfanow.in/paymentSuccess");

                        // res.redirect("https://sfanow.in/paymentSuccess");
                    }
                });

            } else {
                console.log('some errror');
                Registration.findOne({
                    schoolName: param.schoolName
                }).exec(function (err, data) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(data)) {
                        callback(null, "Data is empty");
                    } else {
                        console.log("found", data);
                        Registration.remove({ //finds one with refrence to id
                            _id: data._id
                        }).exec(function (err, found) {
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(found)) {
                                callback(null, "Data is empty");
                            } else {
                                console.log("found", found);

                                // res.redirect("http://mumbaischool.sfanow.in/paymentFailure");

                                res.redirect("http://mumbaicollege.sfanow.in/paymentFailure");

                                // res.redirect("http://hyderabadschool.sfanow.in/paymentFailure");

                                // res.redirect("http://hyderabadcollege.sfanow.in/paymentFailure");

                                // res.redirect("http://ahmedabadschool.sfanow.in/paymentFailure");

                                // res.redirect("http://ahmedabadcollege.sfanow.in/paymentFailure");

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
                Athelete.updatePaymentStatus(param, function (err, data) {
                    if (err) {
                        console.log('amount not match issue');
                        res.json({
                            value: false,
                            data: "Invalid Request"
                        });
                    } else {
                        // res.redirect("http://mumbaischool.sfanow.in/paymentSuccess");

                        res.redirect("http://mumbaicollege.sfanow.in/paymentSuccess");

                        // res.redirect("http://hyderabadschool.sfanow.in/paymentSuccess");

                        // res.redirect("http://hyderabadcollege.sfanow.in/paymentSuccess");

                        // res.redirect("http://ahmedabadschool.sfanow.in/paymentSuccess");

                        // res.redirect("http://ahmedabadcollege.sfanow.in/paymentSuccess");

                        // res.redirect("http://testmumbaischool.sfanow.in/paymentSuccess");

                        // res.redirect("http://testmumbaicollege.sfanow.in/paymentSuccess");

                        // res.redirect("http://testhyderabadschool.sfanow.in/paymentSuccess");

                        // res.redirect("http://testhyderabadcollege.sfanow.in/paymentSuccess");

                        // res.redirect("http://testahmedabadschool.sfanow.in/paymentSuccess");

                        // res.redirect("http://testahmedabadcollege.sfanow.in/paymentSuccess");

                        // res.redirect("https://sfanow.in/paymentSuccess");
                    }
                });

            } else {
                console.log('some errror');
                Athelete.findOne({
                    firstName: param.firstName,
                    surname: param.surname,
                    email: param.email,
                }).exec(function (err, data) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(data)) {
                        callback(null, "Data is empty");
                    } else {
                        console.log("found", data);
                        Athelete.remove({ //finds one with refrence to id
                            _id: data._id
                        }).exec(function (err, found) {
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(found)) {
                                callback(null, "Data is empty");
                            } else {
                                console.log("found", found);

                                // res.redirect("http://mumbaischool.sfanow.in/sorryAthelete");

                                res.redirect("http://mumbaicollege.sfanow.in/sorryAthelete");

                                // res.redirect("http://hyderabadschool.sfanow.in/sorryAthelete");

                                // res.redirect("http://hyderabadcollege.sfanow.in/sorryAthelete");

                                // res.redirect("http://ahmedabadschool.sfanow.in/sorryAthelete");

                                // res.redirect("http://ahmedabadcollege.sfanow.in/sorryAthelete");

                                // res.redirect("http://testhyderabadcollege.sfanow.in/sorryAthelete");

                                // res.redirect("http://testhyderabadschool.sfanow.in/sorryAthelete");

                                // res.redirect("http://testahmedabadcollege.sfanow.in/sorryAthelete");

                                // res.redirect("http://testahmedabadschool.sfanow.in/sorryAthelete");

                                // res.redirect("http://testmumbaicollege.sfanow.in/sorryAthelete");

                                // res.redirect("http://testmumbaischool.sfanow.in/sorryAthelete");

                                // res.redirect("https://sfanow.in/sorryAthelete");
                            }

                        });
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

    successError: function (req, res) {
        var data = req.allParams();
        console.log('Inside SuccesssErrorrr', data);
        console.log(data.status != "success");
        if (req) {
            if (data.status == "success") {
                console.log('yes success');
                var finalData = {};
                async.waterfall([
                    function (callback) {
                        Athelete.findOne({
                            firstName: data.firstName,
                            surname: data.surname,
                            email: data.email,
                        }).exec(function (err, athleteData) {
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(athleteData)) {
                                callback(null, "Data is empty");
                            } else {
                                console.log("found", athleteData);
                                callback(null, athleteData);
                            }
                        });
                    },
                    function (athleteData, callback) {
                        var finalData = {};
                        finalData.transactionid = data.mihpayid;
                        finalData.paymentStatus = 'Paid';
                        finalData.feeType = 'online PAYU';
                        finalData.athleteId = athleteData._id;
                        AdditionalPayment.saveData(finalData, function (err, saveData) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(saveData)) {
                                    callback(null, []);
                                } else {
                                    callback(null, saveData);
                                }
                            }
                        });
                    }
                ], function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else {
                        // res.redirect("http://mumbaischool.sfanow.in/paymentSuccess");

                        // res.redirect("http://mumbaicollege.sfanow.in/paymentSuccess");

                        // res.redirect("http://hyderabadschool.sfanow.in/paymentSuccess");

                        // res.redirect("http://hyderabadcollege.sfanow.in/paymentSuccess");

                        // res.redirect("http://ahmedabadschool.sfanow.in/paymentSuccess");

                        // res.redirect("http://ahmedabadcollege.sfanow.in/paymentSuccess");

                        // res.redirect("http://testmumbaischool.sfanow.in/paymentSuccess");

                        // res.redirect("http://testmumbaicollege.sfanow.in/paymentSuccess");

                        res.redirect("http://testhyderabadschool.sfanow.in/paymentSuccess");

                        // res.redirect("http://testhyderabadcollege.sfanow.in/paymentSuccess");

                        // res.redirect("http://testahmedabadschool.sfanow.in/paymentSuccess");

                        // res.redirect("http://testahmedabadcollege.sfanow.in/paymentSuccess");

                        // res.redirect("https://sfanow.in/paymentSuccess");
                    }
                });
            } else {
                // res.redirect("http://mumbaischool.sfanow.in/sorryAthelete");

                // res.redirect("http://mumbaicollege.sfanow.in/sorryAthelete");

                // res.redirect("http://hyderabadschool.sfanow.in/sorryAthelete");

                // res.redirect("http://hyderabadcollege.sfanow.in/sorryAthelete");

                // res.redirect("http://ahmedabadschool.sfanow.in/sorryAthelete");

                // res.redirect("http://ahmedabadcollege.sfanow.in/sorryAthelete");

                // res.redirect("http://testhyderabadcollege.sfanow.in/sorryAthelete");

                res.redirect("http://testhyderabadschool.sfanow.in/sorryAthelete");

                // res.redirect("http://testahmedabadcollege.sfanow.in/sorryAthelete");

                // res.redirect("http://testahmedabadschool.sfanow.in/sorryAthelete");

                // res.redirect("http://testmumbaicollege.sfanow.in/sorryAthelete");

                // res.redirect("http://testmumbaischool.sfanow.in/sorryAthelete");

                // res.redirect("https://sfanow.in/sorryAthelete");
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