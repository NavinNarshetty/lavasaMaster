module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    saveRegistrationForm: function (req, res) {
        if (req.body) {
            Registration.saveRegistrationForm(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    getAllRegistrationDetails: function (req, res) {
        if (req.body) {
            Registration.getAllRegistrationDetails(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    getOneRegistrationDetails: function (req, res) {
        if (req.body) {
            Registration.getOneRegistrationDetails(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

};
module.exports = _.assign(module.exports, controller);