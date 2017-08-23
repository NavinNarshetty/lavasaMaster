module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    getAllSportByType: function(req, res) {
        if (req.body) {
            if (req.session.user) {
                req.body._id = req.session.user._id;
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
    getSportsRule: function(req, res) {
        if (req.body) {
            if (req.session.user) {
                req.body._id = req.session.user._id;
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

    generateExcel: function(req, res) {
        SportsList.generateExcel(res);
    },

    getAll: function(req, res) {
        SportsList.getAll(req.body, res.callback);
    },

};
module.exports = _.assign(module.exports, controller);