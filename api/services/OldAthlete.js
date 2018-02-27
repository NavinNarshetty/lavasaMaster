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
module.exports = mongoose.model('OldAthlete', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);