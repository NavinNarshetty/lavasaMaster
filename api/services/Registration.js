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
        type: String
    }],
    racquetSports: [{
        type: String
    }],
    combatSports: [{
        type: String
    }],
    targetSports: [{
        type: String
    }],
    individualSports: [{
        type: String
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
        var schoolname = data.schoolname;

        Registration.findOne({}, { //to check registration exist and if it exist retrive previous data
            _id: 0,
            registerID: 1,
            sfaID: 1,

        }).sort({
            createdAt: -1
        }).exec(function (err, schoolData) {
            console.log("schoolData", schoolData); // retrives registration data
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                if (_.isEmpty(schoolData)) {
                    var newDate = new Date();
                    var year = newDate.getFullYear();
                    data.registerID = 1; //init registerID 
                    var city = data.city;
                    var prefixCity = city.charAt(0);
                    console.log("prefixCity", prefixCity);
                    data.sfaID = prefixCity + "S" + year + data.registerID;
                    Registration.saveData(data, function (err, registerData) {
                        console.log("orderData", registerData);
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
                    console.log("isempty");
                } else {
                    console.log(schoolData.registerID);
                    var newDate = new Date();
                    var year = newDate.getFullYear();
                    var city = data.city;
                    console.log("City", city);
                    var prefixCity = city.charAt(0);
                    console.log("prefixCity", prefixCity);
                    data.registerID = schoolData.registerID + 1; //increment with previous refrence
                    data.sfaID = prefixCity + "S" + year + data.registerID; // prefix "S" for school
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
        smsData.mobile = data.mobile;

        smsData.content = "OTP" + mobileOtp + ",";
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