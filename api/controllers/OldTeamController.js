module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    getAllTeam: function (req, res) {
        res.connection.setTimeout(200000000);
        req.connection.setTimeout(200000000);
        if (req.body) {
            OldTeam.getAllTeam(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    getAllIndividual: function (req, res) {
        res.connection.setTimeout(200000000);
        req.connection.setTimeout(200000000);
        if (req.body) {
            OldTeam.getAllIndividual(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

};
module.exports = _.assign(module.exports, controller);