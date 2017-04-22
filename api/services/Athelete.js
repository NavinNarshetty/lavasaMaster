var schema = new Schema({

    atheleteID: String,
    school: {
        type: Schema.Types.ObjectId,
        ref: 'Registration',
        index: true
    },
    idProof: String,
    athleteDetails: {
        surname: String,
        firstName: String,
        middleName: String,
        gender: String,
        standard: String,
        photograph: String,
        dob: Date,
        ageProof: String,
        playedTournaments: {
            type: Boolean,
            default: "false"
        },
    },
    contactDetails: {
        mobile: String,
        enterOTP: String,
        email: String,
        residentialAddress: {
            address: String,
            state: String,
            district: String,
            city: String,
            pinCode: String
        }
    },
    parentDetails: {
        termsAndCondition: {
            type: Boolean,
            default: "false"
        },
        details: [{
            relation: String,
            name: String,
            surname: String,
            mobile: String,
            email: String
        }]

    },
    registrationFee: String
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Athelete', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    //on athelete save and submit press 
    saveAthelete: function (data, callback) {
        //find and first time atheleteID idea is for string id generation if required
        Athelete.findOne({}, {
            _id: 0,
        }).sort({
            createdAt: -1
        }).exec(function (err, found) {
            console.log("found", found);
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                if (_.isEmpty(found)) {
                    data.atheleteID = 1; //init atheleteID for first time
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
                    console.log("isempty");
                } else {
                    data.atheleteID = found.atheleteID + 1; //increment next atheleteID
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
                }
            }
        });
    },

    getAllAtheleteDetails: function (data, callback) {
        Athelete.find().exec(function (err, found) {
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
        Athelete.findOne({
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