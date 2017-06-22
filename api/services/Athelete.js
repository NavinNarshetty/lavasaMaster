var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var uniqueValidator = require('mongoose-unique-validator');
var timestamps = require('mongoose-timestamp');
var validators = require('mongoose-validators');
var monguurl = require('monguurl');
var autoIncrement = require('mongoose-auto-increment');
var objectid = require("mongodb").ObjectID;
var moment = require('moment');
var request = require("request");
var generator = require('generate-password');
// autoIncrement.initialize(mongoose);
var schema = new Schema({

    atheleteID: {
        type: Number
    },
    sfaId: String,
    status: {
        type: String,
        default: "Pending"
    },
    school: {
        type: Schema.Types.ObjectId,
        ref: 'School',
        index: true
    },

    year: String,
    idProof: String,
    surname: String,
    password: String,
    firstName: String,
    middleName: String,
    gender: String,
    standard: String,
    bloodGroup: String,
    photograph: String,
    dob: Date,
    age: Number,
    ageProof: String,
    photoImage: String,
    birthImage: String,
    playedTournaments: {
        type: Boolean,
        default: "false"
    },
    sportLevel: [{
        level: String,
        sport: String,
    }],


    mobile: String,
    smsOTP: String,
    email: String,
    emailOTP: String,

    address: String,
    addressLine2: String,
    state: String,
    district: String,
    city: String,
    pinCode: String,

    termsAndCondition: {
        type: Boolean,
        default: "false"
    },
    parentDetails: [{
        relation: String,
        name: String,
        surname: String,
        mobile: String,
        email: String
    }],
    atheleteSchoolName: String,
    atheleteSchoolLocality: String,
    atheleteSchoolContact: String,
    atheleteSchoolIdImage: String,
    registrationFee: String,
    paymentStatus: {
        type: String,
        default: "Pending"
    },
    verifyCount: {
        type: Number,
        default: 0,
    },
    transactionID: {
        type: String,
    },
    verifiedDate: Date,
    remarks: String,
    accessToken: String,
    isSelected: Boolean,

});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
// schema.plugin(autoIncrement.plugin, {
//     model: 'Athelete',
//     field: 'atheleteID',
//     startAt: 1,
//     incrementBy: 1
// });
schema.plugin(timestamps);
module.exports = mongoose.model('Athelete', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {


    search: function (data, callback) {
        var matchObj = {
            $or: [{
                registrationFee: {
                    $ne: "online PAYU"
                }
            }, {
                paymentStatus: {
                    $ne: "Pending"
                }
            }]
        }
        var Model = this;
        var Const = this(data);
        var maxRow = Config.maxRow;

        var page = 1;
        if (data.page) {
            page = data.page;
        }
        var field = data.field;
        var options = {
            field: data.field,
            filters: {
                keyword: {
                    fields: ['name'],
                    term: data.keyword
                }
            },
            sort: {
                desc: 'createdAt'
            },
            start: (page - 1) * maxRow,
            count: maxRow
        };
        var Search = Model.find(matchObj)

            .order(options)
            // .deepPopulate(deepSearch)
            .keyword(options)
            .page(options, callback);

    },

    filterAthlete: function (data, callback) {
        console.log("date", data.startDate);
        var maxRow = Config.maxRow;

        var page = 1;
        if (data.page) {
            page = data.page;
        }
        var field = data.field;
        var options = {
            field: data.field,
            filters: {
                keyword: {
                    fields: ['firstName', 'sfaId'],
                    term: data.keyword
                }
            },
            sort: {
                asc: 'createdAt'
            },
            start: (page - 1) * maxRow,
            count: maxRow
        };
        var matchObj = {};
        if (data.type == "Date") {
            var endOfDay = moment(data.endDate).endOf("day").toDate();
            // if (data.endDate == data.startDate) {

            //    
            //     // var day = moment(data.startDate).format('YYYY-MM-DD');
            //     console.log("start", data.startDate, "end", endOfDay);
            //     matchObj = {
            //         createdAt: {
            //             $regex: day,
            //             $options: "i"
            //         },
            //         $or: [{
            //             registrationFee: {
            //                 $ne: "online PAYU"
            //             }
            //         }, {
            //             paymentStatus: {
            //                 $ne: "Pending"
            //             }
            //         }]
            //     }
            // } else {
            matchObj = {
                createdAt: {
                    $gt: data.startDate,
                    $lt: endOfDay,
                },
                $or: [{
                    registrationFee: {
                        $ne: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $ne: "Pending"
                    }
                }]
            }

        } else if (data.type == "SFA-ID") {
            matchObj = {
                sfaId: {
                    $regex: data.input,
                    $options: "i"
                },
                $or: [{
                    registrationFee: {
                        $ne: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $ne: "Pending"
                    }
                }]
            }
        } else if (data.type == "Athlete Name") {
            matchObj = {
                // $or: [{
                //     firstName: {
                //         $regex: data.input,
                //         $options: "i"
                //     }
                // }, {
                //     surname: {
                //         $regex: data.input,
                //         $options: "i"
                //     }
                // }, {
                //     middleName: {
                //         $regex: data.input,
                //         $options: "i"
                //     }
                // }],
                firstName: {
                    $regex: data.input,
                    $options: "i"

                },
                $or: [{
                    registrationFee: {
                        $ne: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $ne: "Pending"
                    }
                }]

            }
        } else if (data.type == "Payment Mode") {
            if (data.input == "cash" || data.input == "Cash") {
                matchObj = {
                    'registrationFee': "cash",
                }
            } else if (data.input == "online" || data.input == "Online") {
                matchObj = {
                    'registrationFee': "online PAYU",
                    paymentStatus: {
                        $ne: "Pending"
                    }
                }

            } else {
                var matchObj = {
                    $or: [{
                        registrationFee: {
                            $ne: "online PAYU"
                        }
                    }, {
                        paymentStatus: {
                            $ne: "Pending"
                        }
                    }],
                }

            }

        } else if (data.type == "Payment Status") {

            if (data.input == "Paid" || data.input == "paid") {
                matchObj = {
                    'paymentStatus': "Paid",
                }
            } else if (data.input == "Pending" || data.input == "pending") {
                matchObj = {
                    'paymentStatus': "Pending",
                    registrationFee: {
                        $ne: "online PAYU"
                    }
                }
            } else {
                var matchObj = {
                    $or: [{
                        registrationFee: {
                            $ne: "online PAYU"
                        }
                    }, {
                        paymentStatus: {
                            $ne: "Pending"
                        }
                    }],

                }
            }
        } else if (data.type == "Verified Status") {
            matchObj = {
                'status': {
                    $regex: data.input,
                    $options: "i"
                },
                $or: [{
                    registrationFee: {
                        $ne: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $ne: "Pending"
                    }
                }]

            }
        } else {
            var matchObj = {
                $or: [{
                    registrationFee: {
                        $ne: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $ne: "Pending"
                    }
                }],

            }
        }
        if (data.type == "School Name") {
            Athelete.aggregate(
                [{
                        $lookup: {
                            "from": "schools",
                            "localField": "school",
                            "foreignField": "_id",
                            "as": "schoolData"
                        }
                    },
                    // Stage 2
                    {
                        $unwind: {
                            path: "$schoolData",
                            preserveNullAndEmptyArrays: true // optional
                        }
                    },
                    // Stage 3
                    {
                        $match: {

                            $or: [{
                                    "schoolData.name": {
                                        $regex: data.input
                                    }
                                },
                                {
                                    "atheleteSchoolName": {
                                        $regex: data.input
                                    }
                                }
                            ]

                        }
                    },
                    // Stage 4
                    {
                        $match: {
                            $or: [{
                                registrationFee: {
                                    $ne: "online PAYU"
                                }
                            }, {
                                paymentStatus: {
                                    $ne: "Pending"
                                }
                            }]
                        }
                    },
                    {
                        $sort: {
                            "createdAt": -1

                        }
                    },
                ],
                function (err, returnReq) {
                    console.log("returnReq : ", returnReq);
                    if (err) {
                        console.log(err);
                        callback(null, err);
                    } else {
                        if (_.isEmpty(returnReq)) {
                            var count = returnReq.length;
                            console.log("count", count);

                            var data = {};
                            data.options = options;

                            data.results = returnReq;
                            data.total = count;
                            callback(null, data);
                        } else {
                            var count = returnReq.length;
                            console.log("count", count);

                            var data = {};
                            data.options = options;

                            data.results = returnReq;
                            data.total = count;
                            callback(null, data);

                        }
                    }
                });
        } else if (data.keyword != "") {
            Athelete.aggregate(
                [{
                        $match: {

                            $or: [{
                                    "firstName": {
                                        $regex: data.keyword,
                                        $options: "i"
                                    }
                                },
                                {
                                    "sfaId": data.keyword
                                }
                            ]
                        }
                    },
                    // Stage 4
                    {
                        $match: {
                            $or: [{
                                registrationFee: {
                                    $ne: "online PAYU"
                                }
                            }, {
                                paymentStatus: {
                                    $ne: "Pending"
                                }
                            }]
                        }
                    },
                    {
                        $sort: {
                            "createdAt": -1

                        }
                    },
                ],
                function (err, returnReq) {
                    console.log("returnReq : ", returnReq);
                    if (err) {
                        console.log(err);
                        callback(null, err);
                    } else {
                        if (_.isEmpty(returnReq)) {
                            var count = returnReq.length;
                            console.log("count", count);

                            var data = {};
                            data.options = options;

                            data.results = returnReq;
                            data.total = count;
                            callback(null, data);
                        } else {
                            var count = returnReq.length;
                            console.log("count", count);

                            var data = {};
                            data.options = options;

                            data.results = returnReq;
                            data.total = count;
                            callback(null, data);

                        }
                    }
                });
        } else {

            Athelete.find(matchObj)
                .sort({
                    createdAt: -1
                })
                .order(options)
                .keyword(options)
                .page(options, function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(found)) {
                        callback(null, "Data is empty");
                    } else {
                        callback(null, found);
                    }
                });

        }
    },
    //on athelete save or submit press 
    saveAthelete: function (data, callback) {
        if (_.isEmpty(data.school)) {
            data.school = undefined;
        }
        Athelete.aggregate([{
                $match: {
                    $and: [{
                            firstName: data.firstName
                        }, {
                            surname: data.surname
                        },
                        {
                            $or: [{
                                email: data.email
                            }]
                        },
                    ]
                }
            }],
            function (err, found) {
                console.log("found athelete", found);
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else if (found) {
                    // data.order.bills = null;
                    if (_.isEmpty(found)) {
                        // console.log("data", data);
                        data.year = new Date().getFullYear();
                        data.verifyCount = 0;
                        data.atheleteID = 0;
                        Athelete.saveData(data, function (err, athleteData) {
                            if (err) {
                                console.log("err", err);
                                callback("There was an error while saving", null);
                            } else {
                                if (_.isEmpty(athleteData)) {
                                    callback("No order data found", null);
                                } else {
                                    async.parallel([
                                            function (callback) {
                                                console.log("inside school save")
                                                if (data.atheleteSchoolName) {
                                                    var schoolData = {};
                                                    schoolData.schoolName = data.atheleteSchoolName;
                                                    schoolData.locality = data.atheleteSchoolLocality;
                                                    schoolData.schoolLogo = data.atheleteSchoolIdImage;
                                                    schoolData.landline = data.atheleteSchoolContact;
                                                    console.log("need to save");

                                                    Registration.saveData(schoolData, function (err, registerData) {
                                                        console.log("registerData", registerData);
                                                        if (err) {
                                                            console.log("err", err);
                                                            callback("There was an error while saving school", null);
                                                        } else {
                                                            if (_.isEmpty(registerData)) {
                                                                callback("No register data found", null);
                                                            } else {
                                                                callback(null, athleteData);
                                                            }
                                                        }
                                                    });
                                                } else {
                                                    callback(null, athleteData);
                                                }
                                            },
                                            function (callback) {
                                                console.log("inside payment check");
                                                if (athleteData.registrationFee == "cash") {
                                                    Athelete.atheletePaymentMail(athleteData, function (err, vData) {
                                                        if (err) {
                                                            callback(err, null);
                                                        } else if (vData) {
                                                            callback(null, vData);
                                                        }
                                                    });
                                                } else {
                                                    callback(null, athleteData);
                                                }
                                            }
                                        ],
                                        function (err, data2) {
                                            if (err) {
                                                console.log(err);
                                                callback(null, []);
                                            } else if (data2) {
                                                if (_.isEmpty(data2)) {
                                                    callback(null, []);
                                                } else {
                                                    callback(null, data2);
                                                }
                                            }
                                        });
                                }
                            }
                        });

                    } else {
                        if (found[0].registrationFee == 'online PAYU' && found[0].paymentStatus == 'Pending') {
                            Athelete.remove({ //finds one with refrence to id
                                _id: found[0]._id
                            }).exec(function (err, removed) {
                                if (removed) {
                                    console.log("data removed");
                                    Athelete.saveData(data, function (err, athleteData) {
                                        if (err) {
                                            console.log("err", err);
                                            callback("There was an error while saving order", null);
                                        } else {
                                            if (_.isEmpty(athleteData)) {
                                                callback("No order data found", null);
                                            } else {
                                                console.log("data removed and moved to save again");
                                                async.parallel([
                                                        function (callback) {
                                                            console.log("inside school save")
                                                            if (data.atheleteSchoolName) {
                                                                var schoolData = {};
                                                                schoolData.schoolName = data.atheleteSchoolName;
                                                                schoolData.locality = data.atheleteSchoolLocality;
                                                                schoolData.schoolLogo = data.atheleteSchoolIdImage;
                                                                schoolData.landline = data.atheleteSchoolContact;
                                                                console.log("need to save");

                                                                Registration.saveData(schoolData, function (err, registerData) {
                                                                    console.log("registerData", registerData);
                                                                    if (err) {
                                                                        console.log("err", err);
                                                                        callback("There was an error while saving data", null);
                                                                    } else {
                                                                        if (_.isEmpty(registerData)) {
                                                                            callback("No register data found", null);
                                                                        } else {
                                                                            callback(null, athleteData);
                                                                        }
                                                                    }
                                                                });
                                                            } else {
                                                                callback(null, athleteData);
                                                            }
                                                        },
                                                        function (callback) {
                                                            console.log("inside payment check");
                                                            if (athleteData.registrationFee == "cash") {
                                                                Athelete.atheletePaymentMail(athleteData, function (err, vData) {
                                                                    if (err) {
                                                                        callback(err, null);
                                                                    } else if (vData) {
                                                                        callback(null, vData);
                                                                    }
                                                                });
                                                            } else {
                                                                callback(null, athleteData);
                                                            }
                                                        }
                                                    ],
                                                    function (err, data2) {
                                                        if (err) {
                                                            console.log(err);
                                                            callback(null, []);
                                                        } else if (data2) {
                                                            if (_.isEmpty(data2)) {
                                                                callback(null, []);
                                                            } else {
                                                                callback(null, data2);
                                                            }
                                                        }
                                                    });
                                            }
                                        }
                                    });
                                }

                            });
                        } else {
                            callback("Athlete Already Exist", null);
                        }

                    }


                } else {
                    callback("Invalid data", null);
                }
            });

    },
    //genarate sfa when status changes to verified and sfaid is blank
    generateAtheleteSfaID: function (data, callback) {
        //find and first time atheleteID idea is for string id generation if required
        Athelete.findOne({
            _id: data._id
        }).sort({
            createdAt: -1
        }).exec(function (err, found) {
            console.log("found", found);
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                if (_.isEmpty(found)) {
                    console.log("isempty");
                    callback("No order data found", null);
                } else {
                    if (found.atheleteSchoolName) {
                        data.school = undefined;
                    }
                    if (found.verifyCount == 0) {

                        if (data.status == "Verified") {
                            data.verifyCount = 1;
                            data.password = generator.generate({
                                length: 8,
                                numbers: true
                            });
                            if (_.isEmpty(data.sfaId)) {
                                var year = new Date().getFullYear().toString().substr(2, 2);
                                if (_.isEmpty(found.city)) {
                                    found.city = "Mumbai"
                                }
                                var city = found.city;
                                var prefixCity = city.charAt(0);
                                console.log("prefixCity", prefixCity);
                                Athelete.find({
                                    "status": 'Verified'
                                }).sort({
                                    atheleteID: -1
                                }).limit(1).lean().exec(
                                    function (err, datafound) {
                                        console.log("found1***", datafound);
                                        if (err) {
                                            console.log(err);
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(datafound)) {
                                                data.atheleteID = 1;
                                                console.log("atheleteID", data.atheleteID);
                                                data.sfaId = "M" + "A" + year + data.atheleteID;
                                            } else {
                                                console.log("found", datafound[0].sfaId);
                                                // if (datafound[0].atheleteID == undefined) {
                                                //     datafound[0].atheleteID = 0;
                                                // }
                                                data.atheleteID = ++datafound[0].atheleteID;
                                                console.log("atheleteID", data.atheleteID);
                                                data.sfaId = "M" + "A" + year + data.atheleteID;
                                            }
                                            data.verifiedDate = new Date();

                                            Athelete.saveVerify(data, found, function (err, vData) {
                                                if (err) {
                                                    callback(err, null);
                                                } else if (vData) {
                                                    callback(null, vData);
                                                }
                                            });
                                        }
                                    });
                                // data.sfaId = sfa;

                            } else {
                                Athelete.saveVerify(data, found, function (err, vData) {
                                    if (err) {
                                        callback(err, null);
                                    } else if (vData) {
                                        callback(null, vData);
                                    }
                                });
                            }

                        } else {
                            Athelete.saveVerify(data, found, function (err, vData) {
                                if (err) {
                                    callback(err, null);
                                } else if (vData) {
                                    callback(null, vData);
                                }
                            });

                        }
                    } else {
                        Athelete.saveVerify(data, found, function (err, vData) {
                            if (err) {
                                callback(err, null);
                            } else if (vData) {
                                callback(null, vData);
                            }
                        });

                    }
                }
            }
        });
    },
    saveVerify: function (data, found, callback) {
        Athelete.saveData(data, function (err, athleteData) { //saves data to database collection
            console.log("athleteData", athleteData);
            if (err) {
                console.log("err", err);
                callback("There was an error while saving order", null);
            } else {
                if (_.isEmpty(athleteData)) {
                    callback("No order data found", null);
                } else {
                    if (found.verifyCount == 0) {
                        if (data.status == "Verified") {
                            Athelete.successVerifiedMailSms(data, function (err, vData) {
                                if (err) {
                                    callback(err, null);
                                } else if (vData) {
                                    callback(null, vData);
                                }
                            });
                        } else if (data.status == "Rejected") {
                            Athelete.failureVerifiedMailSms(data, function (err, vData) {
                                if (err) {
                                    callback(err, null);
                                } else if (vData) {
                                    callback(null, vData);
                                }
                            });
                        } else {
                            callback(null, athleteData);
                        }
                    } else {
                        callback(null, "Updated Successfully");
                    }
                }
            }
        });
    },
    getAllAtheleteDetails: function (data, callback) {
        Athelete.find().exec(function (err, found) { //finds all athelete
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, "Data is empty");
            } else {
                callback(null, found);
            }
        });

    },

    getOneAtheleteDetails: function (data, callback) {
        Athelete.findOne({ //finds one with refrence to id
            _id: data._id
        }).exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, "Data is empty");
            } else {
                callback(null, found);
            }

        });
    },

    updatePaymentStatus: function (data, callback) {
        console.log("inside update", data);
        var matchObj = {
            $set: {
                paymentStatus: "Paid",
                transactionID: data.transactionid
            }
        }

        Athelete.findOne({ //finds one with refrence to id
            firstName: data.firstName,
            surname: data.surname,
            email: data.email,
        }).lean().exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                console.log("empty in Athelete found");
                callback(null, "Data is empty");
            } else {
                console.log("found in update", found);
                Athelete.update({
                    _id: found._id
                }, matchObj).exec(
                    function (err, data3) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else if (data3) {
                            async.parallel([
                                    function (callback) {
                                        Athelete.atheletePaymentMail(found, function (err, vData) {
                                            if (err) {
                                                callback(err, null);
                                            } else if (vData) {
                                                callback(null, vData);
                                            }
                                        });
                                    },
                                    function (callback) {
                                        Athelete.receiptMail(found, function (err, mailsms) {
                                            if (err) {
                                                callback(err, null);
                                            } else {
                                                if (_.isEmpty(mailsms)) {
                                                    callback(null, "Data not found");
                                                } else {
                                                    callback(null, mailsms);
                                                }
                                            }

                                        });
                                    }
                                ],
                                function (err, data2) {
                                    if (err) {
                                        console.log(err);
                                        callback(null, []);
                                    } else if (data2) {
                                        if (_.isEmpty(data2)) {
                                            callback(null, []);
                                        } else {
                                            callback(null, data2);
                                        }
                                    }
                                });
                        }

                    });
            }
        });
    },

    receiptMail: function (data, callback) {
        Athelete.findOne({ //finds one with refrence to id
            _id: data._id
        }).exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, "Data is empty");
            } else {
                var emailData = {};
                if (found.sfaId) {
                    emailData.sfaId = found.sfaId;
                } else {
                    emailData.sfaId = "";
                }
                emailData.firstName = found.firstName;
                emailData.surname = found.surname;
                emailData.transactionID = found.transactionID;
                emailData.Date = moment().format("DD-MM-YYYY");
                emailData.receiptNo = "SFA" + found.atheleteID;
                emailData.from = "info@sfanow.in";
                emailData.email = found.email;
                // emailData.sfaID = data.sfaID;
                // emailData.password = data.password;
                emailData.filename = "receiptAthelete.ejs";
                emailData.subject = "SFA: Your Payment Receipt as an Athlete for SFA Mumbai 2017";
                console.log("emaildata", emailData);

                Config.email(emailData, function (err, emailRespo) {
                    if (err) {
                        console.log(err);
                        callback(null, err);
                    } else if (emailRespo) {
                        callback(null, emailRespo);
                    } else {
                        callback(null, "Invalid data");
                    }
                });
            }
        });
    },

    generateMobileOTP: function (data, callback) {

        var mobileOtp = (Math.random() + "").substring(2, 6);
        var smsData = {};
        console.log("mobileOtp", mobileOtp);
        smsData.mobile = data.mobile;
        smsData.content = "OTP Athlete: Your Mobile OTP (One time Password) for SFA registration is " + mobileOtp;
        console.log("smsdata", smsData);
        Config.sendSms(smsData, function (err, smsRespo) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else if (smsRespo) {
                console.log(smsRespo, "sms sent");
                callback(null, mobileOtp);
            } else {
                callback(null, "Invalid data");
            }
        });
    },

    generateEmailOTP: function (data, callback) {
        console.log("email otp");

        var emailOtp = (Math.random() + "").substring(2, 6);
        var emailData = {};
        emailData.from = "info@sfanow.in";
        emailData.email = data.email;
        emailData.otp = emailOtp;
        emailData.filename = "emailOtp.ejs";
        emailData.subject = "SFA: Your Email OTP (One time Password) for SFA registration is";
        console.log("emaildata", emailData);

        Config.email(emailData, function (err, emailRespo) {
            if (err) {
                console.log(err);
                callback(null, err);
            } else if (emailRespo) {
                callback(null, emailOtp);
            } else {
                callback(null, "Invalid data");
            }
        });
    },

    atheletePaymentMail: function (data, callback) {
        console.log("getting inside", data);
        if (data.atheleteSchoolName) {
            if (data.registrationFee == "cash") {
                console.log("cash or cheque payment mail");
                Athelete.unregistedCashPaymentMailSms(data, function (err, vData) {
                    if (err) {
                        callback(err, null);
                    } else if (vData) {
                        callback(null, vData);
                    }
                });
            } else if (data.registrationFee == "online PAYU") {
                console.log("online payment mail");
                Athelete.unregistedOnlinePaymentMailSms(data, function (err, vData) {
                    if (err) {
                        callback(err, null);
                    } else if (vData) {
                        callback(null, vData);
                    }
                });
            }
        } else {
            School.findOne({ //finds one with refrence to id
                _id: data.school
            }).exec(function (err, found) {
                // console.log("found", found);
                if (err) {
                    callback(err, null);
                } else if (_.isEmpty(found)) {
                    callback(null, "Data is empty");
                } else {
                    console.log("school", found.name);
                    Registration.findOne({ //finds one with refrence to id
                        schoolName: found.name
                    }).exec(function (err, school) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(school)) {
                            if (data.registrationFee == "cash") {
                                console.log("cash or cheque payment mail");
                                Athelete.unregistedCashPaymentMailSms(data, function (err, vData) {
                                    if (err) {
                                        callback(err, null);
                                    } else if (vData) {
                                        callback(null, vData);
                                    }
                                });
                            } else if (data.registrationFee == "online PAYU") {
                                console.log("online payment mail");
                                Athelete.unregistedOnlinePaymentMailSms(data, function (err, vData) {
                                    if (err) {
                                        callback(err, null);
                                    } else if (vData) {
                                        callback(null, vData);
                                    }
                                });
                            }
                        } else {
                            var val = school.createdAt;
                            console.log("data of register school", val);
                            var year = new Date(val).getFullYear().toString().substr(2, 2);
                            console.log("year", year);
                            if (school.status == "Verified" && year == '17') {
                                console.log("inside verified");
                                if (data.registrationFee == "cash") {
                                    console.log("cash or cheque payment mail");
                                    Athelete.registeredCashPaymentMailSms(data, function (err, vData) {
                                        if (err) {
                                            callback(err, null);
                                        } else if (vData) {
                                            callback(null, vData);
                                        }
                                    });
                                } else if (data.registrationFee == "online PAYU") {
                                    console.log("online payment mail");
                                    Athelete.registeredOnlinePaymentMailSms(data, function (err, vData) {
                                        if (err) {
                                            callback(err, null);
                                        } else if (vData) {
                                            callback(null, vData);
                                        }
                                    });
                                }

                            }
                        }
                    });

                }

            });
        }

    },

    registeredOnlinePaymentMailSms: function (data, callback) {


        async.parallel([
                function (callback) {
                    var emailOtp = (Math.random() + "").substring(2, 6);

                    var emailData = {};
                    emailData.from = "info@sfanow.in";
                    emailData.email = data.email;
                    emailData.filename = "atheleteOnlinePayment.ejs";
                    emailData.subject = "SFA: Thank you for registering for SFA Mumbai 2017";
                    console.log("emaildata", emailData);

                    Config.email(emailData, function (err, emailRespo) {
                        if (err) {
                            console.log(err);
                            callback(null, err);
                        } else if (emailRespo) {
                            callback(null, emailRespo);
                        } else {
                            callback(null, "Invalid data");
                        }
                    });
                },
                function (callback) {

                    var smsData = {};
                    smsData.mobile = data.mobile;
                    smsData.content = "Thank you for registering for SFA Mumbai 2017. For further details please check your registered email ID.";
                    console.log("smsdata", smsData);
                    Config.sendSms(smsData, function (err, smsRespo) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else if (smsRespo) {
                            console.log(smsRespo, "sms sent");
                            callback(null, smsRespo);
                        } else {
                            callback(null, "Invalid data");
                        }
                    });
                }
            ],
            function (err, final) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, final);
                }

            });
    },

    registeredCashPaymentMailSms: function (data, callback) {
        async.parallel([
                function (callback) {

                    var emailData = {};
                    emailData.from = "info@sfanow.in";
                    emailData.email = data.email;
                    emailData.filename = "atheleteCashPayment.ejs";
                    emailData.subject = "SFA: Thank you for registering for SFA Mumbai 2017";
                    console.log("emaildata", emailData);

                    Config.email(emailData, function (err, emailRespo) {
                        if (err) {
                            console.log(err);
                            callback(null, err);
                        } else if (emailRespo) {
                            callback(null, emailRespo);
                        } else {
                            callback(null, "Invalid data");
                        }
                    });
                },
                function (callback) {

                    var smsData = {};

                    smsData.mobile = data.mobile;

                    smsData.content = "Thank you for registering for SFA Mumbai 2017. For further details please check your registered email ID.";
                    console.log("smsdata", smsData);
                    Config.sendSms(smsData, function (err, smsRespo) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else if (smsRespo) {
                            console.log(smsRespo, "sms sent");
                            callback(null, smsRespo);
                        } else {
                            callback(null, "Invalid data");
                        }
                    });
                }
            ],
            function (err, final) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, final);
                }

            });
    },

    successVerifiedMailSms: function (data, callback) {
        async.parallel([
                function (callback) {
                    var emailData = {};
                    emailData.from = "info@sfanow.in";
                    emailData.email = data.email;
                    emailData.sfaID = data.sfaId;
                    emailData.password = data.password;
                    emailData.filename = "registeredVerification.ejs";
                    emailData.subject = "SFA: You are now a verified Athlete for SFA Mumbai 2017";
                    console.log("emaildata", emailData);

                    Config.email(emailData, function (err, emailRespo) {
                        if (err) {
                            console.log(err);
                            callback(null, err);
                        } else if (emailRespo) {
                            callback(null, emailRespo);
                        } else {
                            callback(null, "Invalid data");
                        }
                    });
                },
                function (callback) {

                    var smsData = {};
                    smsData.mobile = data.mobile;

                    smsData.content = "Congratulations! You are now a verified SFA Athlete. Kindly check your registered Email ID for your SFA ID and Password.";
                    console.log("smsdata", smsData);
                    // callback(null, smsData);
                    Config.sendSms(smsData, function (err, smsRespo) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else if (smsRespo) {
                            console.log(smsRespo, "sms sent");
                            callback(null, smsRespo);
                        } else {
                            callback(null, "Invalid data");
                        }
                    });
                }
            ],
            function (err, final) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, final);
                }

            });
    },

    failureVerifiedMailSms: function (data, callback) {
        async.parallel([
                function (callback) {
                    var emailData = {};
                    emailData.from = "info@sfanow.in";
                    emailData.email = data.email;
                    emailData.sfaID = data.sfaID;
                    emailData.password = data.password;
                    emailData.filename = "rejection.ejs";
                    emailData.subject = "SFA: Rejection of Your Application for SFA Mumbai 2017";
                    console.log("emaildata", emailData);

                    Config.email(emailData, function (err, emailRespo) {
                        if (err) {
                            console.log(err);
                            callback(null, err);
                        } else if (emailRespo) {
                            //callback(null, emailRespo);
                        } else {
                            //callback(null, "Invalid data");
                        }
                    });
                },
                function (callback) {

                    var smsData = {};
                    smsData.mobile = data.mobile;

                    smsData.content = "We regret to inform you that your application has been rejected for SFA Mumbai 2017. For further queries please email us at info@sfanow.in";
                    console.log("smsdata", smsData);
                    Config.sendSms(smsData, function (err, smsRespo) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else if (smsRespo) {
                            console.log(smsRespo, "sms sent");
                            callback(null, smsRespo);
                        } else {
                            callback(null, "Invalid data");
                        }
                    });
                }
            ],
            function (err, final) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, final);
                }

            });
    },

    unregistedOnlinePaymentMailSms: function (data, callback) {
        async.parallel([
                function (callback) {
                    var emailData = {};
                    emailData.from = "info@sfanow.in";
                    emailData.email = data.email;
                    // emailData.sfaID = data.sfaID;
                    // emailData.password = data.password;
                    emailData.filename = "unregisteredOnlinePayment.ejs";
                    emailData.subject = "SFA: Thank you for registering for SFA Mumbai 2017";
                    console.log("emaildata", emailData);

                    Config.email(emailData, function (err, emailRespo) {
                        if (err) {
                            console.log(err);
                            callback(null, err);
                        } else if (emailRespo) {
                            callback(null, emailRespo);
                        } else {
                            callback(null, "Invalid data");
                        }
                    });
                },
                function (callback) {

                    var smsData = {};
                    smsData.mobile = data.mobile;

                    smsData.content = "Thank you for registering for SFA Mumbai 2017. For further details please check your registered email ID.";
                    console.log("smsdata", smsData);
                    Config.sendSms(smsData, function (err, smsRespo) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else if (smsRespo) {
                            console.log(smsRespo, "sms sent");
                            callback(null, smsRespo);
                        } else {
                            callback(null, "Invalid data");
                        }
                    });
                }
            ],
            function (err, final) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, final);
                }

            });
    },

    unregistedCashPaymentMailSms: function (data, callback) {
        async.parallel([
                function (callback) {

                    var emailData = {};
                    emailData.from = "info@sfanow.in";
                    emailData.email = data.email;
                    emailData.filename = "unregistercashpayment.ejs";
                    emailData.subject = "SFA: Thank you for registering for SFA Mumbai 2017";
                    console.log("emaildata", emailData);
                    Config.email(emailData, function (err, emailRespo) {
                        if (err) {
                            console.log(err);
                            callback(null, err);
                        } else if (emailRespo) {
                            callback(null, emailRespo);
                        } else {
                            callback(null, "Invalid data");
                        }
                    });
                },
                function (callback) {

                    var smsData = {};
                    smsData.mobile = data.mobile;

                    smsData.content = "Thank you for registering for SFA Mumbai 2017. For further details please check your registered email ID.";
                    console.log("smsdata", smsData);
                    Config.sendSms(smsData, function (err, smsRespo) {
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else if (smsRespo) {
                            console.log(smsRespo, "sms sent");
                            callback(null, smsRespo);
                        } else {
                            callback(null, "Invalid data");
                        }
                    });
                }
            ],
            function (err, final) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, final);
                }

            });
    },

    excelFilterAthlete: function (data, callback) {
        // console.log('insied filter', data);
        var maxRow = Config.maxRow;

        var page = 1;
        if (data.page) {
            page = data.page;
        }
        var field = data.field;
        var options = {
            field: data.field,
            filters: {
                keyword: {
                    fields: ['firstName', 'sfaId'],
                    term: data.keyword
                }
            },
            sort: {
                asc: 'createdAt'
            },
            start: (page - 1) * maxRow,
            count: maxRow
        };
        var matchObj = {};
        if (data.type == "Date") {
            if (data.endDate == data.startDate) {
                matchObj = {
                    createdAt: data.startDate,
                    $or: [{
                        registrationFee: {
                            $ne: "online PAYU"
                        }
                    }, {
                        paymentStatus: {
                            $ne: "Pending"
                        }
                    }]
                }

            } else {
                matchObj = {
                    createdAt: {
                        $gt: data.startDate,
                        $lt: data.endDate,
                    },
                    $or: [{
                        registrationFee: {
                            $ne: "online PAYU"
                        }
                    }, {
                        paymentStatus: {
                            $ne: "Pending"
                        }
                    }]
                }
            }
        } else if (data.type == "SFA-ID") {
            matchObj = {
                sfaId: {
                    $regex: data.input,
                    $options: "i"
                },
                $or: [{
                    registrationFee: {
                        $ne: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $ne: "Pending"
                    }
                }]
            }
        } else if (data.type == "Athlete Name") {
            matchObj = {
                // $or: [{
                //     firstName: {
                //         $regex: data.input,
                //         $options: "i"
                //     }
                // }, {
                //     surname: {
                //         $regex: data.input,
                //         $options: "i"
                //     }
                // }, {
                //     middleName: {
                //         $regex: data.input,
                //         $options: "i"
                //     }
                // }],
                firstName: {
                    $regex: data.input,
                    $options: "i"

                },
                $or: [{
                    registrationFee: {
                        $ne: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $ne: "Pending"
                    }
                }]

            }
        } else if (data.type == "Payment Mode") {
            if (data.input == "cash" || data.input == "Cash") {
                matchObj = {
                    'registrationFee': "cash",
                }
            } else if (data.input == "online" || data.input == "Online") {
                matchObj = {
                    'registrationFee': "online PAYU",
                    paymentStatus: {
                        $ne: "Pending"
                    }
                }

            } else {
                var matchObj = {
                    $or: [{
                        registrationFee: {
                            $ne: "online PAYU"
                        }
                    }, {
                        paymentStatus: {
                            $ne: "Pending"
                        }
                    }],
                }

            }

        } else if (data.type == "Payment Status") {

            if (data.input == "Paid" || data.input == "paid") {
                matchObj = {
                    'paymentStatus': "Paid",
                }
            } else if (data.input == "Pending" || data.input == "pending") {
                matchObj = {
                    'paymentStatus': "Pending",
                    registrationFee: {
                        $ne: "online PAYU"
                    }
                }
            } else {
                var matchObj = {
                    $or: [{
                        registrationFee: {
                            $ne: "online PAYU"
                        }
                    }, {
                        paymentStatus: {
                            $ne: "Pending"
                        }
                    }],

                }
            }
        } else if (data.type == "Verified Status") {
            matchObj = {
                'status': {
                    $regex: data.input,
                    $options: "i"
                },
                $or: [{
                    registrationFee: {
                        $ne: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $ne: "Pending"
                    }
                }]

            }
        } else {
            var matchObj = {
                $or: [{
                    registrationFee: {
                        $ne: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $ne: "Pending"
                    }
                }],

            }
        }
        if (data.type == "School Name") {
            Athelete.aggregate(
                [{
                        $lookup: {
                            "from": "schools",
                            "localField": "school",
                            "foreignField": "_id",
                            "as": "schoolData"
                        }
                    },
                    // Stage 2
                    {
                        $unwind: {
                            path: "$schoolData",
                            preserveNullAndEmptyArrays: true // optional
                        }
                    },
                    // Stage 3
                    {
                        $match: {

                            $or: [{
                                    "schoolData.name": {
                                        $regex: data.input
                                    }
                                },
                                {
                                    "atheleteSchoolName": {
                                        $regex: data.input
                                    }
                                }
                            ]

                        }
                    },
                    // Stage 4
                    {
                        $match: {
                            $or: [{
                                registrationFee: {
                                    $ne: "online PAYU"
                                }
                            }, {
                                paymentStatus: {
                                    $ne: "Pending"
                                }
                            }]
                        }
                    },
                    {
                        $sort: {
                            "createdAt": -1

                        }
                    },
                ],
                function (err, returnReq) {
                    console.log("returnReq : ", returnReq);
                    if (err) {
                        console.log(err);
                        callback(null, err);
                    } else {
                        if (_.isEmpty(returnReq)) {
                            var count = returnReq.length;
                            console.log("count", count);

                            var data = {};
                            data.options = options;

                            data.results = returnReq;
                            data.total = count;
                            callback(null, returnReq);
                        } else {
                            var count = returnReq.length;
                            console.log("count", count);

                            var data = {};
                            data.options = options;

                            data.results = returnReq;
                            data.total = count;
                            callback(null, returnReq);

                        }
                    }
                });
        } else if (data.keyword != "" && data.type != "") {
            Athelete.aggregate(
                [{
                        $match: {

                            $or: [{
                                    "firstName": {
                                        $regex: data.keyword,
                                        $options: "i"
                                    }
                                },
                                {
                                    "sfaId": data.keyword
                                }
                            ]
                        }
                    },
                    // Stage 4
                    {
                        $match: {
                            $or: [{
                                registrationFee: {
                                    $ne: "online PAYU"
                                }
                            }, {
                                paymentStatus: {
                                    $ne: "Pending"
                                }
                            }]
                        }
                    },
                    {
                        $sort: {
                            "createdAt": -1

                        }
                    },
                ],
                function (err, returnReq) {
                    console.log("returnReq : ", returnReq);
                    if (err) {
                        console.log(err);
                        callback(null, err);
                    } else {
                        if (_.isEmpty(returnReq)) {
                            var count = returnReq.length;
                            console.log("count", count);

                            var data = {};
                            data.options = options;

                            data.results = returnReq;
                            data.total = count;
                            callback(null, returnReq);
                        } else {
                            var count = returnReq.length;
                            console.log("count", count);

                            // var data = {};
                            // data.options = options;

                            // data.results = returnReq;
                            // data.total = count;
                            callback(null, returnReq);

                        }
                    }
                });
        } else {

            Athelete.find(matchObj)
                .sort({
                    createdAt: -1
                }).exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(found)) {
                        callback(null, "Data is empty");
                    } else {
                        // console.log(found.length);
                        callback(null, found);
                    }
                });

        }
    },

    generateExcel: function (data, res) {
        // console.log('generate req', data.body);
        console.log('generate req data', data);
        // console.log('generate req data', data);
        async.waterfall([
                function (callback) {
                    Athelete.excelFilterAthlete(data, function (err, complete) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(complete)) {
                                callback(null, complete);
                            } else {
                                // console.log('logs', complete);
                                callback(null, complete)
                            }
                        }
                    });

                },
                function (complete, callback) {
                    console.log('logs for excel', complete.length);
                    var excelData = [];
                    var schoolData;
                    async.eachSeries(complete, function (n, callback) {
                        // console.log("each", n);
                        var obj = {};
                        obj.sfaID = n.sfaId;
                        async.waterfall([
                            function (callback) {
                                if (_.isEmpty(n.school)) {
                                    schoolData = n.atheleteSchoolName;
                                    callback(null, schoolData);
                                } else {
                                    School.findOne({
                                        _id: n.school
                                    }).lean().exec(function (err, found) {
                                        if (_.isEmpty(found)) {
                                            console.log("name is null");
                                            schoolData = "";
                                            callback(null, schoolData);
                                        } else {
                                            schoolData = found.name;
                                            // console.log("found", schoolData);
                                            callback(null, schoolData);
                                        }

                                    });

                                }
                            },
                            function (schoolData, callback) {
                                obj.school = schoolData;
                                // console.log("obj", obj.school);
                                var parentInfo;
                                var countParent = 0;
                                var levelInfo;
                                var countLevel = 0;
                                _.each(n.parentDetails, function (details) {
                                    var name = details.name + details.surname;
                                    var email = details.email;
                                    var mobile = details.mobile;
                                    var relation = details.relation;
                                    if (countParent == 0) {
                                        parentInfo = "{ Name:" + name + "," + "Relation:" + relation + "," + "Email:" + email + "," + "Mobile:" + mobile + "}";
                                    } else {
                                        parentInfo = parentInfo + "{ Name:" + name + "," + "Relation:" + relation + "," + "Email:" + email + "," + "Mobile:" + mobile + "}";
                                    }
                                    countParent++;

                                    // console.log("parentDetails", parentInfo);

                                });
                                obj.parentDetails = parentInfo;
                                _.each(n.sportLevel, function (details) {
                                    var level = details.level;
                                    var sport = details.sport;
                                    if (countLevel == 0) {
                                        levelInfo = "{ Level:" + level + "," + "Sport:" + sport + "}";
                                    } else {
                                        levelInfo = levelInfo + "{ Level:" + level + "," + "Sport:" + sport + "}";
                                    }
                                    countLevel++;

                                    // console.log("levelInfo", levelInfo);

                                });
                                obj.sportLevel = levelInfo;
                                var dateTime = moment.utc(n.createdAt).utcOffset("+05:30").format('YYYY-MM-DD HH:mm');
                                obj.date = dateTime;
                                obj.idProof = n.idProof;
                                obj.surname = n.surname;
                                obj.firstName = n.firstName;
                                obj.middleName = n.middleName;
                                obj.gender = n.gender;
                                obj.standard = n.standard;
                                obj.bloodGroup = n.bloodGroup;
                                obj.photograph = n.photograph;
                                obj.dob = n.dob;
                                obj.age = n.age;
                                obj.ageProof = n.ageProof;
                                obj.photoImage = n.photoImage;
                                obj.birthImage = n.birthImage;
                                obj.playedTournaments = n.playedTournaments;
                                obj.mobile = n.mobile;
                                obj.email = n.email;
                                obj.smsOTP = n.smsOTP;
                                obj.emailOTP = n.emailOTP;
                                obj.address = n.address;
                                obj.addressLine2 = n.addressLine2;
                                obj.state = n.state;
                                obj.district = n.district;
                                obj.city = n.city;
                                obj.pinCode = n.pinCode;
                                obj.status = n.status;
                                obj.password = n.password;
                                obj.year = n.year;
                                obj.registrationFee = n.registrationFee;
                                obj.paymentStatus = n.paymentStatus;
                                obj.transactionID = n.transactionID;
                                obj.remarks = n.remarks;
                                // console.log("obj", obj);
                                excelData.push(obj);
                                callback(null, excelData);
                            }
                        ], function (err, excelData) {
                            // console.log(excelData);
                            // console.log("End of excelData");
                            if (err) {
                                callback(err, null);
                            } else {
                                console.log("length", excelData.length);
                                callback(null, excelData);
                            }
                        });

                    }, function (err, data) {
                        // callback(null, excelData);
                        Config.generateExcel("Athlete", excelData, res);
                    });
                    // });
                }
            ],
            function (err, data2) {
                if (err) {
                    console.log(err);
                    callback(null, []);
                } else if (data2) {
                    if (_.isEmpty(data2)) {
                        callback(null, []);
                    } else {
                        callback(null, data2);
                    }
                }
            });

    },

    generateExcelOld: function (res) {
        console.log("dataIN");
        var matchObj = {
            $or: [{
                registrationFee: {
                    $ne: "online PAYU"
                }
            }, {
                paymentStatus: {
                    $ne: "Pending"
                }
            }]
        }
        Athelete.find(matchObj).sort({
            createdAt: -1
        }).lean().exec(function (err, data) {
            var excelData = [];
            async.eachSeries(data, function (n, callback) {
                var obj = {};
                obj.sfaID = n.sfaId;
                async.waterfall([
                    function (callback) {
                        if (_.isEmpty(n.school)) {
                            schoolData = n.atheleteSchoolName;
                            callback(null, schoolData);
                        } else {
                            School.findOne({
                                _id: n.school
                            }).lean().exec(function (err, found) {
                                if (_.isEmpty(found)) {
                                    console.log("name is null");
                                    schoolData = "";
                                    callback(null, schoolData);
                                } else {
                                    schoolData = found.name;
                                    // console.log("found", schoolData);
                                    callback(null, schoolData);
                                }

                            });

                        }
                    },
                    function (schoolData, callback) {
                        obj.school = schoolData;
                        // console.log("obj", obj.school);
                        var parentInfo;
                        var countParent = 0;
                        var levelInfo;
                        var countLevel = 0;
                        _.each(n.parentDetails, function (details) {
                            var name = details.name + details.surname;
                            var email = details.email;
                            var mobile = details.mobile;
                            var relation = details.relation;
                            if (countParent == 0) {
                                parentInfo = "{ Name:" + name + "," + "Relation:" + relation + "," + "Email:" + email + "," + "Mobile:" + mobile + "}";
                            } else {
                                parentInfo = parentInfo + "{ Name:" + name + "," + "Relation:" + relation + "," + "Email:" + email + "," + "Mobile:" + mobile + "}";
                            }
                            countParent++;

                            // console.log("parentDetails", parentInfo);

                        });
                        obj.parentDetails = parentInfo;
                        _.each(n.sportLevel, function (details) {
                            var level = details.level;
                            var sport = details.sport;
                            if (countLevel == 0) {
                                levelInfo = "{ Level:" + level + "," + "Sport:" + sport + "}";
                            } else {
                                levelInfo = levelInfo + "{ Level:" + level + "," + "Sport:" + sport + "}";
                            }
                            countLevel++;

                            // console.log("levelInfo", levelInfo);

                        });
                        obj.sportLevel = levelInfo;
                        var dateTime = moment.utc(n.createdAt).utcOffset("+05:30").format('YYYY-MM-DD HH:mm');
                        obj.date = dateTime;
                        obj.idProof = n.idProof;
                        obj.surname = n.surname;
                        obj.firstName = n.firstName;
                        obj.middleName = n.middleName;
                        obj.gender = n.gender;
                        obj.standard = n.standard;
                        obj.bloodGroup = n.bloodGroup;
                        obj.photograph = n.photograph;
                        obj.dob = n.dob;
                        obj.age = n.age;
                        obj.ageProof = n.ageProof;
                        obj.photoImage = n.photoImage;
                        obj.birthImage = n.birthImage;
                        obj.playedTournaments = n.playedTournaments;
                        obj.mobile = n.mobile;
                        obj.email = n.email;
                        obj.smsOTP = n.smsOTP;
                        obj.emailOTP = n.emailOTP;
                        obj.address = n.address;
                        obj.addressLine2 = n.addressLine2;
                        obj.state = n.state;
                        obj.district = n.district;
                        obj.city = n.city;
                        obj.pinCode = n.pinCode;
                        obj.status = n.status;
                        obj.password = n.password;
                        obj.year = n.year;
                        obj.registrationFee = n.registrationFee;
                        obj.paymentStatus = n.paymentStatus;
                        obj.transactionID = n.transactionID;
                        obj.remarks = n.remarks;
                        // console.log("obj", obj);
                        excelData.push(obj);
                        callback(null, excelData);
                    }
                ], function (err, excelData) {
                    // console.log(excelData);
                    // console.log("End of excelData");
                    if (err) {
                        callback(err, null);
                    } else {
                        console.log("length", excelData.length);
                        callback(null, excelData);
                    }
                });

            }, function (err, data) {
                // callback(null, excelData);
                Config.generateExcelOld("Athlete", excelData, res);
            });
        });
    },

    cronAthleteWithPaymentDue: function (data, callback) {
        Athelete.find({
            paymentStatus: "Pending"
        }).exec(function (err, found) {
            console.log("found", found);
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {

                callback(null, "Data is empty");
            } else {
                async.each(found, function (data, callback) {
                    if (data.registrationFee != "online PAYU" && data.paymentStatus != "Pending") {
                        var now = moment(new Date()); //todays date
                        var end = moment(data.createdAt); // another date
                        var duration = moment.duration(now.diff(end));
                        var dump = duration.asDays();
                        var days = parseInt(dump);
                        console.log("days", days)
                        if (days == 5) {
                            var emailData = {};
                            emailData.from = "info@sfanow.in";
                            emailData.email = data.email;
                            emailData.filename = "paymentReminderAthlete.ejs";
                            emailData.subject = "SFA: Your Payment Reminder for SFA Mumbai 2017";
                            console.log("emaildata", emailData);

                            // Config.email(emailData, function (err, emailRespo) {
                            //     if (err) {
                            //         console.log(err);
                            //         callback(null, err);
                            //     } else if (emailRespo) {
                            //         callback(null, emailRespo);
                            //     } else {
                            //         callback(null, "Invalid data");
                            //     }
                            // });

                        } else if (days == 10) {
                            var emailData = {};
                            emailData.from = "info@sfanow.in";
                            emailData.email = data.email;
                            emailData.filename = "paymentReminderAthlete.ejs";
                            emailData.subject = "SFA: Your Payment Reminder for SFA Mumbai 2017";
                            console.log("emaildata", emailData);

                            // Config.email(emailData, function (err, emailRespo) {
                            //     if (err) {
                            //         console.log(err);
                            //         callback(null, err);
                            //     } else if (emailRespo) {
                            //         callback(null, emailRespo);
                            //     } else {
                            //         callback(null, "Invalid data");
                            //     }
                            // });

                        } else {
                            callback(null, "no Athlete found");
                        }
                    } else {
                        callback(null, "hidden athlete found");
                    }
                }, callback);

            }
        });

    },









};
module.exports = _.assign(module.exports, exports, model);