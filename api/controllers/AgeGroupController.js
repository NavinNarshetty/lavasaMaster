module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    getAll: function (req, res) {
        if (req.body) {
            AgeGroup.getAll(req.body, res.callback);
        } else {
            res.json({
                data: "Body Not Found",
                value: false
            });
        }

    },
    getperSportslist: function (req, res) {
        if (req.body) {
            AgeGroup.getperSportslist(req.body, res.callback);
        } else {
            res.json({
                data: "Body Not Found",
                value: false
            });
        }

    },
};
module.exports = _.assign(module.exports, controller);