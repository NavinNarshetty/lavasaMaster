module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    getAll: function (req, res) {
        Weight.getAll(req.body, res.callback);
    },
    getWeightPerSportslist: function (req, res) {
        Weight.getWeightPerSportslist(req.body, res.callback);
    },
};
module.exports = _.assign(module.exports, controller);