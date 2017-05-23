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
        //var txnid = data.;
        var amount = "12000.00";
        var firstname = data.schoolName;
        var pincode = data.pinCode;
        var city = data.city;
        var country = "India";
        var state = data.state;
        var address = data.address;
        var email = data.email;
        var phone = data.mobile;
        console.log(data);
        // var pg = found.paymentMethod;
        var productinfo = "School Registration to SFA";
        // var hash = sha512("" + payukey + "|" + txnid + "|" + amount + "|" + productinfo + "|" + firstname + "|" + email + "|||||||||||" + payusalt);
        var hash = sha512(payukey + "|" + txnid + "|" + amount + "|" + productinfo + "|" + firstname + "|" + email + "|||||||||||" + payusalt);
        var hashtext = hash.toString('hex');
        // data.transactionID = txnid;

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
                surl: 'https://sfa.wohlig.co.in/api/payU/successErrorSchool',
                furl: 'https://sfa.wohlig.co.in/api/payU/successErrorSchool',
                hash: hashtext
                // pg: pg
            }
        }, callback);
    },

    atheletePayment: function (found, callback) {
        console.log("found", found);

        var txnid = generator.generate({
            length: 8,
            numbers: true
        });

        // var txnid = found._id;
        // found.transactionID = txnid;

        var amount = "200.00";
        var firstname = found.firstName;
        var lastname = found.surname;
        var pincode = found.pinCode;
        var city = found.city;
        var country = "India";
        var state = found.state;
        var address = found.address;
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
                lastname: lastname,
                email: email,
                phone: phone,
                surl: 'https://sfa.wohlig.co.in/api/payU/successErrorAthelete',
                furl: 'https://sfa.wohlig.co.in/api/payU/successErrorAthelete',
                hash: hashtext,
                address: address,
                state: state,
                country: country,
                postalcode: pincode,

            }
        }, callback);
    },
};

module.exports = _.assign(module.exports, models);