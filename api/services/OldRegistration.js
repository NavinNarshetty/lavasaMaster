var schema = new Schema({
    registerID: Number,
    institutionType: {
        type: String,
    },
    receiptId: Number,
    sfaID: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        default: "Pending"
    },
    password: String,
    year: String,
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
    aquaticsSports: [{
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
    paymentStatus: {
        type: String,
        default: "Pending"
    },
    verifyCount: {
        type: Number,
        default: 0,
    },
    transactionID: {
        type: String,
    },
    verifiedDate: Date,
    remarks: String,
    accessToken: String,
    utm_medium: String,
    utm_source: String,
    utm_campaign: String,
    panNo: String,
    gstNo: String
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('OldRegistration', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    setRegistration: function (data, callback) {
        async.waterfall([
                function (callback) {
                    OldRegistration.find({}).lean().exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(found)) {
                            callback(null, "Data is empty");
                        } else {
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    OldRegistration.saveRegistrationSchool(found, function (err, complete) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, complete);
                        }
                    });
                }
            ],
            function (err, complete) {
                if (err) {
                    callback(err, null);
                } else if (_.isEmpty(complete)) {
                    callback(null, []);
                } else {
                    callback(null, complete);
                }
            });
    },

    saveRegistrationSchool: function (data, callback) {
        async.concatSeries(data, function (singleData, callback) {
            async.waterfall([
                function (callback) {
                    Registration.findOne({
                        sfaID: singleData.sfaID
                    }).lean().exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(found)) {
                            var formData = {};
                            formData.sfaID = singleData.sfaID;
                            formData.receiptId = singleData.receiptId;
                            formData.institutionType = singleData.institutionType;
                            formData.password = singleData.password;
                            var arr = [];
                            arr.push(singleData.year);
                            singleData.year = arr;
                            formData.year = singleData.year;
                            formData.schoolName = singleData.schoolName;
                            formData.state = singleData.state;
                            formData.city = singleData.city;
                            formData.registrationFee = singleData.registrationFee;
                            formData.verifyCount = singleData.verifyCount;
                            formData.paymentStatus = singleData.paymentStatus;
                            formData.individualSports = singleData.individualSports;
                            formData.targetSports = singleData.targetSports;
                            formData.combatSports = singleData.combatSports;
                            formData.aquaticsSports = singleData.aquaticsSports;
                            formData.racquetSports = singleData.racquetSports;
                            formData.teamSports = singleData.teamSports;
                            formData.sportsDepartment = singleData.sportsDepartment;
                            formData.status = singleData.status;
                            formData.currentYear = singleData.year;
                            callback(null, formData);
                        } else {
                            var formData = {};
                            found.year.push(singleData.year);
                            if (found.currentYear < singleData.year) {
                                formData._id = found._id;
                                formData.sfaID = singleData.sfaID;
                                formData.receiptId = singleData.receiptId;
                                formData.institutionType = singleData.institutionType;
                                formData.password = singleData.password;
                                formData.year = found.year;
                                formData.schoolName = singleData.schoolName;
                                formData.state = singleData.state;
                                formData.city = singleData.city;
                                formData.registrationFee = singleData.registrationFee;
                                formData.verifyCount = singleData.verifyCount;
                                formData.paymentStatus = singleData.paymentStatus;
                                formData.individualSports = singleData.individualSports;
                                formData.targetSports = singleData.targetSports;
                                formData.combatSports = singleData.combatSports;
                                formData.aquaticsSports = singleData.aquaticsSports;
                                formData.racquetSports = singleData.racquetSports;
                                formData.teamSports = singleData.teamSports;
                                formData.sportsDepartment = singleData.sportsDepartment;
                                formData.status = singleData.status;
                                formData.currentYear = singleData.currentYear;
                            } else {
                                formData._id = found._id;
                                formData.sfaID = found.sfaID;
                                formData.receiptId = found.receiptId;
                                formData.institutionType = found.institutionType;
                                formData.password = found.password;
                                formData.year = found.year;
                                formData.schoolName = found.schoolName;
                                formData.state = found.state;
                                formData.city = found.city;
                                formData.registrationFee = found.registrationFee;
                                formData.verifyCount = found.verifyCount;
                                formData.paymentStatus = found.paymentStatus;
                                formData.individualSports = found.individualSports;
                                formData.targetSports = found.targetSports;
                                formData.combatSports = found.combatSports;
                                formData.aquaticsSports = found.aquaticsSports;
                                formData.racquetSports = found.racquetSports;
                                formData.teamSports = found.teamSports;
                                formData.sportsDepartment = found.sportsDepartment;
                                formData.status = found.status;
                                formData.currentYear = found.currentYear;
                            }
                            callback(null, formData);
                        }
                    });
                },
                function (formData, callback) {
                    console.log("found", formData);
                    Registration.saveData(formData, function (err, registerData) {
                        if (err) {
                            callback("There was an error while saving data", null);
                        } else if (_.isEmpty(registerData)) {
                            callback("No register data found", null);
                        } else {
                            callback(null, registerData);
                        }
                    });
                }
            ], function (err, complete) {
                if (err) {
                    callback(err, null);
                } else if (_.isEmpty(complete)) {
                    callback(null, []);
                } else {
                    callback(null, complete);
                }
            });
        }, function (err, final) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, final);
            }
        })

    }


};
module.exports = _.assign(module.exports, exports, model);