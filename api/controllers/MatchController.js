module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    getOneMatch: function (req, res) {
        if (req.body._id) {
            Match.getOneMatch(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    getAll: function (req, res) {
        Match.getAll(req.body, res.callback);
    },

    getAllwithFind: function (req, res) {
        if (req.body) {
            Match.getAllwithFind(req.body, res.callback);

        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    saveMatch: function (req, res) {
        if (req.body) {
            Match.saveMatch(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },



};
module.exports = _.assign(module.exports, controller);