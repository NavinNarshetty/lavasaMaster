var schema = new Schema({
    gender: String,
    year: String,
    minPlayers: Number,
    maxPlayers: Number,
    sportslist: {
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'SportsList'
        },
        name: String,
        sporttype: String
    },
    ageGroup: {
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'AgeGroup'
        },
        name: String
    },
    firstCategory: {
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'FirstCategory'
        },
        name: String
    },
    secondCategory: {

        _id: {
            type: Schema.Types.ObjectId,
            ref: 'SecondCategory'
        },
        name: String

    },
    thirdCategory: {

        _id: {
            type: Schema.Types.ObjectId,
            ref: 'ThirdCategory'
        },
        name: String

    },
    drawFormat: {

        _id: {
            type: Schema.Types.ObjectId,
            ref: 'DrawFormat'
        },
        name: String

    },
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Sport', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);