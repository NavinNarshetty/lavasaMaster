var schema = new Schema({

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
    totalPoints2017: Number

});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Duplicate', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {
    getAllDuplicate: function (data, callback) {
        Duplicate.find().exec(function (err, found) {
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