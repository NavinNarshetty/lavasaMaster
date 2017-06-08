var schema = new Schema({
    studentId: {
        type: Schema.Types.ObjectId,
        ref: 'Athelete',
        index: true
    },
    Sport: {
        type: Schema.Types.ObjectId,
        ref: 'Sport',
        index: true
    },
    perSportUnique: String,
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('StudentSport', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);