var schema = new Schema({
    type: {
        type: String,
        enum: ['athlete', 'school', 'college']
    },
    gender: "String",
    award: {
        type: Schema.Types.ObjectId,
        ref: "Awards"
    },
    athlete: {
        type: Schema.Types.ObjectId,
        ref: "Athelete"
    },
    school: {
        type: Schema.Types.ObjectId,
        ref: "Registration"
    },
    sports: [{
        type: Schema.Types.ObjectId,
        ref: "Sport"
    }],
    coachName:"String",
    boostDetail:{
        schoolRank:"Number",
        total:"Number",
        year:"Number"
    },
    risingSport:"String"
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('SpecialAwardDetails', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);