module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    saveInTeam: function (req, res) {
        if (req) {
            StudentTeam.saveInTeam(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "User Not logged in"
            });
        }

    },
    search: function (req, res) {
        if (req) {
            StudentTeam.search(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "User Not logged in"
            });
        }

    },


};
module.exports = _.assign(module.exports, controller);