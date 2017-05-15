module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    schoolPayment: function (req, res) {
        if (req) {
            console.log(sails.getBaseUrl());
            PayU.schoolPayment(req.body, function (err, httpResponse, body) {
                console.log('err', err);
                console.log('httpResponse', httpResponse);
                console.log('body', req.headers.origin);
                if (httpResponse.statusCode == 302) {
                    res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
                    res.header("Access-Control-Allow-Headers", "*");
                    res.header('Access-Control-Allow-Credentials', true);
                    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
                    // res.redirect(httpResponse.headers.location);
                    console.log("location", httpResponse.headers.location);
                } else {
                    res.send(body);
                }
            });
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    atheletePayment: function (req, res) {
        if (req) {
            console.log(sails.getBaseUrl());
            PayU.atheletePayment(req.body, function (err, httpResponse, body) {
                console.log('err', err);
                console.log('httpResponse', httpResponse);
                console.log('body', req.headers.origin);
                if (httpResponse.statusCode == 302) {
                    res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
                    res.header("Access-Control-Allow-Headers", "*");
                    res.header('Access-Control-Allow-Credentials', true);
                    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
                    res.redirect(httpResponse.headers.location);
                } else {
                    res.send(body);
                }
            });
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

};
module.exports = _.assign(module.exports, controller);