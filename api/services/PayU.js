var mongoose = require('mongoose');
var sha512 = require('sha512');
var request = require('request');
var generator = require('generate-password');

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
        var amount = "20.00";
        var firstname = found.schoolName;
        var email = found.email;
        var phone = found.mobile;
        // var pg = found.paymentMethod;
        var productinfo = "School Registration to SFA";
        // var hash = sha512("" + payukey + "|" + txnid + "|" + amount + "|" + productinfo + "|" + firstname + "|" + email + "|||||||||||" + payusalt);
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
                surl: 'http://localhost:1337/payU/successError',
                furl: 'http://localhost:1337/payU/successError',
                hash: hashtext,
                pg: pg
            }
        }, function (err, res) {
            if (err) {
                callback(err, null);
            } else if (res) {
                console.log("response", res);
                Registration.updatePaymentStatus(data, function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else if (found) {
                        callback(null, res);
                    }
                });
            }
        });
    },

    atheletePayment: function (found, callback) {

        var txnid = generator.generate({
            length: 8,
            numbers: true
        });

        var amount = "20.00";
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
                surl: 'http://localhost:8080/#/formathlete',
                furl: 'http://localhost/8080/#/formregis',
                hash: hashtext,
            }
        }, function (err, res) {
            if (err) {
                callback(err, null);
            } else if (res.status == "captured") {
                console.log("response", res);
                Athelete.updatePaymentStatus(found, function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else if (found) {
                        callback(null, res);
                    }
                });
            } else {
                console.log("res", res);
                callback(null, res);
            }
        });
    },

    // atheletePayment: function (found, callback) {
    //     console.log("inside payU");
    //     var txnid = "ase445";
    //     // var txnid = found._id;
    //     var amount = "20.00";
    //     var firstname = found.firstName;
    //     var email = found.email;
    //     var phone = found.mobile;
    //     var productinfo = "Purchase of test";
    //     // var hash = sha512("" + payukey + "|" + txnid + "|" + amount + "|" + productinfo + "|" + firstname + "|" + email + "|||||||||||" + payusalt);
    //     var hash = sha512(payukey + "|" + txnid + "|" + amount + "|" + productinfo + "|" + firstname + "|" + email + "|||||||||||" + payusalt);
    //     var hashtext = hash.toString('hex');
    //     var pg = "debit";
    //     request.post({
    //         url: payuurl,
    //         form: {
    //             key: payukey,
    //             txnid: txnid,
    //             amount: amount,
    //             productinfo: productinfo,
    //             firstname: firstname,
    //             email: email,
    //             phone: phone,
    //             // surl: 'http://35.154.98.245:1337/payU/successError',
    //             // furl: 'http://35.154.98.245:1337/payU/successError',
    //             surl: 'http://localhost:8080/#/formathlete',
    //             furl: 'http://localhost/8080/#/formregis',
    //             // furl: 'http://localhost:1337/payU/successError',
    //             // surl: 'http://localhost:1337/payU/successError',
    //             hash: hashtext,
    //             pg: pg
    //         }
    //     }, callback);
    // },

};

module.exports = _.assign(module.exports, models);