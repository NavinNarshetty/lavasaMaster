module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    getAll: function (req, res) {
        if (req.body) {
            SportsListSubCategory.getAll(res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }

    },
    getOneSport: function (req, res) {
        if (req.body) {
            SportsListSubCategory.getOneSport(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    getSports: function (req, res) {
        if (req.body) {
            SportsListSubCategory.getSports(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    getRules: function (req, res) {
        if (req.body) {
            SportsListSubCategory.getRules(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    getEvents: function (req, res) {
        if (req.body) {
            SportsListSubCategory.getEvents(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    }




};
module.exports = _.assign(module.exports, controller);