var schema = new Schema({
    receiptId: Number,
    atheleteID: {
        type: Number
    },
    sfaId: String,
    status: {
        type: String,
        default: "Pending"
    },
    school: {
        type: Schema.Types.ObjectId,
        ref: 'School',
        index: true
    },

    year: String,
    idProof: String,
    surname: String,
    password: String,
    firstName: String,
    middleName: String,
    gender: String,
    standard: String,
    bloodGroup: String,
    photograph: String,
    dob: Date,
    age: Number,
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
    university: String,
    faculty: String,
    degree: String,
    collegeYear: String,
    course: String,
    verifiedDate: Date,
    remarks: String,
    accessToken: String,
    isSelected: Boolean,
    utm_medium: String,
    utm_source: String,
    utm_campaign: String,
    isBib: Boolean
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('OldAthelete', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    setAthlete: function (data, callback) {
        async.waterfall([
                function (callback) {
                    OldAthelete.find({}).lean().exec(function (err, found) {
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
                    OldAthelete.saveAthleteOriginal(found, function (err, complete) {
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

    saveAthleteOriginal: function (data, callback) {
        _.each(data, function (singleData) {
            async.waterfall([
                function (callback) {
                    Athelete.findOne({
                        sfaId: singleData.sfaId
                    }).lean().exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(found)) {
                            var formData = {};
                            console.log("singleData.year", singleData.year);
                            formData.currentYear = singleData.year;
                            formData.sfaId = singleData.sfaId;
                            formData.receiptId = singleData.receiptId;
                            formData.atheleteID = singleData.atheleteID;
                            formData.password = singleData.password;
                            var arr = [];
                            if (singleData.year == "2015, 2016") {
                                arr.push("2015");
                                arr.push("2016");
                            } else {
                                arr.push(singleData.year);
                            }
                            formData.year = arr;
                            if (singleData.atheleteSchoolName) {
                                formData.atheleteSchoolName = singleData.atheleteSchoolName;
                            } else {
                                formData.school = singleData.school;
                            }
                            formData.surname = singleData.surname;
                            formData.firstName = singleData.firstName;
                            if (singleData.middleName) {
                                formData.middleName = singleData.middleName;
                            }
                            formData.gender = singleData.gender;
                            formData.dob = singleData.dob;
                            formData.age = singleData.age;
                            formData.address = singleData.address;
                            formData.state = singleData.state;
                            formData.city = singleData.city;
                            formData.registrationFee = singleData.registrationFee;
                            formData.verifyCount = singleData.verifyCount;
                            formData.paymentStatus = singleData.paymentStatus;
                            formData.parentDetails = singleData.parentDetails;
                            formData.termsAndCondition = singleData.termsAndCondition;
                            formData.sportLevel = singleData.sportLevel;
                            formData.playedTournaments = singleData.playedTournaments;
                            formData.status = singleData.status;
                            callback(null, formData);
                        } else {
                            var formData = {};
                            found.year.push(singleData.year);
                            var i = (found.year.length - 1);
                            if (singleData.year < found.year[i]) {
                                formData._id = found._id;
                                if (singleData.receiptId) {
                                    formData.receiptId = singleData.receiptId;
                                }
                                if (singleData.atheleteID) {
                                    formData.atheleteID = singleData.atheleteID;
                                }
                                formData.sfaId = singleData.sfaId;
                                formData.status = singleData.status;
                                formData.school = singleData.school;
                                formData.currentYear = singleData.year;
                                formData.year = found.year;
                                if (singleData.idProof) {
                                    formData.idProof = singleData.idProof;
                                }
                                formData.surname = singleData.surname;
                                formData.firstName = singleData.firstName;
                                if (singleData.password) {
                                    formData.password = singleData.password;
                                }
                                if (singleData.middleName) {
                                    formData.middleName = singleData.middleName;
                                }
                                formData.gender = singleData.gender;
                                if (singleData.standard) {
                                    formData.standard = singleData.standard;
                                }
                                if (singleData.bloodGroup) {
                                    formData.bloodGroup = singleData.bloodGroup;
                                }
                                if (singleData.photograph) {
                                    formData.photograph = singleData.photograph;
                                }
                                if (singleData.dob) {
                                    formData.dob = singleData.dob;
                                }
                                if (singleData.age) {
                                    formData.age = singleData.age;
                                }
                                if (singleData.ageProof) {
                                    formData.ageProof = singleData.ageProof;
                                }
                                if (singleData.photoImage) {
                                    formData.photoImage = singleData.photoImage;
                                }
                                if (singleData.birthImage) {
                                    formData.birthImage = singleData.birthImage;
                                }
                                if (singleData.playedTournaments) {
                                    formData.playedTournaments = singleData.playedTournaments;
                                }
                                if (formData.sportLevel) {
                                    formData.sportLevel = singleData.sportLevel;
                                }
                                if (formData.mobile) {
                                    formData.mobile = singleData.mobile;
                                }
                                if (singleData.smsOTP) {
                                    formData.smsOTP = singleData.smsOTP;
                                }
                                if (singleData.email) {
                                    formData.email = singleData.email;
                                }
                                if (singleData.emailOTP) {
                                    formData.emailOTP = singleData.emailOTP;
                                }
                                if (singleData.address) {
                                    formData.address = singleData.address;
                                }
                                if (singleData.addressLine2) {
                                    formData.addressLine2 = singleData.addressLine2;
                                }
                                if (singleData.termsAndCondition) {
                                    formData.termsAndCondition = singleData.termsAndCondition;
                                }
                                formData.state = singleData.state;
                                formData.district = singleData.district;
                                formData.city = singleData.city;
                                formData.pinCode = singleData.pinCode;
                                if (singleData.parentDetails) {
                                    formData.parentDetails = singleData.parentDetails;
                                }
                                if (singleData.atheleteSchoolContact) {
                                    formData.atheleteSchoolContact = singleData.atheleteSchoolContact;
                                }
                                if (singleData.atheleteSchoolName) {
                                    formData.atheleteSchoolName = singleData.atheleteSchoolName;
                                }
                                if (singleData.atheleteSchoolIdImage) {
                                    formData.atheleteSchoolIdImage = singleData.atheleteSchoolIdImage;
                                }
                                if (singleData.atheleteSchoolLocality) {
                                    formData.atheleteSchoolLocality = singleData.atheleteSchoolLocality;
                                }
                                if (singleData.registrationFee) {
                                    formData.registrationFee = singleData.registrationFee;
                                }
                                if (singleData.paymentStatus) {
                                    formData.paymentStatus = singleData.paymentStatus;
                                }
                                if (singleData.verifyCount) {
                                    formData.verifyCount = singleData.verifyCount;
                                }
                                if (singleData.transactionID) {
                                    formData.transactionID = singleData.transactionID;
                                }
                                if (singleData.university) {
                                    formData.university = singleData.university;
                                }
                                if (singleData.faculty) {
                                    formData.faculty = singleData.faculty;
                                }
                                if (singleData.degree) {
                                    formData.degree = singleData.degree;
                                }
                                if (singleData.collegeYear) {
                                    formData.collegeYear = singleData.collegeYear;
                                }
                                if (singleData.verifiedDate) {
                                    formData.verifiedDate = singleData.verifiedDate;
                                }
                                if (singleData.remarks) {
                                    formData.remarks = singleData.remarks;
                                }
                                if (singleData.accessToken) {
                                    formData.accessToken = singleData.accessToken;
                                }
                                if (singleData.isSelected) {
                                    formData.isSelected = singleData.isSelected;
                                }
                                if (singleData.utm_campaign) {
                                    formData.utm_campaign = singleData.utm_campaign;
                                }
                                if (singleData.utm_medium) {
                                    formData.utm_medium = singleData.utm_medium;
                                }
                                if (singleData.utm_source) {
                                    formData.utm_source = singleData.utm_source;
                                }
                                if (singleData.isBib) {
                                    formData.isBib = singleData.isBib;
                                }
                            } else {
                                formData._id = found._id;
                                if (found.receiptId) {
                                    formData.receiptId = found.receiptId;
                                }
                                if (found.atheleteID) {
                                    formData.atheleteID = found.atheleteID;
                                }
                                formData.sfaId = found.sfaId;
                                formData.status = found.status;
                                formData.school = found.school;
                                formData.currentYear = found.year;
                                formData.year.push(found.year);
                                if (found.idProof) {
                                    formData.idProof = found.idProof;
                                }
                                formData.surname = found.surname;
                                formData.firstName = found.firstName;
                                if (found.password) {
                                    formData.password = found.password;
                                }
                                if (found.middleName) {
                                    formData.middleName = found.middleName;
                                }
                                formData.gender = found.gender;
                                if (found.standard) {
                                    formData.standard = found.standard;
                                }
                                if (found.bloodGroup) {
                                    formData.bloodGroup = found.bloodGroup;
                                }
                                if (found.photograph) {
                                    formData.photograph = found.photograph;
                                }
                                if (found.dob) {
                                    formData.dob = found.dob;
                                }
                                if (found.age) {
                                    formData.age = found.age;
                                }
                                if (found.ageProof) {
                                    formData.ageProof = found.ageProof;
                                }
                                if (found.photoImage) {
                                    formData.photoImage = found.photoImage;
                                }
                                if (found.birthImage) {
                                    formData.birthImage = found.birthImage;
                                }
                                if (found.playedTournaments) {
                                    formData.playedTournaments = found.playedTournaments;
                                }
                                if (formData.sportLevel) {
                                    formData.sportLevel = found.sportLevel;
                                }
                                if (formData.mobile) {
                                    formData.mobile = found.mobile;
                                }
                                if (found.smsOTP) {
                                    formData.smsOTP = found.smsOTP;
                                }
                                if (found.email) {
                                    formData.email = found.email;
                                }
                                if (found.emailOTP) {
                                    formData.emailOTP = found.emailOTP;
                                }
                                if (found.address) {
                                    formData.address = found.address;
                                }
                                if (found.addressLine2) {
                                    formData.addressLine2 = found.addressLine2;
                                }
                                if (found.termsAndCondition) {
                                    formData.termsAndCondition = found.termsAndCondition;
                                }
                                formData.state = found.state;
                                formData.district = found.district;
                                formData.city = found.city;
                                formData.pinCode = found.pinCode;
                                if (found.parentDetails) {
                                    formData.parentDetails = found.parentDetails;
                                }
                                if (found.atheleteSchoolContact) {
                                    formData.atheleteSchoolContact = found.atheleteSchoolContact;
                                }
                                if (found.atheleteSchoolName) {
                                    formData.atheleteSchoolName = found.atheleteSchoolName;
                                }
                                if (found.atheleteSchoolIdImage) {
                                    formData.atheleteSchoolIdImage = found.atheleteSchoolIdImage;
                                }
                                if (found.atheleteSchoolLocality) {
                                    formData.atheleteSchoolLocality = found.atheleteSchoolLocality;
                                }
                                if (found.registrationFee) {
                                    formData.registrationFee = found.registrationFee;
                                }
                                if (found.paymentStatus) {
                                    formData.paymentStatus = found.paymentStatus;
                                }
                                if (found.verifyCount) {
                                    formData.verifyCount = found.verifyCount;
                                }
                                if (found.transactionID) {
                                    formData.transactionID = found.transactionID;
                                }
                                if (found.university) {
                                    formData.university = found.university;
                                }
                                if (found.faculty) {
                                    formData.faculty = found.faculty;
                                }
                                if (found.degree) {
                                    formData.degree = found.degree;
                                }
                                if (found.collegeYear) {
                                    formData.collegeYear = found.collegeYear;
                                }
                                if (found.verifiedDate) {
                                    formData.verifiedDate = found.verifiedDate;
                                }
                                if (found.remarks) {
                                    formData.remarks = found.remarks;
                                }
                                if (found.accessToken) {
                                    formData.accessToken = found.accessToken;
                                }
                                if (found.isSelected) {
                                    formData.isSelected = found.isSelected;
                                }
                                if (found.utm_campaign) {
                                    formData.utm_campaign = found.utm_campaign;
                                }
                                if (found.utm_medium) {
                                    formData.utm_medium = found.utm_medium;
                                }
                                if (found.utm_source) {
                                    formData.utm_source = found.utm_source;
                                }
                                if (found.isBib) {
                                    formData.isBib = found.isBib;
                                }
                            }
                            callback(null, formData);
                        }
                    });
                },
                function (formData, callback) {
                    console.log("found", formData);
                    Athelete.saveData(formData, function (err, registerData) {
                        if (err) {
                            callback("There was an error while saving data", null);
                        } else if (_.isEmpty(registerData)) {
                            callback("No register data found", null);
                        } else {
                            callback(null, registerData);
                        }
                    });
                }
            ]);
        });
        callback(null, data);
    }

};
module.exports = _.assign(module.exports, exports, model);