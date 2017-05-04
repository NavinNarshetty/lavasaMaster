module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    updateStudentSFAID: function (req, res) {
        if (req.body) {
            Student.updateStudentSFAID(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    search: function (req, res) {
        if (req.body) {
            Student.search(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

};
module.exports = _.assign(module.exports, controller);