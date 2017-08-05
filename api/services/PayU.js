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
        var amount = data.property.totalAmountType;
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
        if (data.property.institutionType == "school") {
            var productinfo = "School Registration to SFA";
        } else {
            var productinfo = "College Registration to SFA";
        }

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
                surl: 'http://mumbaischool.sfanow.in/api/payU/successErrorSchool',
                furl: 'http://mumbaischool.sfanow.in/api/payU/successErrorSchool',
                // surl: 'http://mumbaicollege.sfanow.in/api/payU/successErrorSchool',
                // furl: 'http://mumbaicollege.sfanow.in/api/payU/successErrorSchool',
                email: email,
                phone: phone,
                // surl: 'http://sfa2.wohlig.co.in/api/payU/successErrorSchool',
                // furl: 'http://sfa2.wohlig.co.in/api/payU/successErrorSchool',
                // surl: 'https://sfa.wohlig.co.in/api/payU/successErrorSchool',
                // furl: 'https://sfa.wohlig.co.in/api/payU/successErrorSchool',
                // surl: 'http://testmumbaischool.sfanow.in/api/payU/successErrorSchool',
                // furl: 'http://testmumbaischool.sfanow.in/api/payU/successErrorSchool',
                // surl: 'http://testmumbaicollege.sfanow.in/api/payU/successErrorSchool',
                // furl: 'http://testmumbaicollege.sfanow.in/api/payU/successErrorSchool',
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

        var amount = data.property.totalAmountAthlete;
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
                surl: 'http://mumbaischool.sfanow.in/api/payU/successErrorAthelete',
                furl: 'http://mumbaischool.sfanow.in/api/payU/successErrorAthelete',
                // surl: 'http://mumbaicollege.sfanow.in/api/payU/successErrorAthelete',
                // furl: 'http://mumbaicollege.sfanow.in/api/payU/successErrorAthelete',
                phone: phone,
                // surl: 'http://sfa2.wohlig.co.in/api/payU/successErrorAthelete',
                // furl: 'http://sfa2.wohlig.co.in/api/payU/successErrorAthelete',
                // surl: 'https://sfa.wohlig.co.in/api/payU/successErrorAthelete',
                // furl: 'https://sfa.wohlig.co.in/api/payU/successErrorAthelete',
                // surl: 'http://testmumbaischool.sfanow.in/api/payU/successErrorAthelete',
                // furl: 'http://testmumbaischool.sfanow.in/api/payU/successErrorAthelete',
                // surl: 'http://testmumbaicollege.sfanow.in/api/payU/successErrorAthelete',
                // furl: 'http://testmumbaicollege.sfanow.in/api/payU/successErrorAthelete',
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