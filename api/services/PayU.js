var mongoose = require('mongoose');
var sha512 = require('sha512');
var request = require('request');
var generator = require('generate-password');


var development = true;
if (development) {
    var payukey = "gtKFFx";
    var payusalt = "eCwWELxi";
    var payuurl = "https://test.payu.in/_payment";
} else {
    var payukey = "l6hqaC";
    var payusalt = "8nQHfYcJ";
    var payuurl = "https://secure.payu.in/_payment";
}


var models = {

    schoolPayment: function (data, callback) {
        Accounts.findOne({
            school: data._id
        }).lean().exec(function (err, accountsData) {
            if (err) {
                callback(null, {
                    error: err,
                    data: found
                });
            } else {
                data.accounts = accountsData;
                var txnid = generator.generate({
                    length: 8,
                    numbers: true
                });
                //var txnid = data.;
                var amount = data.accounts.totalPaid;
                var firstname = data.schoolName;
                var udf1 = data.schoolName;
                var pincode = data.pinCode;
                var city = data.city;
                var country = "India";
                var state = data.state;
                var schoolAddress1 = data.schoolAddress;
                var schoolAddress2 = data.schoolAddressLine2;
                var email = data.email;
                var phone = data.mobile;
                console.log(data);
                // var pg = found.paymentMethod;
                if (data.property.institutionType == "school") {
                    var productinfo = "School Registration to SFA";
                } else {
                    var productinfo = "College Registration to SFA";
                }
                var hash = sha512(payukey + "|" + txnid + "|" + amount + "|" + productinfo + "|" + firstname + "|" + email + "|" + udf1 + "||||||||||" + payusalt);
                var hashtext = hash.toString('hex');
                request.post({
                    url: payuurl,
                    form: {
                        key: payukey,
                        txnid: txnid,
                        amount: amount,
                        productinfo: productinfo,
                        firstname: firstname,
                        udf1: udf1,
                        // surl: 'http://mumbaischool.sfanow.in/api/payU/successErrorSchool',
                        // furl: 'http://mumbaischool.sfanow.in/api/payU/successErrorSchool',
                        // surl: 'http://mumbaicollege.sfanow.in/api/payU/successErrorSchool',
                        // furl: 'http://mumbaicollege.sfanow.in/api/payU/successErrorSchool',
                        // surl: 'http://hyderabadschool.sfanow.in/api/payU/successErrorSchool',
                        // furl: 'http://hyderabadschool.sfanow.in/api/payU/successErrorSchool',
                        // surl: 'http://hyderabadcollege.sfanow.in/api/payU/successErrorSchool',
                        // furl: 'http://hyderabadcollege.sfanow.in/api/payU/successErrorSchool',
                        // surl: 'http://ahmedabadschool.sfanow.in/api/payU/successErrorSchool',
                        // furl: 'http://ahmedabadschool.sfanow.in/api/payU/successErrorSchool',
                        // surl: 'http://ahmedabadcollege.sfanow.in/api/payU/successErrorSchool',
                        // furl: 'http://ahmedabadcollege.sfanow.in/api/payU/successErrorSchool',
                        email: email,
                        phone: phone,
                        // surl: 'http://sfa2.wohlig.co.in/api/payU/successErrorSchool',
                        // furl: 'http://sfa2.wohlig.co.in/api/payU/successErrorSchool',
                        // surl: 'https://sfa.wohlig.co.in/api/payU/successErrorSchool',
                        // furl: 'https://sfa.wohlig.co.in/api/payU/successErrorSchool',
                        // surl: 'http://testmumbai2015.sfanow.in/api/payU/successErrorSchool',
                        // furl: 'http://testmumbai2015.sfanow.in/api/payU/successErrorSchool',
                        // surl: 'http://testmumbai2016.sfanow.in/api/payU/successErrorSchool',
                        // furl: 'http://testmumbai2016.sfanow.in/api/payU/successErrorSchool',
                        // surl: 'http://testmumbaischool.sfanow.in/api/payU/successErrorSchool',
                        // furl: 'http://testmumbaischool.sfanow.in/api/payU/successErrorSchool',
                        // surl: 'http://testmumbaicollege.sfanow.in/api/payU/successErrorSchool',
                        // furl: 'http://testmumbaicollege.sfanow.in/api/payU/successErrorSchool',
                        // surl: 'http://testhyderabadschool.sfanow.in/api/payU/successErrorSchool',
                        // furl: 'http://testhyderabadschool.sfanow.in/api/payU/successErrorSchool',
                        // surl: 'http://testhyderabadcollege.sfanow.in/api/payU/successErrorSchool',
                        // furl: 'http://testhyderabadcollege.sfanow.in/api/payU/successErrorSchool',
                        // surl: 'http://testahmedabadschool.sfanow.in/api/payU/successErrorSchool',
                        // furl: 'http://testahmedabadschool.sfanow.in/api/payU/successErrorSchool',
                        // surl: 'http://testahmedabadcollege.sfanow.in/api/payU/successErrorSchool',
                        // furl: 'http://testahmedabadcollege.sfanow.in/api/payU/successErrorSchool',
                        surl: 'http://wohlig.io:1337/api/payU/successErrorSchool',
                        furl: 'http://wohlig.io:1337/api/payU/successErrorSchool',
                        hash: hashtext,
                        // pg: pg,
                        address1: schoolAddress1,
                        address2: schoolAddress2,
                        state: state,
                        country: country,
                        zipcode: pincode,
                        city: city,

                    }
                }, callback);
            }
        });
    },

    atheletePayment: function (found, callback) {
        console.log("found", found);
        Accounts.findOne({
            athlete: found._id
        }).lean().exec(function (err, accountsData) {
            if (err) {
                callback(null, {
                    error: err,
                    data: found
                });
            } else {
                found.accounts = accountsData;
                var txnid = generator.generate({
                    length: 8,
                    numbers: true
                });

                var amount = found.accounts.totalPaid;
                var firstname = found.firstName;
                var lastname = found.surname;
                var pincode = found.pinCode;
                var city = found.city;
                var country = "India";
                var state = found.state;
                var athleteAddress1 = found.address;
                var athleteAddress2 = found.addressLine2;
                var email = found.email;
                var phone = found.mobile;
                var productinfo = found.package.description;
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
                        // surl: 'http://mumbaischool.sfanow.in/api/payU/successErrorAthelete',
                        // furl: 'http://mumbaischool.sfanow.in/api/payU/successErrorAthelete',
                        // surl: 'http://mumbaicollege.sfanow.in/api/payU/successErrorAthelete',
                        // furl: 'http://mumbaicollege.sfanow.in/api/payU/successErrorAthelete',
                        // surl: 'http://hyderabadschool.sfanow.in/api/payU/successErrorAthelete',
                        // furl: 'http://hyderabadschool.sfanow.in/api/payU/successErrorAthelete',
                        // surl: 'http://hyderabadcollege.sfanow.in/api/payU/successErrorAthelete',
                        // furl: 'http://hyderabadcollege.sfanow.in/api/payU/successErrorAthelete',
                        // surl: 'http://ahmedabadschool.sfanow.in/api/payU/successErrorAthelete',
                        // furl: 'http://ahmedabadschool.sfanow.in/api/payU/successErrorAthelete',
                        // surl: 'http://ahmedabadcollege.sfanow.in/api/payU/successErrorAthelete',
                        // furl: 'http://ahmedabadcollege.sfanow.in/api/payU/successErrorAthelete',
                        phone: phone,
                        // surl: 'http://sfa2.wohlig.co.in/api/payU/successErrorAthelete',
                        // furl: 'http://sfa2.wohlig.co.in/api/payU/successErrorAthelete',
                        // surl: 'https://sfa.wohlig.co.in/api/payU/successErrorAthelete',
                        // furl: 'https://sfa.wohlig.co.in/api/payU/successErrorAthelete',
                        // surl: 'http://testmumbai2015.sfanow.in/api/payU/successErrorAthelete',
                        // furl: 'http://testmumbai2015.sfanow.in/api/payU/successErrorAthelete',
                        // surl: 'http://testmumbai2016.sfanow.in/api/payU/successErrorAthelete',
                        // furl: 'http://testmumbai2016.sfanow.in/api/payU/successErrorAthelete',
                        surl: 'http://testmumbaischool.sfanow.in/api/payU/successErrorAthelete',
                        furl: 'http://testmumbaischool.sfanow.in/api/payU/successErrorAthelete',
                        // surl: 'http://testmumbaicollege.sfanow.in/api/payU/successErrorAthelete',
                        // furl: 'http://testmumbaicollege.sfanow.in/api/payU/successErrorAthelete',
                        // surl: 'http://testhyderabadschool.sfanow.in/api/payU/successErrorAthelete',
                        // furl: 'http://testhyderabadschool.sfanow.in/api/payU/successErrorAthelete',
                        // surl: 'http://testhyderabadcollege.sfanow.in/api/payU/successErrorAthelete',
                        // furl: 'http://testhyderabadcollege.sfanow.in/api/payU/successErrorAthelete',
                        // surl: 'http://testahmedabadschool.sfanow.in/api/payU/successErrorAthelete',
                        // furl: 'http://testahmedabadschool.sfanow.in/api/payU/successErrorAthelete',
                        // surl: 'http://testahmedabadcollege.sfanow.in/api/payU/successErrorAthelete',
                        // furl: 'http://testahmedabadcollege.sfanow.in/api/payU/successErrorAthelete',
                        // surl: 'http://wohlig.io:1337/api/payU/successErrorAthelete',
                        // furl: 'http://wohlig.io:1337/api/payU/successErrorAthelete',
                        hash: hashtext,
                        address1: athleteAddress1,
                        address2: athleteAddress2,
                        state: state,
                        country: country,
                        zipcode: pincode,
                        city: city
                    }
                }, callback);
            }
        });
    },

    additionalPayment: function (found, callback) {
        console.log("found", found);

        var txnid = generator.generate({
            length: 8,
            numbers: true
        });

        // var txnid = found._id;
        // found.transactionID = txnid;

        var amount = found.property.additionalFee;
        var firstname = found.firstName;
        var lastname = found.surname;
        var pincode = found.pinCode;
        var city = found.city;
        var country = "India";
        var state = found.state;
        var athleteAddress1 = found.address;
        var athleteAddress2 = found.addressLine2;
        var email = found.email;
        var phone = found.mobile;
        var productinfo = "Athelete Additional Fee to SFA";
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
                // surl: 'http://mumbaischool.sfanow.in/api/payU/successError',
                // furl: 'http://mumbaischool.sfanow.in/api/payU/successError',
                // surl: 'http://mumbaicollege.sfanow.in/api/payU/successError',
                // furl: 'http://mumbaicollege.sfanow.in/api/payU/successError',
                // surl: 'http://hyderabadschool.sfanow.in/api/payU/successError',
                // furl: 'http://hyderabadschool.sfanow.in/api/payU/successError',
                // surl: 'http://hyderabadcollege.sfanow.in/api/payU/successError',
                // furl: 'http://hyderabadcollege.sfanow.in/api/payU/successError',
                // surl: 'http://ahmedabadschool.sfanow.in/api/payU/successError',
                // furl: 'http://ahmedabadschool.sfanow.in/api/payU/successError',
                // surl: 'http://ahmedabadcollege.sfanow.in/api/payU/successError',
                // furl: 'http://ahmedabadcollege.sfanow.in/api/payU/successError',
                phone: phone,
                // surl: 'http://sfa2.wohlig.co.in/api/payU/successError',
                // furl: 'http://sfa2.wohlig.co.in/api/payU/successError',
                // surl: 'https://sfa.wohlig.co.in/api/payU/successError',
                // furl: 'https://sfa.wohlig.co.in/api/payU/successError',
                // surl: 'http://testmumbai2015.sfanow.in/api/payU/successError',
                // furl: 'http://testmumbai2015.sfanow.in/api/payU/successError',
                // surl: 'http://testmumbai2016.sfanow.in/api/payU/successError',
                // furl: 'http://testmumbai2016.sfanow.in/api/payU/successError',
                surl: 'http://testmumbaischool.sfanow.in/api/payU/successError',
                furl: 'http://testmumbaischool.sfanow.in/api/payU/successError',
                // surl: 'http://testmumbaicollege.sfanow.in/api/payU/successError',
                // furl: 'http://testmumbaicollege.sfanow.in/api/payU/successError',
                // surl: 'http://testhyderabadschool.sfanow.in/api/payU/successError',
                // furl: 'http://testhyderabadschool.sfanow.in/api/payU/successError',
                // surl: 'http://testhyderabadcollege.sfanow.in/api/payU/successError',
                // furl: 'http://testhyderabadcollege.sfanow.in/api/payU/successError',
                // surl: 'http://testahmedabadschool.sfanow.in/api/payU/successError',
                // furl: 'http://testahmedabadschool.sfanow.in/api/payU/successError',
                // surl: 'http://testahmedabadcollege.sfanow.in/api/payU/successError',
                // furl: 'http://testahmedabadcollege.sfanow.in/api/payU/successError',
                hash: hashtext,
                address1: athleteAddress1,
                address2: athleteAddress2,
                state: state,
                country: country,
                zipcode: pincode,
                city: city
            }
        }, callback);
    },

    //------------------------------------  PACKAGE UPGRADE PAYMENT --------------------------------

    atheleteUpgradePayment: function (found, callback) {
        console.log("found", found);
        Accounts.findOne({
            athlete: found._id
        }).lean().exec(function (err, accountsData) {
            if (err) {
                callback(null, {
                    error: err,
                    data: found
                });
            } else {
                found.accounts = accountsData;
                var txnid = generator.generate({
                    length: 8,
                    numbers: true
                });

                var amount = found.accounts.outstandingAmount;
                var firstname = found.firstName;
                var lastname = found.surname;
                var pincode = found.pinCode;
                var city = found.city;
                var country = "India";
                var state = found.state;
                var athleteAddress1 = found.address;
                var athleteAddress2 = found.addressLine2;
                var email = found.email;
                var phone = found.mobile;
                var productinfo = "package";
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
                        // surl: 'http://mumbaischool.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // furl: 'http://mumbaischool.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // surl: 'http://mumbaicollege.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // furl: 'http://mumbaicollege.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // surl: 'http://hyderabadschool.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // furl: 'http://hyderabadschool.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // surl: 'http://hyderabadcollege.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // furl: 'http://hyderabadcollege.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // surl: 'http://ahmedabadschool.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // furl: 'http://ahmedabadschool.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // surl: 'http://ahmedabadcollege.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // furl: 'http://ahmedabadcollege.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        phone: phone,
                        // surl: 'http://sfa2.wohlig.co.in/api/payU/successUpgradeErrorAthelete',
                        // furl: 'http://sfa2.wohlig.co.in/api/payU/successUpgradeErrorAthelete',
                        // surl: 'https://sfa.wohlig.co.in/api/payU/successUpgradeErrorAthelete',
                        // furl: 'https://sfa.wohlig.co.in/api/payU/successUpgradeErrorAthelete',
                        // surl: 'http://testmumbai2015.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // furl: 'http://testmumbai2015.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // surl: 'http://testmumbai2016.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // furl: 'http://testmumbai2016.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        surl: 'http://testmumbaischool.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        furl: 'http://testmumbaischool.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // surl: 'http://testmumbaicollege.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // furl: 'http://testmumbaicollege.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // surl: 'http://testhyderabadschool.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // furl: 'http://testhyderabadschool.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // surl: 'http://testhyderabadcollege.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // furl: 'http://testhyderabadcollege.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // surl: 'http://testahmedabadschool.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // furl: 'http://testahmedabadschool.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // surl: 'http://testahmedabadcollege.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // furl: 'http://testahmedabadcollege.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // surl: 'http://wohlig.io:1337/api/payU/successUpgradeErrorAthelete',
                        // furl: 'http://wohlig.io:1337/api/payU/successUpgradeErrorAthelete',
                        hash: hashtext,
                        address1: athleteAddress1,
                        address2: athleteAddress2,
                        state: state,
                        country: country,
                        zipcode: pincode,
                        city: city
                    }
                }, callback);
            }
        });
    },

    schoolUpgradePayment: function (data, callback) {
        Accounts.findOne({
            school: data._id
        }).lean().exec(function (err, accountsData) {
            if (err) {
                callback(null, {
                    error: err,
                    data: found
                });
            } else {
                data.accounts = accountsData;
                var txnid = generator.generate({
                    length: 8,
                    numbers: true
                });
                //var txnid = data.;
                var amount = data.accounts.outstandingAmount;
                var firstname = data.schoolName;
                var udf1 = data.schoolName;
                var pincode = data.pinCode;
                var city = data.city;
                var country = "India";
                var state = data.state;
                var schoolAddress1 = data.schoolAddress;
                var schoolAddress2 = data.schoolAddressLine2;
                var email = data.email;
                var phone = data.mobile;
                console.log(data);
                // var pg = found.paymentMethod;
                if (data.property.institutionType == "school") {
                    var productinfo = "School Registration to SFA";
                } else {
                    var productinfo = "College Registration to SFA";
                }
                var hash = sha512(payukey + "|" + txnid + "|" + amount + "|" + productinfo + "|" + firstname + "|" + email + "|" + udf1 + "||||||||||" + payusalt);
                var hashtext = hash.toString('hex');
                request.post({
                    url: payuurl,
                    form: {
                        key: payukey,
                        txnid: txnid,
                        amount: amount,
                        productinfo: productinfo,
                        firstname: firstname,
                        udf1: udf1,
                        // surl: 'http://mumbaischool.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // furl: 'http://mumbaischool.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // surl: 'http://mumbaicollege.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // furl: 'http://mumbaicollege.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // surl: 'http://hyderabadschool.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // furl: 'http://hyderabadschool.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // surl: 'http://hyderabadcollege.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // furl: 'http://hyderabadcollege.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // surl: 'http://ahmedabadschool.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // furl: 'http://ahmedabadschool.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // surl: 'http://ahmedabadcollege.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // furl: 'http://ahmedabadcollege.sfanow.in/api/payU/successUpgradeErrorSchool',
                        email: email,
                        phone: phone,
                        // surl: 'http://sfa2.wohlig.co.in/api/payU/successUpgradeErrorSchool',
                        // furl: 'http://sfa2.wohlig.co.in/api/payU/successUpgradeErrorSchool',
                        // surl: 'https://sfa.wohlig.co.in/api/payU/successUpgradeErrorSchool',
                        // furl: 'https://sfa.wohlig.co.in/api/payU/successUpgradeErrorSchool',
                        // surl: 'http://testmumbai2015.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // furl: 'http://testmumbai2015.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // surl: 'http://testmumbai2016.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // furl: 'http://testmumbai2016.sfanow.in/api/payU/successUpgradeErrorSchool',
                        surl: 'http://testmumbaischool.sfanow.in/api/payU/successUpgradeErrorSchool',
                        furl: 'http://testmumbaischool.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // surl: 'http://testmumbaicollege.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // furl: 'http://testmumbaicollege.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // surl: 'http://testhyderabadschool.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // furl: 'http://testhyderabadschool.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // surl: 'http://testhyderabadcollege.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // furl: 'http://testhyderabadcollege.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // surl: 'http://testahmedabadschool.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // furl: 'http://testahmedabadschool.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // surl: 'http://testahmedabadcollege.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // furl: 'http://testahmedabadcollege.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // surl: 'http://wohlig.io:1337/api/payU/successUpgradeErrorSchool',
                        // furl: 'http://wohlig.io:1337/api/payU/successUpgradeErrorSchool',
                        hash: hashtext,
                        // pg: pg,
                        address1: schoolAddress1,
                        address2: schoolAddress2,
                        state: state,
                        country: country,
                        zipcode: pincode,
                        city: city
                    }
                }, callback);
            }
        });
    },

};

module.exports = _.assign(module.exports, models);