module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    saveData: function (req, res) {
        if (req.body) {
            AthleteCheck.saveData(req.body, function (err, respo) {
                if (err) {
                    res.json({
                        value: false,
                        data: err
                    });
                } else {
                    res.json({
                        value: true,
                        data: respo
                    });
                }
            });
        } else {
            res.json({
                value: false,
                data: "Invalid call"
            });
        }
    },

    updateCheck: function (req, res) {
        if (req.body) {
            AthleteCheck.updateCheck(req.body, function (err, respo) {
                if (err) {
                    res.json({
                        value: false,
                        data: err
                    });
                } else {
                    res.json({
                        value: true,
                        data: respo
                    });
                }
            });
        } else {
            res.json({
                value: false,
                data: "Invalid call"
            });
        }
    },

};
module.exports = _.assign(module.exports, controller);