var schema = new Schema({
    name: {
        type: String,
    },
    sport: {
        type: Schema.Types.ObjectId,
        ref: 'Sport',
        index: true
    },
    student: [{
        type: Schema.Types.ObjectId,
        ref: 'StudentTeam',
        index: true
    }],
    school: {
        type: Schema.Types.ObjectId,
        ref: 'School',
        index: true
    }
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('TeamSport', schema);
var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);