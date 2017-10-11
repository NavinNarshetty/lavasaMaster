var schema = new Schema({
    name: {
        type: "String",
        unique: true
    },
    type: [{
        type: String,
        enum: ['athlete', 'school', 'college']
    }],
    awardType:"Mixed"
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Awards', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    

    getRemainSchoolAwards: function (data, callback) {


    },
    getRemainCollegeAwards: function (data, callback) {

    }
};
module.exports = _.assign(module.exports, exports, model);