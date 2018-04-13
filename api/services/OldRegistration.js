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
    gstNo: String,

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
                        sfaID: singleData.sfaID,
                        status: "Verified"
                    }).lean().exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(found)) {
                            var formData = {};
                            formData.currentYear = singleData.year;
                            // if (_.includes(singleData.sfaID, "15")) {
                            //     var len = singleData.sfaID.length;
                            //     var sfa = singleData.sfaID.substring(4, len);
                            //     formData.sfaID = "MS16" + sfa;
                            // } else {
                            formData.sfaID = singleData.sfaID;
                            // }
                            formData.receiptId = singleData.receiptId;
                            formData.institutionType = singleData.institutionType;
                            formData.password = singleData.password;
                            var arr = [];
                            arr.push(singleData.year);
                            singleData.year = arr;
                            formData.year = singleData.year;
                            formData.mobile = singleData.mobile;
                            formData.email = singleData.email;
                            formData.schoolName = singleData.schoolName;
                            if (singleData.schoolType) {
                                formData.schoolType = singleData.schoolType;
                            }
                            if (singleData.schoolLogo) {
                                formData.schoolLogo = singleData.schoolLogo;
                            }
                            if (singleData.schoolCategory) {
                                formData.schoolCategory = singleData.schoolCategory;
                            }
                            if (singleData.affiliatedBoard) {
                                formData.affiliatedBoard = singleData.affiliatedBoard;
                            }
                            if (singleData.schoolAddress) {
                                formData.schoolAddress = singleData.schoolAddress;
                            }
                            if (singleData.schoolAddressLine2) {
                                formData.schoolAddressLine2 = singleData.schoolAddressLine2;
                            }
                            formData.state = singleData.state;
                            if (singleData.district) {
                                formData.district = singleData.district;
                            }
                            formData.city = singleData.city;
                            if (singleData.locality) {
                                formData.locality = singleData.locality;
                            }
                            if (singleData.pinCode) {
                                formData.pinCode = singleData.pinCode;
                            }
                            if (singleData.contactPerson) {
                                formData.contactPerson = singleData.contactPerson;
                            }
                            if (singleData.landline) {
                                formData.landline = singleData.landline;
                            }
                            if (singleData.email) {
                                formData.email = singleData.email;
                            }
                            if (singleData.schoolPrincipalEmail) {
                                formData.schoolPrincipalEmail = singleData.schoolPrincipalEmail;
                            }
                            if (singleData.schoolPrincipalLandline) {
                                formData.schoolPrincipalLandline = singleData.schoolPrincipalLandline;
                            }
                            if (singleData.schoolPrincipalMobile) {
                                formData.schoolPrincipalMobile = singleData.schoolPrincipalMobile;
                            }
                            if (singleData.schoolPrincipalName) {
                                formData.schoolPrincipalName = singleData.schoolPrincipalName;
                            }
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
                            formData.oldId = singleData._id;
                            callback(null, formData);
                        } else {
                            var formData = {};
                            // 
                            var i = (found.year.length - 1);
                            if (singleData.year > found.year[i]) {
                                formData._id = found._id;
                                formData.sfaID = singleData.sfaID;
                                formData.receiptId = singleData.receiptId;
                                formData.institutionType = singleData.institutionType;
                                formData.password = singleData.password;
                                found.year.push(singleData.year);
                                formData.year = found.year;
                                formData.schoolName = singleData.schoolName;
                                if (singleData.schoolType) {
                                    formData.schoolType = singleData.schoolType;
                                }
                                if (singleData.schoolLogo) {
                                    formData.schoolLogo = singleData.schoolLogo;
                                }
                                if (singleData.schoolCategory) {
                                    formData.schoolCategory = singleData.schoolCategory;
                                }
                                if (singleData.affiliatedBoard) {
                                    formData.affiliatedBoard = singleData.affiliatedBoard;
                                }
                                if (singleData.schoolAddress) {
                                    formData.schoolAddress = singleData.schoolAddress;
                                }
                                if (singleData.schoolAddressLine2) {
                                    formData.schoolAddressLine2 = singleData.schoolAddressLine2;
                                }

                                formData.state = singleData.state;
                                if (singleData.district) {
                                    formData.district = singleData.district;
                                }
                                formData.city = singleData.city;
                                if (singleData.locality) {
                                    formData.locality = singleData.locality;
                                }
                                if (singleData.pinCode) {
                                    formData.pinCode = singleData.pinCode;
                                }
                                if (singleData.contactPerson) {
                                    formData.contactPerson = singleData.contactPerson;
                                }
                                if (singleData.landline) {
                                    formData.landline = singleData.landline;
                                }
                                if (singleData.email) {
                                    formData.email = singleData.email;
                                }
                                if (singleData.website) {
                                    formData.website = singleData.website;
                                }
                                if (singleData.mobile) {
                                    formData.mobile = singleData.mobile;
                                }
                                if (singleData.enterOTP) {
                                    formData.enterOTP = singleData.enterOTP;
                                }
                                if (singleData.schoolPrincipalEmail) {
                                    formData.schoolPrincipalEmail = singleData.schoolPrincipalEmail;
                                }
                                if (singleData.schoolPrincipalLandline) {
                                    formData.schoolPrincipalLandline = singleData.schoolPrincipalLandline;
                                }
                                if (singleData.schoolPrincipalMobile) {
                                    formData.schoolPrincipalMobile = singleData.schoolPrincipalMobile;
                                }
                                if (singleData.schoolPrincipalName) {
                                    formData.schoolPrincipalName = singleData.schoolPrincipalName;
                                }
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
                                if (found.schoolType) {
                                    formData.schoolType = found.schoolType;
                                }
                                if (found.schoolLogo) {
                                    formData.schoolLogo = found.schoolLogo;
                                }
                                if (found.schoolCategory) {
                                    formData.schoolCategory = found.schoolCategory;
                                }
                                if (found.affiliatedBoard) {
                                    formData.affiliatedBoard = found.affiliatedBoard;
                                }
                                if (found.schoolAddress) {
                                    formData.schoolAddress = found.schoolAddress;
                                }
                                if (found.schoolAddressLine2) {
                                    formData.schoolAddressLine2 = found.schoolAddressLine2;
                                }

                                formData.state = found.state;
                                if (found.district) {
                                    formData.district = found.district;
                                }
                                formData.city = found.city;
                                if (found.locality) {
                                    formData.locality = found.locality;
                                }
                                if (found.pinCode) {
                                    formData.pinCode = found.pinCode;
                                }
                                if (found.contactPerson) {
                                    formData.contactPerson = found.contactPerson;
                                }
                                if (found.landline) {
                                    formData.landline = found.landline;
                                }
                                if (found.email) {
                                    formData.email = found.email;
                                }
                                if (found.website) {
                                    formData.website = found.website;
                                }
                                if (found.mobile) {
                                    formData.mobile = found.mobile;
                                }
                                if (found.enterOTP) {
                                    formData.enterOTP = found.enterOTP;
                                }
                                if (found.schoolPrincipalEmail) {
                                    formData.schoolPrincipalEmail = found.schoolPrincipalEmail;
                                }
                                if (found.schoolPrincipalLandline) {
                                    formData.schoolPrincipalLandline = found.schoolPrincipalLandline;
                                }
                                if (found.schoolPrincipalMobile) {
                                    formData.schoolPrincipalMobile = found.schoolPrincipalMobile;
                                }
                                if (found.schoolPrincipalName) {
                                    formData.schoolPrincipalName = found.schoolPrincipalName;
                                }
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
        });

    }


};
module.exports = _.assign(module.exports, exports, model);