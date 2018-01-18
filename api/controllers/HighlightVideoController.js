module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    saveVideoHighlight: function (req, res) {
        if (req.body && req.body.matchId) {
            HighlightVideo.saveVideoHighlight(req.body, res.callback);
        } else {
            res.json({
                "data": "Not Found",
                "value": false
            })
        }
    },
};
module.exports = _.assign(module.exports, controller);