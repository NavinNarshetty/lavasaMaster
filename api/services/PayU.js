var mongoose = require('mongoose');
var sha512 = require('sha512');
var request = require('request');
var generator = require('generate-password');
var adminUrl = "https://sfanow.in";

var development = false;
if (development) {
    var payukey = "gtKFFx ";
    var payusalt = "eCwWELxi";
    var payuurl = "https://test.payu.in/_payment";
} else {
    var payukey = "l6hqaC";
    var payusalt = "8nQHfYcJ";
    var payuurl = "https://secure.payu.in/_payment";
}


var models = {
    schoolPayment: function (data, callback) {
        var txnid = generator.generate({
            length: 8,
            numbers: true
        });
        var amount = "1.00";
        var firstname = data.schoolName;
        var email = data.email;
        var phone = data.mobile;
        console.log(data);
        // var pg = found.paymentMethod;
        var productinfo = "School Registration to SFA";
        // var hash = sha512("" + payukey + "|" + txnid + "|" + amount + "|" + productinfo + "|" + firstname + "|" + email + "|||||||||||" + payusalt);
        var hash = sha512(payukey + "|" + txnid + "|" + amount + "|" + productinfo + "|" + firstname + "|" + email + "|||||||||||" + payusalt);
        var hashtext = hash.toString('hex');
        data.transactionID = txnid;

        request.post({
            url: payuurl,
            form: {
                key: payukey,
                txnid: txnid,
                amount: amount,
                productinfo: productinfo,
                firstname: firstname,
                email: email,
                phone: phone,
                surl: adminUrl + '/paymentSuccess',
                furl: adminUrl + '/paymentFailure',
                hash: hashtext,
                // pg: pg
            }
        }, function (err, res) {
            if (err) {
                callback(err, null);
            } else if (res.status == "captured") {
                Registration.updatePaymentStatus(data, function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else if (found) {
                        Registration.onlinePaymentMailSms(data, function (err, mailsms) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(mailsms)) {
                                    callback(null, "Data not found");
                                } else {
                                    callback(null, res);
                                }
                            }
                        });
                    }
                });

            } else {
                console.log("res", res);
                callback(null, res);
            }
        });
    },

    atheletePayment: function (found, callback) {

        var txnid = generator.generate({
            length: 8,
            numbers: true
        });
        found.transactionID = txnid;

        var amount = "200.00";
        var firstname = found.firstName;
        var email = found.email;
        var phone = found.mobile;
        var productinfo = "Athelete registeration to SFA";
        var hash = sha512(payukey + "|" + txnid + "|" + amount + "|" + productinfo + "|" + firstname + "|" + email + "|||||||||||" + payusalt);
        var hashtext = hash.toString('hex');
        request.post({
            url: payuurl,
            form: {
                key: payukey,
                txnid: txnid,
                amount: amount,
                productinfo: productinfo,
                firstname: firstname,
                email: email,
                phone: phone,
                surl: adminUrl + '/paymentSuccess',
                furl: adminUrl + '/sorryAthelete',
                hash: hashtext,
            }
        }, function (err, res) {
            if (err) {
                callback(err, null);
            } else if (res.status == "captured") {
                Athelete.updatePaymentStatus(found, function (err, foundNew) {
                    if (err) {
                        callback(err, null);
                    } else if (foundNew) {
                        Athelete.atheletePaymentMail(found, function (err, vData) {
                            if (err) {
                                callback(err, null);
                            } else if (vData) {
                                callback(null, res);
                            }
                        });

                    }
                });
            } else {
                console.log("res", res);
                callback(null, res);
            }
        });
    },

};

module.exports = _.assign(module.exports, models);