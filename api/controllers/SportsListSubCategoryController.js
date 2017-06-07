module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    getAll: function (req, res) {
        SportsListSubCategory.getAll(res.callback);
    },
    getOne: function (req, res) {
        SportsListSubCategory.getOne(req.body, res.callback);
    }



};
module.exports = _.assign(module.exports, controller);