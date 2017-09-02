var schema = new Schema({
    name: {
        type: String,
    },
    city: String,
    institutionType: String,
    tournamentFormat: String,
    rulesAndRegulation: String,
    ageGroupContent: String,
    ageGroupTable: Schema.Types.Mixed,
    eligibilityContent: String,
    eligibilityTable: Schema.Types.Mixed,
    tournamentCommittee: String
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Rules', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);