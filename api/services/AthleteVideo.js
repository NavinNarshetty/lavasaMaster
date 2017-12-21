var schema = new Schema({
    athleteSFAID: String,
    athleteName: String,
    athleteSchool: String,
    gender: String,
    year: String,
    ageCategory: String,
    sport: String,
    event: String,
    weight: String,
    videoLink: String
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('AthleteVideo', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);