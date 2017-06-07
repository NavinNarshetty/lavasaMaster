module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    login: function (req, res) {
        // var callback = function (err, data) {
        //     if (err || _.isEmpty(data)) {
        //         res.json({
        //             error: err,
        //             value: false
        //         });
        //     } else {
        //         if (data) {
        //             req.session.user = data;
        //             //req.session.save();
        //             console.log("session", req.session.user);
        //             res.json({
        //                 data: data,
        //                 value: true
        //             });
        //         } else {

        //             req.session.user = {};
        //             res.json({
        //                 data: {},
        //                 value: false
        //             });
        //         }
        //     }
        // };
        if (req.body) {
            if (req.body.sfaid && req.body.sfaid !== "" && req.body.password && req.body.password !== "" && req.body.type && req.body.type !== "") {
                Login.login(req.body, callback);
            } else {
                res.json({
                    data: "Please provide params",
                    value: true
                });
            }
        } else {
            res.json({
                data: "Invalid Call",
                value: true
            });
        }
    },
    logout: function (req, res) {
        req.session.destroy(function (err) {
            res.json({
                data: "Logout Successful",
                value: true
            });
        });
    },

    forgotPasswordSchool: function (req, res) {
        if (req.body) {
            if (req.body.email && req.body.email !== "" && req.body.sfaid && req.body.sfaid !== "" && req.body.type && req.body.type !== "") {
                if (req.body.type == "school") {
                    Login.forgotPassword(req.body, res.callback);
                } else {
                    res.json({
                        value: false,
                        data: "Only School can Change Password"
                    });
                }
            } else {
                res.json({
                    value: false,
                    data: "Please provide All Details"
                });
            }
        } else {
            res.json({
                value: false,
                data: "Invalid Call"
            });
        }
    },

    forgotPasswordAthlete: function (req, res) {
        if (req.body) {
            if (req.body.email && req.body.email !== "" && req.body.sfaid && req.body.sfaid !== "" && req.body.type && req.body.type !== "") {
                if (req.body.type == "athlete") {
                    Login.forgotPassword(req.body, res.callback);
                } else {
                    res.json({
                        value: false,
                        data: "Only Athlete can Change Password"
                    });
                }
            } else {
                res.json({
                    value: false,
                    data: "Please provide All Details"
                });
            }
        } else {
            res.json({
                value: false,
                data: "Invalid Call"
            });
        }
    },

    changePassword: function (req, res) {
        if (req.body) {
            if (req.body.schoolToken) {
                Registration.findOne({
                    accessToken: req.body.schoolToken
                }).exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(found)) {
                        callback("Incorrect Login Details", null);
                    } else {
                        req.body._id = found._id;
                        Login.changePassword(req.body, function (err, data) {
                            if (err) {
                                res.json({
                                    value: false,
                                    data: err
                                });
                            } else {
                                res.json({
                                    value: true,
                                    data: data
                                });
                            }
                        });
                    }
                });

            } else if (req.body.athleteToken) {
                Athelete.findOne({
                    accessToken: req.body.athleteToken
                }).exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(found)) {
                        callback("Incorrect Login Details", null);
                    } else {
                        req.body._id = found._id;
                        Login.changePassword(req.body, function (err, data) {
                            if (err) {
                                res.json({
                                    value: false,
                                    data: err
                                });
                            } else {
                                res.json({
                                    value: true,
                                    data: data
                                });
                            }
                        });
                    }
                });

            } else {
                res.json({
                    value: false,
                    data: "User Not logged in"
                });
            }
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
};
module.exports = _.assign(module.exports, controller);