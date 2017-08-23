module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    getAll: function(req, res) {
        if (req.body) {
            AgeGroup.getAll(req.body, res.callback);
        }

    },
};
module.exports = _.assign(module.exports, controller);