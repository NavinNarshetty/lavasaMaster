module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    getOneSport: function (req, res) {
        if (req.body) {
            Sport.getOneSport(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    getAllSports: function (req, res) {
        if (req.body) {
            Sport.getAllSports(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    getAllAthletePerSchool: function (req, res) {
        if (req.body) {
            Sport.getAllAthletePerSchool(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
};
module.exports = _.assign(module.exports, controller);