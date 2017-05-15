module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    schoolPayment: function (req, res) {
        if (req) {
            var id = (req.query.id);
            Registration.findOne({
                _id: id
            }).lean().exec(function (err, data) {
                PayU.schoolPayment(data, function (err, httpResponse) {
                    if (httpResponse.statusCode == 302) {
                        res.redirect(httpResponse.headers.location);
                    } else {
                        res.send(data);
                    }
                });
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
            var id = (req.query.id);
            Registration.findOne({
                _id: id
            }).lean().exec(function (err, data) {
                PayU.atheletePayment(data, function (err, httpResponse) {
                    if (httpResponse.statusCode == 302) {
                        res.redirect(httpResponse.headers.location);
                    } else {
                        res.send(data);
                    }
                });
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