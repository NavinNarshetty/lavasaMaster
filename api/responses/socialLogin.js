module.exports = function (profile) {
    var req = this.req;
    var res = this.res;
    var sails = req._sails;
    if (_.isEmpty(profile)) {
        res.callback("Error fetching profile in Social Login", profile);
        // res.serverError();
    } else {
        if (req.session.returnUrl) {
            User.existsSocial(profile, function (err, data) {
                if (err || !data) {
                    res.callback(err, data);
                } else {
                    if (data.accessLevel == "New User") {
                        data.accessToken[0] = "AccessNotAvailable";
                    }
                    console.log("data",data);
                    res.redirect(req.session.returnUrl + "/" + data.accessToken[0] + "/" + data.accessLevel);
                    req.session.destroy(function () {});
                }
            });
        } else {
            User.existsSocial(profile, res.callback);
        }
    }
};