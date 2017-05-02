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
var schema = new Schema({

    atheleteID: Number,
    sfaId: String,
    status: String,
    school: {
        type: Schema.Types.ObjectId,
        ref: 'Registration',
        index: true
    },
    idProof: String,

    surname: String,
    firstName: String,
    athleteMiddleName: String,
    gender: String,
    standard: String,
    bloodGroup: String,
    photograph: String,
    dob: Date,
    age: String,
    ageProof: String,
    photoImage: String,
    birthImage: String,
    playedTournaments: {
        type: Boolean,
        default: "false"
    },
    sportLevel: [{
        level: String,
        sport: String,
    }],


    mobile: String,
    smsOTP: String,
    email: String,
    emailOTP: String,

    address: String,
    addressLine2: String,
    state: String,
    district: String,
    city: String,
    pinCode: String,

    termsAndCondition: {
        type: Boolean,
        default: "false"
    },
    parentDetails: [{
        relation: String,
        name: String,
        surname: String,
        mobile: String,
        email: String
    }],
    atheleteSchoolName: String,
    atheleteSchoolLocality: String,
    atheleteSchoolContact: String,
    atheleteSchoolIdImage: String,
    registrationFee: String
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(autoIncrement.plugin, {
    model: 'Athelete',
    field: 'atheleteID',
    startAt: 1,
    incrementBy: 1
});
schema.plugin(timestamps);
module.exports = mongoose.model('Athelete', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    //on athelete save and submit press 
    saveAthelete: function (data, callback) {
        data.status = "Pending";
        Athelete.saveData(data, function (err, athleteData) {
            console.log("athleteData", athleteData);
            if (err) {
                console.log("err", err);
                callback("There was an error while saving order", null);
            } else {
                if (_.isEmpty(athleteData)) {
                    callback("No order data found", null);
                } else {
                    callback(null, athleteData);
                }
            }
        });
    },

    generateAtheleteSfaID: function (data, callback) {
        //find and first time atheleteID idea is for string id generation if required
        Athelete.findOne({
            _id: data_id
        }).sort({
            createdAt: -1
        }).exec(function (err, found) {
            console.log("found", found);
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                if (_.isEmpty(found)) {
                    console.log("isempty");
                    callback("No order data found", null);
                } else {
                    var newDate = new Date();
                    var year = newDate.getFullYear();
                    var city = found.city;
                    var prefixCity = city.charAt(0);
                    console.log("prefixCity", prefixCity);
                    data.sfaId = prefixCity + "A" + year + found.atheleteID;
                    data.status = "verified";
                    Athelete.saveData(data, function (err, athleteData) { //saves data to database collection
                        console.log("athleteData", athleteData);
                        if (err) {
                            console.log("err", err);
                            callback("There was an error while saving order", null);
                        } else {
                            if (_.isEmpty(athleteData)) {
                                callback("No order data found", null);
                            } else {
                                callback(null, athleteData);
                            }
                        }
                    });
                }
            }
        });
    },
    getAllAtheleteDetails: function (data, callback) {
        Athelete.find().exec(function (err, found) { //finds all athelete
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, "Data is empty");
            } else {
                callback(null, found);
            }
        });

    },

    getOneAtheleteDetails: function (data, callback) {
        Athelete.findOne({ //finds one with refrence to id
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