module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    getSchoolByRanks: function (req, res) {
        Rank.getSchoolByRanks(res.callback);
    },

    getSchoolBySport: function (req, res) {
        if (req.body && req.body.name) {
            var obj = {
                "name": req.body.name
            }
            Rank.getSchoolBySport(obj, res.callback);
        } else {
            res.json({
                "data": "Invalid Data",
                "value": false
            });
        }
    },

    getAgeGroupsBySport: function (req, res) {
        if (req.body.name) {
            Rank.getAgeGroupsBySport(req.body,res.callback);
        } else {
            res.json({
                data: "Insufficient Data",
                value: false
            });
        }
    },

    getEventsBySport: function (req, res) {
        if (req.body.name) {
            Rank.getEventsBySport(req.body,res.callback);            
        } else {
            res.json({
                data: "Insufficient Data",
                value: false
            });
        }
    }
};
module.exports = _.assign(module.exports, controller);