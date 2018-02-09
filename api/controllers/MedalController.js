module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    getAllMedals: function (req, res) {
        Medal.getAllMedals(req.body, res.callback);
    },

    getOneMedal: function (req, res) {
        if (req.body) {
            if (req.body && req.body._id) {
                var matchObj = {
                    "_id": req.body._id
                }
                Medal.getOneMedal(matchObj, res.callback);
            } else {
                res.json({
                    data: "Some Fields are Missing",
                    value: false
                });
            }
        } else {
            res.json({
                data: "Body Not Found",
                value: false
            });
        }
    },

    saveMedal: function (req, res) {
        if (req.body) {
            if (req.body && req.body.sportslist && req.body.gender && req.body.ageGroup) {
                Medal.saveMedal(req.body, res.callback);
            } else {
                res.json({
                    data: "Some Fields are Missing",
                    value: false
                });
            }
        } else {
            res.json({
                data: "Body Not Found",
                value: false
            });
        }
    },

    getTeamsAthletesBySport: function (req, res) {
        if (req.body && req.body.sportslist && req.body.gender && req.body.ageGroup && req.body.medalType) {
            var medalId = null;
            var matchSportObj = {
                "sportslist": req.body.sportslist,
                "gender": req.body.gender,
                "ageGroup": req.body.ageGroup
            };
            if (req.body.weight) {
                matchSportObj.weight = req.body.weight
            }
            if (req.body.medalId) {
                medalId = req.body.medalId;
            }
            Medal.getTeamsAthletesBySport(matchSportObj, medalId, req.body.medalType, res.callback);
        } else {
            res.json({
                data: "Some Fileds Are Missing",
                value: false
            });
        }

    },

    getCertificate: function (req, res) {
        console.log("---------------------");
        if (req.body && req.body._id) {
            var obj = {
                "_id": req.body._id
            }
            Medal.getCertificate(obj, res.callback);
        } else {
            res.json({
                data: "Some Fileds Are Missing",
                value: false
            });
        }
    },

    generateExcel: function (req, res) {
        res.connection.setTimeout(200000000);
        req.connection.setTimeout(200000000);
        console.log("inside controller");
        Medal.generateExcel(res);
    },

};
module.exports = _.assign(module.exports, controller);