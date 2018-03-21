var schema = new Schema({
    banner: {
        desktop: [],
        mobile: [],
    },
    ageEventPdf: String,
    content: String,
    eventCount: [{
        value: String,
        name: String
    }],
    gallery: [{
        title: String,
        mediaLink: String
    }]
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Playerregistration', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);