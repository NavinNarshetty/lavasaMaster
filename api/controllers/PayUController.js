module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    schoolPayment: function (req, res) {
        if (req) {
            var id = (req.query.id);
            Registration.findOne({
                _id: id
            }).lean().exec(function (err, data) {
                PayU.schoolPayment(data, function (err, httpResponse) {
                    if (httpResponse.statusCode == 302) {
                        res.redirect(httpResponse.headers.location);
                    } else {
                        res.send(data);
                    }
                });
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
            var id = (req.query.id);
            Athelete.findOne({
                _id: id
            }).lean().exec(function (err, data) {
                PayU.atheletePayment(data, function (err, httpResponse) {
                    if (httpResponse.statusCode == 302) {
                        res.redirect(httpResponse.headers.location);
                    } else {
                        res.send(data);
                    }
                });
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
                        res.redirect("https://sfanow.in/paymentSuccess");

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
                                res.redirect("https://sfanow.in/paymentFailure");
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
                        console.log('amoutn not match issue');
                        // res.redirect("http://localhost:8080/#/sorry/" + orderid + "/" + finalPayAmt);
                        res.json({
                            value: false,
                            data: "Invalid Request"
                        });
                    } else {
                        res.redirect("https://sfanow.in/paymentSuccess");
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
                                res.redirect("https://sfanow.in/sorryAthelete");
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
};
module.exports = _.assign(module.exports, controller);