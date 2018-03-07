var schema = new Schema({
    sport: [{
        type: Schema.Types.ObjectId,
        ref: 'OldSport',
        index: true
    }],
    athleteId: {
        type: Schema.Types.ObjectId,
        ref: 'OldAthelete',
        index: true
    },
    sportsListSubCategory: {
        type: Schema.Types.ObjectId,
        ref: 'OldSportsListSubCategory',
        index: true
    },
    perSportUnique: String,
    createdBy: String,
    nominatedName: String,
    nominatedSchoolName: String,
    nominatedContactDetails: String,
    nominatedEmailId: String,
    isVideoAnalysis: Boolean
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('OldIndividualSport', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);