var schema = new Schema({
    name: {
        type: String,
    }
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Weight', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {
    getAll: function (data, callback) {
        Weight.find().lean().exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else {
                if (_.isEmpty(found)) {
                    callback(null, []);
                } else {
                    console.log("found0", found);
                    callback(null, found);
                }
            }
        });
    },

    getWeightPerSportslist: function (data, callback) {
        Sport.find({
            sportslist: data.sportslist
        }).lean().deepPopulate("weight").exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else {
                console.log(found);
                if (_.isEmpty(found)) {
                    callback(null, []);
                } else {
                    var age = _.uniqBy(found, "weight.name");
                    callback(null, age);
                }
            }
        });
    },
};
module.exports = _.assign(module.exports, exports, model);