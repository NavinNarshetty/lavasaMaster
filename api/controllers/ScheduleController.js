module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    getAll: function (res) {
        Schedule.find().deepPopulate("sport").lean().sort({
            createdAt: -1
        }).exec(function (err, found) {
            if (err) {
                res.callback(err, null);
            } else {
                if (_.isEmpty(found)) {
                    res.callback(null, []);
                } else {
                    res.callback(null, found);
                }
            }
        });
    },
};
module.exports = _.assign(module.exports, controller);