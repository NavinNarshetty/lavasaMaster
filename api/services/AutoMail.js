var schema = new Schema({});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('AutoMail', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    athleteMail: function (data, callback) {
        async.waterfall([
                function (callback) {
                    ConfigProperty.find().lean().exec(function (err, property) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(property)) {
                                callback(null, []);
                            } else {
                                data.property = property[0];
                                callback(null, data);
                            }
                        }
                    });
                },
                function (data, callback) {
                    Athelete.find().lean().exec(function (err, complete) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(complete)) {
                                callback(null, []);
                            } else {
                                callback(null, complete);
                            }
                        }
                    });

                },
                function (complete, callback) {
                    async.eachSeries(complete, function (found, callback) {
                            var emailData = {};
                            emailData.name = found.firstName;
                            emailData.from = "info@sfanow.in";
                            // emailData.email = found.email;
                            emailData.email1 = [{
                                email: found.email
                            }];
                            emailData.bcc1 = [{
                                email: "sunil.rathod@sfanow.in"
                            }];
                            emailData.city = data.property.sfaCity;
                            emailData.year = data.property.year;
                            emailData.type = "athelete"
                            emailData.filename = "athleteAutoMail.ejs";
                            emailData.subject = "SFA: Sports Registration Now Open";
                            console.log("complete", emailData);
                            Config.emailTo(emailData, function (err, emailRespo) {
                                if (err) {
                                    console.log(err);
                                    callback(null, err);
                                } else if (emailRespo) {
                                    callback(null, emailRespo);
                                } else {
                                    callback(null, "Invalid data");
                                }
                            });
                        },
                        function (err, emailData) {
                            callback(null, "all mail sent");
                        });
                }

            ],
            function (err, results) {
                if (err) {
                    console.log(err);
                    callback(null, results);
                } else if (results) {
                    if (_.isEmpty(results)) {
                        callback(null, results);
                    } else {
                        callback(null, results);
                    }
                }
            });
    },

    schoolMail: function (data, callback) {
        async.waterfall([
                function (callback) {
                    ConfigProperty.find().lean().exec(function (err, property) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(property)) {
                                callback(null, []);
                            } else {
                                data.property = property[0];
                                callback(null, data);
                            }
                        }
                    });
                },
                function (data, callback) {
                    Registration.find().lean().exec(function (err, complete) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(complete)) {
                                callback(null, []);
                            } else {
                                callback(null, complete);
                            }
                        }
                    });

                },
                function (complete, callback) {
                    async.each(complete, function (found, callback) {
                            var emailData = {};
                            emailData.from = "info@sfanow.in";
                            // emailData.email = found.email;
                            emailData.email1 = [{
                                email: found.email
                            }];
                            emailData.bcc1 = [{
                                email: "sunil.rathod@sfanow.in"
                            }];
                            emailData.city = data.property.sfaCity;
                            emailData.year = data.property.year;
                            emailData.type = data.property.institutionType;
                            emailData.filename = "athleteAutoMail.ejs";
                            emailData.subject = "SFA: Sports Registration Now Open";
                            Config.emailTo(emailData, function (err, emailRespo) {
                                if (err) {
                                    callback(null, err);
                                } else if (emailRespo) {
                                    callback(null, emailRespo);
                                } else {
                                    callback(null, "Invalid data");
                                }
                            });
                        },
                        function (err, emailData) {
                            callback(null, "all mail sent");
                        });
                }

            ],
            function (err, results) {
                if (err) {
                    console.log(err);
                    callback(null, results);
                } else if (results) {
                    if (_.isEmpty(results)) {
                        callback(null, results);
                    } else {
                        callback(null, results);
                    }
                }
            });
    },








};
module.exports = _.assign(module.exports, exports, model);