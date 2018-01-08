var schema = new Schema({
    name: {
        type: String,
    },
    sportsListCategory: {
        type: Schema.Types.ObjectId,
        ref: 'OldSportsListCategory',
        index: true
    },
    isTeam: Boolean,
    filter: [{
        name: String
    }],
    rules: {
        type: Schema.Types.ObjectId,
        ref: 'OldRules',
        index: true
    },
    sportType: String,
    maxSelect: Number,
    inactiveimage: String,
    image: String,
    endDate: Date

});

schema.plugin(deepPopulate, {
    populate: {
        'sportsListCategory': {
            select: ''
        },
        'rules': {
            select: ''
        }
    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('OldSportsListSubCategory', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);