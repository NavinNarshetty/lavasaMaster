var mongoose = require('mongoose');
var sha512 = require('sha512');
var request = require('request');
var development = false;
if (development) {
    var payukey = "sWGItI";
    var payusalt = "11yVS4fo";
    var payuurl = "https://test.payu.in/_payment";
} else {
    var payukey = "l6hqaC";
    var payusalt = "8nQHfYcJ";
    var payuurl = "https://secure.payu.in/_payment";
}


var models = {
    schoolPayment: function (data, callback) {
        Registration.findOne({
            "_id": data._id
        }).exec(function (err, found) {
            console.log('found0000000000000000000000000000', found);
            if (err) {
                callback(err, null);
            } else if (found) {
                // var txnid = found.orderId + parseInt(Math.random() * 100000);
                var txnid = found.sfaID;
                // var txnid = found._id;
                // var amount = found.totalAmount;
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
                        // pg: pg
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
            } else {
                callback(null, {});
            }
        });
    },

    atheletePayment: function (data, callback) {
        Athelete.findOne({
            "_id": data._id
        }).exec(function (err, found) {
            console.log('found0000000000000000000000000000', found);
            if (err) {
                callback(err, null);
            } else if (found) {
                var txnid = found.sfaId;
                var amount = "20.00";
                var firstname = found.firstName;
                var email = found.email;
                var phone = found.mobile;
                // var pg = found.paymentMethod;
                var productinfo = "Athelete registeration to SFA";
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
                        furl: 'http://localhost/payU/successError',
                        hash: hashtext,
                        // pg: pg
                    }
                }, function (err, res) {
                    if (err) {
                        callback(err, null);
                    } else if (res) {
                        Athelete.updatePaymentStatus(data, function (err, found) {
                            if (err) {
                                callback(err, null);
                            } else if (found) {
                                callback(null, found);
                            }
                        });
                    }
                });
            } else {
                callback(null, {});
            }
        });
    },

};

module.exports = _.assign(module.exports, models);