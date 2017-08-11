module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    getAthletePerSchool: function (req, res) {
        if (req.body.schoolToken) {
            console.log("inside");
            Registration.findOne({
                accessToken: req.body.schoolToken
            }).exec(function (err, found) {
                if (err) {
                    res.callback(err, null);
                } else if (_.isEmpty(found)) {
                    res.callback("Incorrect Login Details", null);
                } else {
                    console.log("inside");
                    IndividualSport.getAthletePerSchool(req.body, res.callback);
                }
            });
        } else if (req.body.athleteToken) {
            Athelete.findOne({
                accessToken: req.body.athleteToken
            }).exec(function (err, found) {
                if (err) {
                    res.json({
                        value: false,
                        data: "err"
                    });
                } else if (_.isEmpty(found)) {
                    res.json({
                        value: false,
                        data: "User Not logged in"
                    });
                } else {
                    IndividualSport.getAthlete(req.body, res.callback);
                }
            });
        } else {
            res.json({
                value: false,
                data: "User Not logged in"
            });
        }

    },

    saveInIndividual: function (req, res) {
        if (req.body.schoolToken) {
            Registration.findOne({
                accessToken: req.body.schoolToken
            }).exec(function (err, found) {
                if (err) {
                    res.json({
                        value: false,
                        data: "Something went wrong"
                    });
                } else if (_.isEmpty(found)) {
                    res.json({
                        value: false,
                        data: "Data not found"
                    });
                } else {
                    req.body.school = found.schoolName;
                    req.body.sfaid = found.sfaID;
                    req.body.email = found.email;
                    req.body.mobile = found.mobile;
                    IndividualSport.saveInIndividual(req.body, res.callback);
                }
            });
        } else if (req.body.athleteToken) {
            Athelete.findOne({
                accessToken: req.body.athleteToken
            }).exec(function (err, found) {
                if (err) {
                    res.json({
                        value: false,
                        data: "Something went wrong !"
                    });
                } else if (_.isEmpty(found)) {
                    res.json({
                        value: false,
                        data: "No data found"
                    });
                } else {
                    IndividualSport.saveInIndividualAthlete(req.body, res.callback);
                }
            });

        } else {
            res.json({
                value: false,
                data: "User Not logged in"
            });
        }

    },

    generateExcel: function (req, res) {
        IndividualSport.generateExcel(res);
    },



};
module.exports = _.assign(module.exports, controller);