var schema = new Schema({
    year: String,
    matchid: Number,
    sport: {
        type: Schema.Types.ObjectId,
        ref: "Sport",
        index: true
    },
    event: {
        type: String,
        default: "Qualifying Round"
    },
    order: Number,
    participantType: {
        type: String,
        default: "player"
    },
    player: {
        type: Schema.Types.ObjectId,
        ref: 'Student'
    },
    score: {
        type: String
    },
    result: {
        type: String
    },
    video: {
        type: String,
        default: ""
    },
    position: {
        type: Number,
        default: 0
    },
    date: {
        type: Date
    },
    round: {
        type: String
    }
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('OldQualifyingRound', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {


};
module.exports = _.assign(module.exports, exports, model);