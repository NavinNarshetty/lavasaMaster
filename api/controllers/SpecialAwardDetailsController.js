module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    getAwardsList: function (req, res) {
        if (req.body) {
            var awardListObj = {}; // for getting all awards as per awardType i.e athlete,school,college
            var awardDetailObj = {}; // for filtering all awards which have already been asigned
            if (req.body.type == "athlete" && req.body.gender) {
                awardListObj.type = awardDetailObj.type = req.body.type;
                awardDetailObj.gender = req.body.gender;
                SpecialAwardDetails.getAwardsList(awardListObj, awardDetailObj, res.callback);
            } else if (req.body.type == "school" || req.body.type == "college") {
                awardListObj.type = awardDetailObj.type = req.body.type;
                SpecialAwardDetails.getAwardsList(awardListObj, awardDetailObj, res.callback);
            } else {
                res.json({
                    data: "Incorrect Input Fields",
                    val: false
                });
            }

        } else {
            res.json({
                data: "Body Not Found",
                val: false
            });
        }
    },

    getOneAwardDetails: function (req, res) {
        if (req.body && req.body._id) {
            SpecialAwardDetails.getOneAwardDetails(req.body, res.callback);
        } else {
            res.json({
                data: "Incorrect Input Fields",
                value: false
            });
        }
    },

    getAllAwardDetails: function (req, res) {
        if (req.body) {
            SpecialAwardDetails.getAllAwardDetails(req.body, res.callback);
        } else {
            res.json({
                data: "Incorrect Input Fields",
                value: "false"
            });
        }

    }


};
module.exports = _.assign(module.exports, controller);