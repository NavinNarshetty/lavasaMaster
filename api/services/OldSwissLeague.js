var schema = new Schema({
    year: String,
    matchid: Number,
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
        default: "Swiss League"
    },
    participantType: {
        type: String,
        default: "player"
    },
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
    date: {
        type: Date,
        default: Date.now
    },
    player1: {
        type: Schema.Types.ObjectId,
        ref: 'Student'
    },
    player2: {
        type: Schema.Types.ObjectId,
        ref: 'Student'
    },
    result1: {
        type: String,
    },
    result2: {
        type: String,
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
    }
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('OldSwissLeague', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);