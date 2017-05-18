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
        // var txnid = generator.generate({
        //     length: 8,
        //     numbers: true
        // });
        var txnid = data._id;
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
                surl: 'https://sfanow.in/payU/successErrorSchool',
                furl: 'https://sfanow.in/payU/successErrorSchool',
                hash: hashtext,
                // pg: pg
            }
        }, callback);
    },

    atheletePayment: function (found, callback) {

        // var txnid = generator.generate({
        //     length: 8,
        //     numbers: true
        // });

        var txnid = found._id;
        // found.transactionID = txnid;

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
                surl: 'https://sfanow.in/payU/successErrorAthelete',
                furl: 'https://sfanow.in/payU/successErrorAthelete',
                hash: hashtext,
            }
        }, callback);
    },
};

module.exports = _.assign(module.exports, models);