var generator = require('generate-password');
var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var uniqueValidator = require('mongoose-unique-validator');
// var timestamps = require('mongoose-timestamp');
var validators = require('mongoose-validators');
var monguurl = require('monguurl');
var objectid = require("mongodb").ObjectID;
var lodash = require('lodash');
var moment = require('moment');

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
        async.waterfall([
            function (callback) {
                Registration.findOne({
                    sfaID: data.sfaid,
                    status: "Verified"
                }).exec(function (err, found) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    } else if (found) {
                        console.log("found", found);
                        if (_.isEmpty(found.accessToken) || found.accessToken == " ") {
                            data.tokenExist = false;
                            callback(null, data);
                        } else {
                            data.tokenExist = true;
                            callback(null, data);
                        }

                    }
                });
            },
            function (data, callback) {
                if (data.tokenExist == false) {
                    var token = generator.generate({
                        length: 16,
                        numbers: true
                    })
                    var matchToken = {
                        $set: {
                            accessToken: token
                        }
                    }
                    Registration.update({
                        sfaID: data.sfaid
                    }, matchToken).exec(function (err, data3) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else if (data3) {
                            console.log("value :", data3);
                            callback(null, data3);
                        }
                    });
                } else {
                    var data3 = data;
                    callback(null, data3);
                }
            },
            function (data3, callback) {
                console.log(data);
                Registration.findOne({
                    sfaID: data.sfaid,
                    status: "Verified",
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
            } else {
                callback("Incorrect Login Details", null);
            }
        });

    },

    AthleteToken: function (data, callback) {

        async.waterfall([
            function (callback) {
                Athelete.findOne({
                    sfaId: data.sfaid,
                    status: "Verified"
                }).exec(function (err, found) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    } else if (found) {
                        console.log("found", found);
                        if (_.isEmpty(found.accessToken) || found.accessToken == " ") {
                            data.tokenExist = false;
                            callback(null, data);
                        } else {
                            data.tokenExist = true;
                            callback(null, data);
                        }

                    }
                });
            },
            function (data, callback) {
                if (data.tokenExist == false) {
                    var token = generator.generate({
                        length: 16,
                        numbers: true
                    })
                    var matchToken = {
                        $set: {
                            accessToken: token
                        }
                    }
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
                } else {
                    var data3 = data;
                    callback(null, data3);
                }
            },
            function (data3, callback) {
                Athelete.aggregate([{
                            // Stage 1

                            $lookup: {
                                "from": "schools",
                                "localField": "school",
                                "foreignField": "_id",
                                "as": "school"
                            }
                        },

                        // Stage 2
                        {
                            $unwind: {
                                path: "$school",
                                preserveNullAndEmptyArrays: true // optional
                            }
                        },

                        // Stage 3
                        {
                            $match: {
                                "sfaId": data.sfaid,
                                "status": "Verified",
                                "password": data.password
                            }
                        }
                    ],
                    function (err, found) {
                        console.log('found', found);
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(found)) {
                            callback("Incorrect Login Details", null);
                        } else {
                            console.log("found", found);
                            callback(null, found[0]);
                        }
                    });
            }
        ], function (err, found) {
            if (found) {
                callback(null, found);
            } else {
                callback("Incorrect Login Details", null);
            }
        });

    },

    oldforgotPassword: function (data, callback) {
        var sfatype = data.sfaid.charAt(1);
        console.log(sfatype, data);
        if (data.type == "school" && sfatype == 'S') {
            Registration.findOne({
                sfaID: data.sfaid,
                status: "Verified",
                email: {
                    $regex: data.email,
                    $options: "i"
                }
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
                                emailData.from = data.property.infoId;
                                emailData.sfaid = found.sfaID;
                                emailData.email = found.email;
                                emailData.city = data.property.sfaCity;
                                emailData.year = data.property.year;
                                emailData.eventYear = data.property.eventYear;
                                emailData.infoId = data.property.infoId;
                                emailData.infoNo = data.property.infoNo;
                                emailData.cityAddress = data.property.cityAddress;
                                emailData.ddFavour = data.property.ddFavour;
                                emailData.password = newPassword;
                                emailData.filename = "forgotPassword.ejs";
                                emailData.subject = "SFA: Thank you for registering for SFA " + emailData.city + " " + emailData.eventYear;
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

        } else if (data.type == "athlete" && sfatype == 'A') {
            Athelete.findOne({
                sfaId: data.sfaid,
                status: "Verified",
                email: {
                    $regex: data.email,
                    $options: "i"
                }
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
                    Athelete.update({
                        _id: found._id
                    }, matchObj).exec(
                        function (err, data3) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else if (data3) {
                                console.log("New password generated");
                                var emailData = {};
                                emailData.from = data.property.infoId;
                                emailData.sfaid = found.sfaId;
                                emailData.email = found.email;
                                emailData.city = data.property.sfaCity;
                                emailData.year = data.property.year;
                                emailData.eventYear = data.property.eventYear;
                                emailData.infoId = data.property.infoId;
                                emailData.infoNo = data.property.infoNo;
                                emailData.cityAddress = data.property.cityAddress;
                                emailData.ddFavour = data.property.ddFavour;
                                emailData.password = newPassword;
                                emailData.filename = "forgotPassword.ejs";
                                emailData.subject = "SFA: Thank you for registering for SFA " + emailData.city + " " + emailData.eventYear;
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

    forgotPassword: function (data, callback) {
        var sfatype = data.sfaId.charAt(1);

        if (data.type == "school" && sfatype == 'S') {
            Registration.findOne({
                sfaID: data.sfaId,
                status: "Verified"
            }).lean().exec(function (err, found) {
                if (err) {
                    callback("Internal Error", null);
                } else if (_.isEmpty(found)) {
                    callback("Invalid Sfa Id", null);
                } else {
                    var otp ="";
                    async.waterfall([
                        
                        //generate 4-digit OTP
                        function (callback) {
                            otp = Athelete.generateOtp();
                            console.log("otp",otp);
                            callback();
                        },

                        //save in schools Profile (Registration Table)
                        function (callback) {
                            var updateObj = {
                                "enterOTP":otp
                            }
                            Registration.update({
                                _id: found._id
                            }, updateObj).exec(callback);
                        },

                        //send OTP on Mobile
                        function(resp,callback){    
                            if(found.mobile){
                                console.log("OTP Sent On Mobile ");
                                var mobileObj = {
                                    "otp":otp,
                                    "mobile":found.mobile,
                                    "content":"OTP Athlete: Your Mobile OTP (One time Password) for SFA registration is "
                                }
                                Athelete.sendOTPMobile(mobileObj,callback);
                            }else{
                                callback(null,"Move Ahead");
                            }
                        },

                        // send OTP on email
                        function(resp,callback){
                            console.log("OTP Sent On Email");                          
                            var emailObj = {
                                "emailOtp":otp,
                                "mobile":found.mobile,
                                "content":"OTP Athlete: Your Mobile OTP (One time Password) for SFA registration is ",
                                "from":"info@sfanow.in",
                                "filename": "emailOtp.ejs",
                                "subject": "SFA: Your Email OTP (One time Password) for SFA registration is"
                            }
                    
                            // Config.email(emailObj,callback);
                            callback(null,"Next");
                        },

                        function(resp,callback){
                            var sendObj = {
                                "sfaId":found.sfaID,
                                "mobile":found.mobile,
                                "email":found.email,
                                "accessToken":found.accessToken
                            }
                            callback(null,sendObj);
                        }
                    ],callback);
                }

            });

        } else if (data.type == "athlete" && sfatype == 'A') {
            Athelete.findOne({
                sfaId: data.sfaid,
                status: "Verified",
                email: {
                    $regex: data.email,
                    $options: "i"
                }
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
                    Athelete.update({
                        _id: found._id
                    }, matchObj).exec(
                        function (err, data3) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                            } else if (data3) {
                                console.log("New password generated");
                                var emailData = {};
                                emailData.from = data.property.infoId;
                                emailData.sfaid = found.sfaId;
                                emailData.email = found.email;
                                emailData.city = data.property.sfaCity;
                                emailData.year = data.property.year;
                                emailData.eventYear = data.property.eventYear;
                                emailData.infoId = data.property.infoId;
                                emailData.infoNo = data.property.infoNo;
                                emailData.cityAddress = data.property.cityAddress;
                                emailData.ddFavour = data.property.ddFavour;
                                emailData.password = newPassword;
                                emailData.filename = "forgotPassword.ejs";
                                emailData.subject = "SFA: Thank you for registering for SFA " + emailData.city + " " + emailData.eventYear;
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

    validateOtp:function(data,callback){
        var sfatype = data.sfaId.charAt(1);
        
        if (data.type == "school" && sfatype == 'S') {
            Registration.findOne({
                sfaID: data.sfaId,
                status: "Verified"
            }).lean().exec(function (err, found) {
                if (err) {
                    callback("Internal Error", null);
                } else if (_.isEmpty(found)) {
                    callback("Invalid Sfa Id", null);
                } else {
                    if(found.enterOTP == data.otp){
                        callback(null,"Correct OTP")
                    }else{
                        callback("Incorrect OTP",null)
                    }
                }
            });

        } else if (data.type == "athlete" && sfatype == 'A') {
            Athelete.findOne({
                sfaId: data.sfaid,
                status: "Verified",
                email: {
                    $regex: data.email,
                    $options: "i"
                }
            }).lean().exec(function (err, found) {
                if (err) {
                    callback(err, null);
                } else if (_.isEmpty(found)) {
                    callback("Incorrect User Details", null);
                } else {

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
                        callback(null, "Password Successfully Updated");
                    } else {
                        callback("Incorrect Old Password", null);
                    }
                });
            } else {
                callback("Password match or Same password exist", null);
            }
        } else {
            callback("Invalid data", null);
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
                        callback(null, "Password Successfully Updated");
                    } else {
                        callback("Incorrect Old Password", null);
                    }
                });
            } else {
                callback("Password match or Same password exist", null);
            }
        } else {
            callback("Invalid data", null);
        }
    },

    resetSchoolPassword: function (data, callback) {
        if (data.newPassword && data.newPassword != "" && data.confirmPassword && data.confirmPassword != "") {
            if (data.newPassword == data.confirmPassword) {
                Registration.findOneAndUpdate({
                    _id: data._id
                }, {
                    password: data.newPassword
                }, function (err, data1) {
                    if (err) {
                        callback(null, {
                            error: err
                        });
                    } else if (data1) {
                        callback(null, "Password Successfully Updated");
                    } else {
                        callback("Error Occured While Updating", null);
                    }
                });
            } else {
                callback("MisMatch Password And Confirm Password", null);
            }
        } else {
            callback("Invalid data", null);
        }
    },

    resetAthletePassword: function (data, callback) {
        if (data.newPassword && data.newPassword != "" && data.confirmPassword && data.confirmPassword != "") {
            if (data.newPassword == data.confirmPassword) {
                Athelete.findOneAndUpdate({
                    _id: data._id,
                }, {
                    password: data.newPassword
                }, function (err, data1) {
                    if (err) {
                        callback(null, {
                            error: err
                        });
                    } else if (data1) {
                        callback(null, "Password Successfully Updated");
                    } else {
                        callback("Error Occured While Updating", null);
                    }
                });
            } else {
                callback("MisMatch Password And Confirm Password", null);
            }
        } else {
            callback("Invalid data", null);
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
            callback("User not Logged In", null);
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
                accessToken: data.athleteToken
                // sfaId: data.sfaid
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
            callback("User not Logged In", null);
        }
    },
    getSchoolPipeLine: function (data) {

        var pipeline = [{
                $match: {
                    "_id": objectid(data.buf)
                }
            },


            // Stage 1
            {
                $lookup: {
                    "from": "schools",
                    "localField": "school",
                    "foreignField": "_id",
                    "as": "school"
                }
            },

            // Stage 2
            {
                $unwind: {
                    path: "$school",
                    preserveNullAndEmptyArrays: true // optional
                }
            },

        ];
        return pipeline;
    },

    editAccess: function (data, callback) {
        if (data.athleteId) {
            async.waterfall([
                function (callback) {
                    var buf = Buffer.from(data.athleteId, 'base64').toString("ascii");
                    console.log("base64", buf);
                    callback(null, buf);
                },
                function (buf, callback) {
                    Athelete.findOne({
                        _id: buf
                    }).exec(function (err, found) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else if (found) {
                            console.log("found", found);
                            if (_.isEmpty(found.accessToken) || found.accessToken == " ") {
                                data.tokenExist = false;
                                data.buf = buf;
                                callback(null, data);
                            } else {
                                data.tokenExist = true;
                                data.buf = buf;
                                callback(null, data);
                            }
                        }
                    });
                },
                function (data, callback) {
                    if (data.tokenExist == false) {
                        var token = generator.generate({
                            length: 16,
                            numbers: true
                        })
                        var matchToken = {
                            $set: {
                                accessToken: token
                            }
                        }
                        Athelete.update({
                            _id: data.buf
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
                    } else {
                        var data3 = data;
                        console.log("data3", data3);
                        callback(null, data3);
                    }
                },
                function (data3, callback) {
                    // console.log("data", data);
                    var pipeLine = Login.getSchoolPipeLine(data3);
                    Athelete.aggregate(pipeLine, function (err, found) {
                        if (err) {
                            console.log(err);
                            callback(err, "error in mongoose");
                        } else {
                            if (_.isEmpty(found)) {
                                callback("inside empty");
                                callback(null, []);
                            } else {
                                var finalData = {};
                                finalData.data = found[0];
                                finalData.userType = "athlete";
                                finalData.mixAccess = true;
                                console.log("finalData", finalData);
                                callback(null, finalData);
                            }
                        }
                    });
                }
            ], function (err, found) {
                if (found) {
                    callback(null, found);
                } else {
                    callback("Incorrect Login Details", null);
                }
            });
        } else if (data.schoolId) {
            async.waterfall([
                function (callback) {
                    var buf = Buffer.from(data.schoolId, 'base64').toString("ascii");
                    console.log("base64", buf);
                    callback(null, buf);
                },
                function (buf, callback) {
                    Registration.findOne({
                        _id: buf
                    }).exec(function (err, found) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else if (found) {
                            console.log("found", found);
                            if (_.isEmpty(found.accessToken) || found.accessToken == " ") {
                                data.tokenExist = false;
                                data.buf = buf;
                                callback(null, data);
                            } else {
                                data.tokenExist = true;
                                data.buf = buf;
                                callback(null, data);
                            }
                        }
                    });
                },
                function (data, callback) {
                    if (data.tokenExist == false) {
                        var token = generator.generate({
                            length: 16,
                            numbers: true
                        })
                        var matchToken = {
                            $set: {
                                accessToken: token
                            }
                        }
                        Registration.update({
                            _id: data.buf
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
                    } else {
                        var data3 = data;
                        callback(null, data3);
                    }
                },

                function (data3, callback) {
                    Registration.findOne({
                        _id: data.buf
                    }).exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(found)) {
                            callback(null, []);
                        } else {
                            var finalData = {};
                            finalData.data = found;
                            finalData.userType = "school";
                            finalData.mixAccess = true;
                            console.log("finalData", finalData);
                            callback(null, finalData);
                        }
                    });
                }
            ], function (err, found) {
                if (found) {
                    callback(null, found);
                } else {
                    callback("Incorrect Login Details", null);
                }
            });

        } else {
            callback("Incorrect User Details", null);
        }
    }
};
module.exports = _.assign(module.exports, exports, model);