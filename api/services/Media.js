var schema = new Schema({
    year: String,
    folder: String,
    order: {
        type: Number
    },
    imageorder: {
        type: Number
    },
    date: {
        type: Date
    },
    mediatitle: {
        type: String,
        default: ""
    },
    mediatype: {
        type: String,
        default: ""
    },
    medialink: {
        type: String,
        default: ""
    }
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Media', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);