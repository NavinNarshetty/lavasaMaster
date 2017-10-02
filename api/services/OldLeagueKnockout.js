var schema = new Schema({
    year: String,
    matchid: Number,
    roundno: Number,
    leagueknockoutround: {
        type: String
    },
    round: {
        type: String
    },
    order: Number,
    leagueknockoutorder: Number,
    sport: {
        type: Schema.Types.ObjectId,
        ref: "Sport",
        index: true
    },
    event: {
        type: String,
        default: "League cum Knockout"
    },
    participantType: {
        type: String
    },
    player1: {
        type: Schema.Types.ObjectId,
        ref: 'Student'
    },
    player2: {
        type: Schema.Types.ObjectId,
        ref: 'Student'
    },
    team1: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    team2: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    result1: {
        type: String
    },
    result2: {
        type: String
    },
    point1: {
        type: Number,
        default: 0.0
    },
    point2: {
        type: Number,
        default: 0.0
    },
    date: {
        type: Date
    },
    startTime: {
        type: Date
    },
    totalTime: {
        type: String,
        default: ""
    },
    endTime: {
        type: Date
    },
    score: {
        type: String,
        default: ""
    },
    video: {
        type: String
    }
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('OldLeagueKnockout', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {




};
module.exports = _.assign(module.exports, exports, model);