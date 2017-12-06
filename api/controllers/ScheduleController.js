module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    getAll: function (req, res) {
        Schedule.find().deepPopulate("sport").lean().sort({
            createdAt: -1
        }).exec(function (err, found) {
            if (err) {
                res.json({
                    "data": err,
                    "value": false
                });
            } else {
                if (_.isEmpty(found)) {
                    res.json({
                        "data": [],
                        "value": true
                    })
                } else {
                    res.json({
                        "data": found,
                        "value": true
                    })
                }
            }
        });
    },
};
module.exports = _.assign(module.exports, controller);