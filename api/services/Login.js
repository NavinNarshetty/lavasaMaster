var generator = require('generate-password');

var schema = new Schema({});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Login', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    login: function (data, callback) {
        if (data.type == "school") {
            Login.SchoolToken(data, function (err, complete) {
                if (err) {
                    callback(err, null);
                } else {
                    if (_.isEmpty(complete)) {
                        callback(null, "Data not found");
                    } else {
                        callback(null, complete);
                    }
                }

            });

        } else if (data.type == "athlete") {
            Login.AthleteToken(data, function (err, complete) {
                if (err) {
                    callback(err, null);
                } else {
                    if (_.isEmpty(complete)) {
                        callback(null, "Data not found");
                    } else {
                        callback(null, complete);
                    }
                }
            });

        } else {
            callback("Incorrect Type", null);
        }

    },

    SchoolToken: function (data, callback) {
        var token = generator.generate({
            length: 16,
            numbers: true
        });
        console.log(token);
        var matchToken = {
            $set: {
                accessToken: token
            }
        }
        async.waterfall([
            function (callback) {
                Registration.update({
                    sfaID: data.sfaid
                }, matchToken).exec(
                    function (err, data3) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else if (data3) {
                            console.log("value :", data3);
                            callback(null, data3);
                        }
                    });
            },
            function (data3, callback) {
                console.log(data);
                Registration.findOne({
                    sfaID: data.sfaid,
                    password: data.password
                }).exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(found)) {
                        callback("Incorrect Login Details", null);
                    } else {
                        console.log("found", found);
                        callback(null, found);
                    }
                });
            }
        ], function (err, found) {
            if (found) {
                callback(null, found);
            }
        });


    },

    AthleteToken: function (data, callback) {
        var token = generator.generate({
            length: 16,
            numbers: true
        })
        var matchToken = {
            $set: {
                accessToken: token
            }
        }
        async.waterfall([
            function (callback) {
                Athelete.update({
                    sfaId: data.sfaid
                }, matchToken).exec(
                    function (err, data3) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else if (data3) {
                            console.log("value :", data3);
                            callback(null, data3);
                        }
                    });
            },
            function (data3, callback) {
                console.log(data);
                Athelete.findOne({
                    sfaId: data.sfaid,
                    password: data.password
                }).exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(found)) {
                        callback("Incorrect Login Details", null);
                    } else {
                        console.log("found", found);
                        callback(null, found);
                    }
                });
            }
        ], function (err, found) {
            if (found) {
                callback(null, found);
            }
        });

    },

    forgotPassword: function (data, callback) {
        if (data.type == "school") {
            Registration.findOne({
                sfaID: data.sfaid,
                email: data.email
            }).lean().exec(function (err, found) {
                if (err) {
                    callback(err, null);
                } else if (_.isEmpty(found)) {
                    callback("Incorrect User Details", null);
                } else {
                    var newPassword = generator.generate({
                        length: 8,
                        numbers: true
                    });
                    var matchObj = {
                        $set: {
                            password: newPassword
                        }
                    }
                    Registration.update({
                        _id: found._id
                    }, matchObj).exec(
                        function (err, data3) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else if (data3) {
                                console.log("New password generated");
                                var emailData = {};
                                emailData.from = "info@sfanow.in";
                                emailData.email = found.email;
                                emailData.password = newPassword;
                                emailData.filename = "forgotPassword.ejs";
                                emailData.subject = "SFA: Thank you for registering for SFA Mumbai 2017";
                                console.log("emaildata", emailData);
                                Config.email(emailData, function (err, emailRespo) {
                                    if (err) {
                                        console.log(err);
                                        callback(null, err);
                                    } else if (emailRespo) {
                                        callback(null, emailRespo);
                                    } else {
                                        callback(null, "Invalid data");
                                    }
                                });

                            }
                        });
                }

            });

        } else if (data.type == "athlete") {
            Athelete.findOne({
                sfaId: data.sfaid,
                email: data.email
            }).lean().exec(function (err, found) {
                if (err) {
                    callback(err, null);
                } else if (_.isEmpty(found)) {
                    callback("Incorrect User Details", null);
                } else {
                    var newPassword = generator.generate({
                        length: 8,
                        numbers: true
                    });
                    Athelete.update({
                        _id: found._id
                    }, newPassword).exec(
                        function (err, data3) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else if (data3) {
                                console.log("New password generated");
                                var emailData = {};
                                emailData.from = "info@sfanow.in";
                                emailData.email = found.email;
                                emailData.password = newPassword;
                                emailData.filename = "forgotPassword.ejs";
                                emailData.subject = "SFA: Thank you for registering for SFA Mumbai 2017";
                                console.log("emaildata", emailData);
                                Config.email(emailData, function (err, emailRespo) {
                                    if (err) {
                                        console.log(err);
                                        callback(null, err);
                                    } else if (emailRespo) {
                                        callback(null, emailRespo);
                                    } else {
                                        callback(null, "Invalid data");
                                    }
                                });

                            }
                        });
                }

            });

        } else {
            callback("Incorrect Type", null);
        }

    },

    changeSchoolPassword: function (data, callback) {
        if (data.password && data.password != "" && data.oldPassword && data.oldPassword != "") {
            if (data.password != data.oldPassword) {
                Registration.findOneAndUpdate({
                    _id: data._id,
                    password: data.oldPassword
                }, {
                    password: data.password
                }, function (err, data1) {
                    if (err) {
                        callback(null, {
                            error: err
                        });
                    } else if (data1) {
                        callback(null, data1);
                    } else {
                        callback(null, {
                            error: "Incorrect Old Password"
                        });
                    }
                });
            } else {
                callback(null, {
                    error: "Password match or Same password exist"
                });
            }
        } else {
            callback(null, "Invalid data");
        }
    },

    changeAthletePassword: function (data, callback) {
        if (data.password && data.password != "" && data.oldPassword && data.oldPassword != "") {
            if (data.password != data.oldPassword) {
                Athelete.findOneAndUpdate({
                    _id: data._id,
                    password: data.oldPassword
                }, {
                    password: data.password
                }, function (err, data1) {
                    if (err) {
                        callback(null, {
                            error: err
                        });
                    } else if (data1) {
                        callback(null, data1);
                    } else {
                        callback(null, {
                            error: "Incorrect Old Password"
                        });
                    }
                });
            } else {
                callback(null, {
                    error: "Password match or Same password exist"
                });
            }
        } else {
            callback(null, "Invalid data");
        }
    },

    tokenCheck: function (data, callback) {
        var response = {};
        if (data.schoolToken) {
            Registration.findOne({
                accessToken: data.schoolToken
            }).exec(function (err, found) {
                if (err) {
                    callback(err, null);
                } else if (_.isEmpty(found)) {
                    callback("Incorrect Login Details", null);
                } else {
                    response.school = found._id;
                    callback(null, response);
                }
            });

        } else if (data.athleteToken) {
            Athelete.findOne({
                accessToken: data.athleteToken
            }).exec(function (err, found) {
                if (err) {
                    callback(err, null);
                } else if (_.isEmpty(found)) {
                    callback("Incorrect Login Details", null);
                } else {
                    response.athlete = found._id;
                    callback(null, response);
                }
            });

        } else {
            callback(err, "User not Logged In");
        }
    },

    tokenRemove: function (data, callback) {
        var matchToken = {
            $set: {
                accessToken: " "
            }
        }
        var response = {};
        if (data.schoolToken) {
            Registration.update({
                accessToken: data.schoolToken
            }, matchToken).exec(
                function (err, data3) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    } else if (data3) {
                        console.log("value :", data3);
                        callback(null, "User Logged Out");
                    }
                });

        } else if (data.athleteToken) {
            Athelete.update({
                sfaId: data.sfaid
            }, matchToken).exec(
                function (err, data3) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    } else if (data3) {
                        console.log("value :", data3);
                        callback(null, "User Logged Out");
                    }
                });

        } else {
            callback(err, "User not Logged In");
        }
    },


};
module.exports = _.assign(module.exports, exports, model);