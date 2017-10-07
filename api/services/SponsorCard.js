var schema = new Schema({
    cardImage: String,
    sponsorName: {
        type: Schema.Types.ObjectId,
        ref: 'SponsorPage',
        index: true
    },
    header: String,
    designation: String,
    content: String
});

schema.plugin(deepPopulate, {
    populate: {
        'sponsorName': {
            select: ''
        }
    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('SponsorCard', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema, 'sponsorName', 'sponsorName'));
var model = {
    getAllBySponsorPageId: function (data, callback) {
        console.log(data);
        SponsorCard.find({ //finds one with refrence to id
            sponsorName: data._id
        }).lean().exec(function (err, sponsorCard) {
            console.log(sponsorCard);
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(sponsorCard)) {
                callback("Data is empty", null);
            } else {
                callback(null, sponsorCard);
            }
        });
    }
};
module.exports = _.assign(module.exports, exports, model);