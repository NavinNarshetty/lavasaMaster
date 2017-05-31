module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    login: function (req, res) {
        if (req.body) {
            Login.login(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

};
module.exports = _.assign(module.exports, controller);