var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var uniqueValidator = require('mongoose-unique-validator');
var timestamps = require('mongoose-timestamp');
var validators = require('mongoose-validators');
var monguurl = require('monguurl');
var autoIncrement = require('mongoose-auto-increment');
var objectid = require("mongodb").ObjectID;
var moment = require('moment');
var request = require("request");
autoIncrement.initialize(mongoose);
require('mongoose-middleware').initialize(mongoose);


var schema = new Schema({
    registerID: Number,
    sfaID: {
        type: String,
        default: ""
    },
    status: String,

    schoolName: String,
    schoolType: String,
    schoolCategory: String,
    affiliatedBoard: String,
    schoolLogo: String,


    schoolAddress: String,
    schoolAddressLine2: String,
    state: String,
    district: String,
    city: String,
    locality: String,
    pinCode: String,


    contactPerson: String,
    landline: String,
    email: String,
    website: String,
    mobile: String,
    enterOTP: String,


    schoolPrincipalName: String,
    schoolPrincipalMobile: String,
    schoolPrincipalLandline: String,
    schoolPrincipalEmail: String,
    sportsDepartment: [{
        name: String,
        designation: String,
        mobile: String,
        email: String,
        photograph: String
    }],

    teamSports: [{
        name: {
            type: String
        }
    }],
    racquetSports: [{
        name: {
            type: String
        }
    }],
    combatSports: [{
        name: {
            type: String
        }
    }],
    targetSports: [{
        name: {
            type: String
        }
    }],
    individualSports: [{
        name: {
            type: String
        }
    }],

    registrationFee: String,
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);

schema.plugin(autoIncrement.plugin, {
    model: 'Registration',
    field: 'registerID',
    startAt: 1,
    incrementBy: 1
});
schema.plugin(timestamps);
module.exports = mongoose.model('Registration', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    saveRegistrationForm: function (data, callback) {
        data.status = "Pending";
        Registration.saveData(data, function (err, registerData) {
            console.log("registerData", registerData);
            if (err) {
                console.log("err", err);
                callback("There was an error while saving order", null);
            } else {
                if (_.isEmpty(registerData)) {
                    callback("No order data found", null);
                } else {
                    callback(null, registerData);
                }
            }
        });
    },

    generateSfaID: function (data, callback) {
        console.log("inside");
        var schoolname = data.schoolname;

        Registration.findOne({ //to check registration exist and if it exist retrive previous data
            _id: data._id
        }).sort({
            createdAt: -1
        }).exec(function (err, schoolData) {
            console.log("schoolData", schoolData); // retrives registration data
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                if (_.isEmpty(schoolData)) {
                    console.log("isempty");
                    callback(null, "No data found");
                } else {
                    console.log(schoolData.registerID);
                    if (data.sfaID = "") {
                        var newDate = new Date();
                        var year = newDate.getFullYear();
                        var city = schoolData.city;
                        console.log("City", city);
                        var prefixCity = city.charAt(0);
                        console.log("prefixCity", prefixCity);
                        var register = schoolData.registerID; //increment with previous refrence
                        data.sfaID = prefixCity + "S" + year + register; // prefix "S" for school

                    }
                    console.log("data", data);
                    Registration.saveData(data, function (err, registerData) {
                        console.log("Registration", registerData);
                        if (err) {
                            console.log("err", err);
                            callback("There was an error while saving order", null);
                        } else {
                            if (_.isEmpty(registerData)) {
                                callback("No order data found", null);
                            } else {
                                callback(null, registerData);
                            }
                        }
                    });
                }
            }
        });
    },

    getAllRegistrationDetails: function (data, callback) {
        Registration.find().exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, "Data is empty");
            } else {
                callback(null, found);
            }
        });

    },

    getOneRegistrationDetails: function (data, callback) {
        Registration.findOne({
            _id: data._id
        }).exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, "Data is empty");
            } else {
                callback(null, found);
            }

        });
    },

    generateOTP: function (data, callback) {
        var mobileOtp = (Math.random() + "").substring(2, 6);
        var smsData = {};
        console.log("mobileOtp", mobileOtp);
        smsData.mobile = data.mobile;

        smsData.content = "OTP School:Your Mobile OTP (One time Password) for SFA registration is " + mobileOtp;
        console.log("smsdata", smsData);
        Config.sendSms(smsData, function (err, smsRespo) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else if (smsRespo) {
                console.log(smsRespo, "sms sent");
                callback(null, smsRespo);
            } else {
                callback(null, "Invalid data");
            }
        });
    },

};
module.exports = _.assign(module.exports, exports, model);