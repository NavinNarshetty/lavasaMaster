module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    updateSFAID: function (req, res) {
        if (req.body) {
            School.updateSFAID(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    saveInstitution: function (req, res) {
        if (req.body) {
            School.saveInstitution(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    updateType: function (req, res) {
        if (req.body) {
            School.updateType(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    search: function (req, res) {
        if (req.body) {
            School.search(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    generateExcel: function (req, res) {
        console.log("inside controller");
        School.generateExcel(res);
    },

    getAllSchoolDetails: function (req, res) {
        if (req.body) {
            School.getAllSchoolDetails(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    searchByFilter: function (req, res) {
        if (req.body) {
            School.searchByFilter(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },



};
module.exports = _.assign(module.exports, controller);