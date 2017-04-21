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
    schoolDetails: {
        schoolName: String,
        schoolType: String,
        schoolCategory: String,
        affiliatedBoard: String,
        schoolLogo: String
    },
    contactDetails: {
        schoolAddress: String,
        state: String,
        district: String,
        city: String,
        locality: String,
        pinCode: String
    },
    detailsForCorrespondence: {
        contactPerson: String,
        landline: String,
        email: String,
        website: String,
        mobile: String,
        enterOTP: String
    },
    schoolPrincipal: {
        name: String,
        mobile: String,
        landline: String,
        email: String
    },
    sportsDepartment: [{
        name: String,
        designation: String,
        mobile: String,
        email: String,
        photograph: String
    }],
    selectedSports: {
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
        }]
    },
    registrationFee: {
        cash: {
            type: Boolean,
            default: "false"
        },
        chequeDD: {
            type: Boolean,
            default: "false"
        },

        onlinePAYU: {
            type: Boolean,
            default: "false"
        },
    }
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
        // Registration.findOne({}, {
        //     _id: 0,
        //     // sfaID: 1,
        //     // schoolName: schoolname
        // }).sort({
        //     createdAt: -1
        // }).exec(function (err, schoolData) {
        //     console.log("schoolData", schoolData);
        //     if (err) {
        //         console.log(err);
        //         callback(err, null);
        //     } else {
        //         if (_.isEmpty(schoolData)) {
        //             console.log("isempty");
        //         } else {
        // data.sfaID = "SFA" + 1;
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
        //         }
        //     }
        // });
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

};
module.exports = _.assign(module.exports, exports, model);