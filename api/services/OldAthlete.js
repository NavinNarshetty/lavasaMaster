var schema = new Schema({

    deleteStatus: Boolean,
    hours: String,
    minutes: String,
    timer: String,
    via: String,
    payment: String,
    sfaid: String,
    school: {
        type: Schema.Types.ObjectId,
        ref: 'School',
        index: true
    },
    lastname: String,
    firstname: String,
    middlename: String,
    gender: String,
    dob: Date,
    address: String,
    contact: String,
    email: String,
    dateOfForm: String,
    name: String,
    image: [{
        type: String
    }],
    video: [{
        type: String
    }],

    year: String,
    totalPoints: Number,
    totalPoints2015: Number,
    totalPoints2016: Number,
    totalPoints2017: Number,
    status: Boolean
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('OldAthlete', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);