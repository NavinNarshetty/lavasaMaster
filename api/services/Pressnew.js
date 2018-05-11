var schema = new Schema({
    mediaType: {
        type: String
    },
    newsDate: Date,
    city: String,
    mediaTitle: String,
    year: String,
    mediaLink: String,
    eventId: {
        type: Schema.Types.ObjectId,
        ref: 'Event',
        index: true
    },
    oldId: {
        type: Schema.Types.ObjectId,
        ref: 'OldPressnew',
        index: true
    },
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Pressnew', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);