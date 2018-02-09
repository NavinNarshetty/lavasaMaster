var schema = new Schema({
    name: String,
    athlete: [{
        type: Schema.Types.ObjectId,
        ref: 'Athelete',
        index: true
    }]
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('AthleteCheck', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    updateCheck: function (data, callback) {
        var matchObj = {
            $push: {
                athlete: data.athlete
            }
        };
        AthleteCheck.update({
            name: data.name
        }, matchObj, function (err, data2) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, data2);
            }
        });
    }
};
module.exports = _.assign(module.exports, exports, model);