module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    getAllBySponsorType: function (req, res) {
        if (req.body) {
            SponsorPage.getAllBySponsorType(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    }
};
module.exports = _.assign(module.exports, controller);