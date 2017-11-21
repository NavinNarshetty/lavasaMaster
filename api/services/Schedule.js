var schema = new Schema({
    sport: {
        type: Schema.Types.ObjectId,
        ref: 'SportsListSubCategory'
    },
    scheduleDate: {
        type: String
    },

    uploadTime: {
        type: String
    },
    pdfDetail: Schema.Types.Mixed
});

schema.plugin(deepPopulate, {
    populate: {
        'sport': {
            select: '_id name'
        }
    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Schedule', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);