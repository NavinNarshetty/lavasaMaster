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
                        surl: 'https://mumbaischool.sfanow.in/api/payU/successErrorSchool',
                        furl: 'https://mumbaischool.sfanow.in/api/payU/successErrorSchool',
                        // surl: 'http://mumbaischool.sfanow.in/2017/api/payU/successErrorSchool',
                        // furl: 'http://mumbaischool.sfanow.in/2017/api/payU/successErrorSchool',
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
                        // surl: 'http://wohlig.io:1337/api/payU/successErrorSchool',
                        // furl: 'http://wohlig.io:1337/api/payU/successErrorSchool',
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
        async.waterfall([
            function (callback) {
                var txnid = generator.generate({
                    length: 8,
                    numbers: true
                });
                var matchObj = {
                    $set: {
                        txnid: txnid,
                    }
                };
                Athelete.update({
                    _id: found._id
                }, matchObj).exec(
                    function (err, data3) {
                        if (err) {
                            callback(err, null);
                        } else {
                            found.txnid = txnid;
                            callback(null, found);
                        }
                    });
            },
            function (found, callback) {
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
                        var amount = found.accounts.totalPaid;
                        var firstname = found.firstName;
                        var txnid = found.txnid;
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
                                // surl: 'https://mumbaischool.sfanow.in/api/payU/successErrorAthelete',
                                // furl: 'https://mumbaischool.sfanow.in/api/payU/successErrorAthelete',
                                // surl: 'http://mumbaischool.sfanow.in/2017/api/payU/successErrorAthelete',
                                // furl: 'http://mumbaischool.sfanow.in/2017/api/payU/successErrorAthelete',
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
                                // surl: 'http://testmumbai2015.sfanow.in/api/payU/successErrorAthelete',
                                // furl: 'http://testmumbai2015.sfanow.in/api/payU/successErrorAthelete',
                                // surl: 'http://testmumbai2016.sfanow.in/api/payU/successErrorAthelete',
                                // furl: 'http://testmumbai2016.sfanow.in/api/payU/successErrorAthelete',
                                // surl: 'http://testmumbaischool.sfanow.in/api/payU/successErrorAthelete',
                                // furl: 'http://testmumbaischool.sfanow.in/api/payU/successErrorAthelete',
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
                                surl: 'http://wohlig.io:1337/api/payU/successErrorAthelete',
                                furl: 'http://wohlig.io:1337/api/payU/successErrorAthelete',
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
            }
        ], function (err, complete) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, complete);
            }
        })

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
                surl: 'https://mumbaischool.sfanow.in/api/payU/successError',
                furl: 'https://mumbaischool.sfanow.in/api/payU/successError',
                // surl: 'http://mumbaischool.sfanow.in/2017/api/payU/successError',
                // furl: 'http://mumbaischool.sfanow.in/2017/api/payU/successError',
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
                // surl: 'http://testmumbai2015.sfanow.in/api/payU/successError',
                // furl: 'http://testmumbai2015.sfanow.in/api/payU/successError',
                // surl: 'http://testmumbai2016.sfanow.in/api/payU/successError',
                // furl: 'http://testmumbai2016.sfanow.in/api/payU/successError',
                // surl: 'http://testmumbaischool.sfanow.in/api/payU/successError',
                // furl: 'http://testmumbaischool.sfanow.in/api/payU/successError',
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
    verification: function (data, callback) {
        var payukey = "gtKFFx";
        var payusalt = "eCwWELxi";
        var payuurl = "https://test.payu.in/merchant/postservice.php?form=2";
        var command = "verify_payment";
        var var1 = data.txnid;
        var hash = sha512(payukey + "|" + command + "|" + var1 + "|" + payusalt);
        var hashtext = hash.toString('hex');
        request.post({
            url: payuurl,
            form: {
                key: payukey,
                var1: var1,
                command: command,
                hash: hashtext,
            }
        }, function (err, httpResponse, body) {
            if (err) {
                callback(err, null);
            } else {
                var final = {};
                final.body = body;
                final.txnid = data.txnid;
                callback(null, final);
            }
        });
    },

    cronAthletePayment: function (data, callback) {
        Athelete.find({
            txnid: {
                $exists: true
            },
            regitrationFee: "online PAYU",
            paymentStatus: "Pending"
        }).lean().exec(function (err, athlete) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(athlete)) {
                callback(null, []);
            } else {
                async.eachSeries(athlete, function (n, callback) {
                    var now = moment(new Date()); //todays date
                    var end = moment(n.createdAt); // another date
                    var duration = moment.duration(now.diff(end));
                    var dump = duration.hours();
                    var hours = duration.asHours();
                    console.log("hours", hours);
                    if (hours <= 48) {
                        async.waterfall([
                            function (callback) {
                                PayU.verification(n, function (err, verficationData) {
                                    if (err) {
                                        res.json({
                                            value: false,
                                            data: "Invalid Request"
                                        });
                                    } else {
                                        callback(null, verficationData);
                                    }
                                });
                            },
                            function (verficationData, callback) {
                                if (verficationData.status === 1) {
                                    var param = {};
                                    param.firstName = n.firstName;
                                    param.surname = n.surname;
                                    param.email = n.email;
                                    param.transactionid = verficationData.transaction_details.mihpayid;
                                    Athelete.updatePaymentStatus(param, function (err, data) {
                                        if (err) {
                                            console.log('amount not match issue');
                                            res.json({
                                                value: false,
                                                data: "Invalid Request"
                                            });
                                        } else {
                                            callback(null, "updated payment");
                                        }
                                    });
                                } else {
                                    callback(null, "not found httpResponse");
                                }
                            }
                        ], function (err, complete) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, complete);
                            }
                        });
                    } else if (hours > 48 && athlete.regitrationFee == "online PAYU" && paymentStatus == "pending") {
                        Athelete.remove({
                            $or: [{
                                firstName: athlete.firstName
                            }, {
                                surname: athlete.surname
                            }, {
                                email: athlete.email
                            }, {
                                _id: athlete._id
                            }]
                        }).exec(function (err, data) {
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(data)) {
                                callback(null, "Data is empty");
                            } else {
                                callback(null, athlete);
                            }
                        });
                    } else {
                        callback(null, athlete);
                    }
                }, function (err) {
                    callback(null, athlete);
                });

            }
        });

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
                        surl: 'https://mumbaischool.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        furl: 'https://mumbaischool.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // surl: 'http://mumbaischool.sfanow.in/2017/api/payU/successUpgradeErrorAthelete',
                        // furl: 'http://mumbaischool.sfanow.in/2017/api/payU/successUpgradeErrorAthelete',
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
                        // surl: 'http://testmumbai2015.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // furl: 'http://testmumbai2015.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // surl: 'http://testmumbai2016.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // furl: 'http://testmumbai2016.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // surl: 'http://testmumbaischool.sfanow.in/api/payU/successUpgradeErrorAthelete',
                        // furl: 'http://testmumbaischool.sfanow.in/api/payU/successUpgradeErrorAthelete',
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
                        surl: 'https://mumbaischool.sfanow.in/api/payU/successUpgradeErrorSchool',
                        furl: 'https://mumbaischool.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // surl: 'http://mumbaischool.sfanow.in/2017/api/payU/successUpgradeErrorSchool',
                        // furl: 'http://mumbaischool.sfanow.in/2017/api/payU/successUpgradeErrorSchool',
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
                        // surl: 'http://testmumbai2015.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // furl: 'http://testmumbai2015.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // surl: 'http://testmumbai2016.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // furl: 'http://testmumbai2016.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // surl: 'http://testmumbaischool.sfanow.in/api/payU/successUpgradeErrorSchool',
                        // furl: 'http://testmumbaischool.sfanow.in/api/payU/successUpgradeErrorSchool',
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