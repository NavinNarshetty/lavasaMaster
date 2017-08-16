module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    login: function (req, res) {
        if (req.body) {
            if (req.body.sfaid && req.body.sfaid !== "" && req.body.password && req.body.password !== "" && req.body.type && req.body.type !== "") {
                Login.login(req.body, res.callback);
            } else {
                res.json({
                    data: "Please provide params",
                    value: false
                });
            }
        } else {
            res.json({
                data: "Invalid Call",
                value: true
            });
        }
    },

    logout: function (req, res) {
        if (req.body) {
            Login.tokenRemove(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    forgotPasswordSchool: function (req, res) {
        if (req.body) {
            if (req.body.email && req.body.email !== "" && req.body.sfaid && req.body.sfaid !== "" && req.body.type && req.body.type !== "") {
                if (req.body.type == "school") {
                    Login.forgotPassword(req.body, res.callback);
                } else {
                    res.json({
                        value: false,
                        data: "Only School can Change Password"
                    });
                }
            } else {
                res.json({
                    value: false,
                    data: "Please provide All Details"
                });
            }
        } else {
            res.json({
                value: false,
                data: "Invalid Call"
            });
        }
    },

    forgotPasswordAthlete: function (req, res) {
        console.log('enter');
        if (req.body) {
            if (req.body.email && req.body.email !== "" && req.body.sfaid && req.body.sfaid !== "" && req.body.type && req.body.type !== "") {
                if (req.body.type == "athlete") {
                    console.log('enter');
                    Login.forgotPassword(req.body, res.callback);
                } else {
                    res.json({
                        value: false,
                        data: "Only Athlete can Change Password"
                    });
                }
            } else {
                console.log('enter');
                res.json({
                    value: false,
                    data: "Please provide All Details"
                });
            }
        } else {
            console.log('enter');
            res.json({
                value: false,
                data: "Invalid Call"
            });
        }
        console.log('enter');
    },

    changePassword: function (req, res) {
        if (req.body) {
            Login.tokenCheck(req.body, function (err, complete) {
                if (err) {
                    callback(err, null);
                } else if (complete) {
                    if (complete.school) {
                        req.body._id = complete.school;
                        Login.changeSchoolPassword(req.body, res.callback);
                    } else if (complete.athlete) {
                        req.body._id = complete.athlete;
                        Login.changeAthletePassword(req.body, res.callback);
                    } else {
                        callback(err, "Access Token not identified");
                    }
                }
            });
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    editAccess: function (req, res) {
        if (req.body) {
            Login.editAccess(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
};
module.exports = _.assign(module.exports, controller);