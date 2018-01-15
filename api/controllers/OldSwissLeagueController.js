module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    getAllIndividual: function (req, res) {
        if (req.body) {
            OldSwissLeague.getAllPlayer(req.body, function (err, athelete) {
                if (err) {
                    res.callback(err, null);
                } else {
                    if (_.isEmpty(athelete)) {
                        var err = {
                            error: "no athelete",
                            data: athelete
                        }
                        res.callback(null, err);
                    } else {
                        res.callback(null, athelete);
                    }
                }
            });
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    saveKnockoutMatch: function (req, res) {
        if (req.body) {
            OldSwissLeague.saveMatchIndividual(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

};
module.exports = _.assign(module.exports, controller);