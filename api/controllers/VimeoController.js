module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    setVimeo: function (req, res) {
        Vimeo.setVimeo(req.body, res.callback);
    },

    generateToken: function (req, res) {
        Vimeo.generateToken(req.body, res.callback);
    },

    authenticateCloud: function (req, res) {
        console.log("vimeo");
        Vimeo.authenticateCloud(req.body, res.callback);
    },
};
module.exports = _.assign(module.exports, controller);