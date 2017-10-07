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
var model = {};
module.exports = _.assign(module.exports, exports, model);