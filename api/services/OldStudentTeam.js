var schema = new Schema({
    teamId: {
        type: Schema.Types.ObjectId,
        ref: 'OldTeamSport',
        index: true,
        key: 'studentTeam'
    },
    sport: {
        type: Schema.Types.ObjectId,
        ref: 'OldSport',
        index: true
    },
    studentId: {
        type: Schema.Types.ObjectId,
        ref: 'OldAthelete',
        index: true
    },
    isCaptain: Boolean,
    isGoalKeeper: Boolean,
    perSportUniqueId: String
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('OldStudentTeam', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);