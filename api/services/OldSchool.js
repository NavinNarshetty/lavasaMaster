var schema = new Schema({
    institutionType: String,
    deleteStatus: Boolean,
    timestamp: Date,
    sfaid: String,
    name: String,
    board: String,
    status: Boolean,
    address: String,
    location: String,
    email: String,
    contact: String,
    department: [{
        email: String,
        contact: String,
        designation: String,
        name: String,
        year: String,
    }],
    image: [{
        type: String
    }],
    video: [{
        type: String
    }],
    contingentLeader: [{
        type: String
    }],
    sports: [{
        year: String,
        sporttype: String,
        name: String,
    }],
    principal: String,
    paymentType: String,
    numberOfSports: String,
    representative: String,
    notpaidfor: String,
    year: [{
        type: String
    }],
    totalPoints: Number,
    totalPoints2015: Number,
    totalPoints2016: Number,
    totalPoints2017: Number,
    isRegistered: {
        type: Boolean,
        default: false
    }
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('OldSchool', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);