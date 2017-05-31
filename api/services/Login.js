var schema = new Schema({});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Login', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    login: function (data, callback) {
        if (data.type.equals("school")) {
            Registration.findOne({
                sfaID: data.sfaId,
                password: data.password
            }).lean().exec(function (err, found) {
                if (err) {
                    callback(err, null);
                } else if (_.isEmpty(found)) {
                    callback(null, "Data is empty");
                } else {
                    callback(null, found);
                }

            });

        } else if (data.type.equals("athlete")) {
            Athelete.findOne({
                sfaId: data.sfaId,
                password: data.password
            }).lean().exec(function (err, found) {
                if (err) {
                    callback(err, null);
                } else if (_.isEmpty(found)) {
                    callback(null, "Data is empty");
                } else {
                    callback(null, found);
                }

            });

        } else {
            callback("Incorrect Login Details", null);

        }

    },

};
module.exports = _.assign(module.exports, exports, model);