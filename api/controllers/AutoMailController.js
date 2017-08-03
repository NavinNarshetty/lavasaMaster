module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    athleteMail: function (req, res) {
        if (req.body) {
            AutoMail.athleteMail(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    schoolMail: function (req, res) {
        if (req.body) {
            AutoMail.schoolMail(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },



};
module.exports = _.assign(module.exports, controller);