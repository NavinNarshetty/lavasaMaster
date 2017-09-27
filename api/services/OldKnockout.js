var schema = new Schema({
    year: String,
    matchid: Number,
    roundno: {
        type: Number,
        default: 0
    },
    round: {
        type: String
    },
    order: {
        type: Number,
        default: 0
    },
    sport: {
        type: Schema.Types.ObjectId,
        ref: "Sport",
        index: true
    },
    event: {
        type: String,
        default: "Knockout"
    },
    participantType: {
        type: String,
        default: "player"
    },
    date: {
        type: Date,
        default: Date.now
    },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    },
    totalTime: {
        type: String,
        default: ""
    },
    player1: {
        type: Schema.Types.ObjectId,
        ref: 'Student'
    },
    player2: {
        type: Schema.Types.ObjectId,
        ref: 'Student'
    },
    resultplayer1: {
        type: String,
    },
    resultteam1: {
        type: String,
    },
    resultplayer2: {
        type: String,
    },
    resultteam2: {
        type: String,
    },
    team1: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    team2: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    score: {
        type: String,
        default: ""
    },
    video: {
        type: String
    },
    parent1: {
        type: Schema.Types.ObjectId,
        ref: 'Knockout'
    },
    parent2: {
        type: Schema.Types.ObjectId,
        ref: 'Knockout'
    }
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('OldKnockout', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);