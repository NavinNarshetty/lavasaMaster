var schema = new Schema({
    name: String,
    sportsListSubCategory: {
        type: Schema.Types.ObjectId,
        ref: 'OldSportsListSubCategory',
        index: true
    },
    drawFormat: {
        type: Schema.Types.ObjectId,
        ref: 'OldDrawFormat',
        index: true
    }
});

schema.plugin(deepPopulate, {
    populate: {
        'drawFormat': {
            select: '_id name'
        },
        'sportsListSubCategory': {
            select: '_id name isTeam sportsListCategory rules'
        },
        "sportsListSubCategory.sportsListCategory": {
            select: ''
        },
        "sportsListSubCategory.rules": {
            select: ''
        },
    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('OldSportsList', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

};
module.exports = _.assign(module.exports, exports, model);