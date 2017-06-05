module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    getAllSportByType: function (req, res) {
        if (req.body) {
            if (req.session.user) {
                SportsList.getAllSportByType(req.body, res.callback);
            } else {
                res.json({
                    value: false,
                    data: "User Not logged in"
                });
            }
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    getSportsRule: function (req, res) {
        if (req.body) {
            if (req.session.user) {
                SportsList.getSportsRule(req.body, res.callback);
            } else {
                res.json({
                    value: false,
                    data: "User Not logged in"
                });
            }
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

};
module.exports = _.assign(module.exports, controller);