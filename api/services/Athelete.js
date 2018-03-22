var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var uniqueValidator = require('mongoose-unique-validator');
// var timestamps = require('mongoose-timestamp');
var validators = require('mongoose-validators');
var monguurl = require('monguurl');
var autoIncrement = require('mongoose-auto-increment');
var objectid = require("mongodb").ObjectID;
var moment = require('moment');
var request = require("request");
var generator = require('generate-password');
autoIncrement.initialize(mongoose);
var schema = new Schema({
    receiptId: Number,
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
    package: {
        type: Schema.Types.ObjectId,
        ref: 'Package',
        index: true
    },
    // transactionDetails: [{
    //     type: Schema.Types.ObjectId,
    //     ref: 'Transaction',
    //     index: true
    // }],
    selectedEvent: Number,
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
    university: String,
    faculty: String,
    degree: String,
    collegeYear: String,
    course: String,
    verifiedDate: Date,
    remarks: String,
    accessToken: String,
    isSelected: Boolean,
    utm_medium: String,
    utm_source: String,
    utm_campaign: String,
    isBib: Boolean
});

schema.plugin(deepPopulate, {
    populate: {
        school: "_id name",
        package: ''
    }
});
schema.plugin(uniqueValidator);
schema.plugin(autoIncrement.plugin, {
    model: 'Athelete',
    field: 'receiptId',
    startAt: 1,
    incrementBy: 1
});
schema.plugin(timestamps);
module.exports = mongoose.model('Athelete', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema, "school", "school"));
var model = {

    searchByFilter: exports.search,

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
        };
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

    searchByNameId: function (data, callback) {
        if (_.isEmpty(data.input)) {
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
            };
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
                $or: [{
                        firstName: {
                            $regex: data.input,
                            $options: "i"

                        }
                    },
                    {
                        middleName: {
                            $regex: data.input,
                            $options: "i"

                        },
                    },
                    {
                        surname: {
                            $regex: data.input,
                            $options: "i"

                        },
                    }, {
                        sfaId: {
                            $regex: data.input,
                            $options: "i"

                        },
                    }
                ]
            };
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
                    fields: ['firstName', 'sfaId', 'surname', 'middleName'],
                    term: data.keyword
                }
            },
            sort: {
                desc: 'createdAt'
            },
            start: (page - 1) * maxRow,
            count: maxRow
        };
        async.waterfall([
                function (callback) {
                    Athelete.find(matchObj)
                        .order(options)
                        .deepPopulate("school")
                        .keyword(options)
                        .page(options, callback);
                },
                // function (found, callback) {
                //     Athelete.getSportRegisteredAthlete(found, function (err, athlete) {
                //         if (err) {
                //             callback(err, null);
                //         } else if (_.isEmpty(athlete)) {
                //             callback(null, []);
                //         } else {
                //             callback(null, athlete);
                //         }
                //     });
                // }
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

    getSportRegisteredAthlete: function (data, callback) {
        var targetAthlete = [];
        var flag = false;
        async.each(data.results, function (n, callback) {
            async.waterfall([
                    function (callback) {
                        StudentTeam.findOne({
                            studentId: n._id
                        }).lean().exec(function (err, found) {
                            if (err) {
                                callback(err, null);
                            } else if (_.isEmpty(found)) {
                                flag = false;
                                callback(null, flag);
                            } else {
                                flag = true;
                                callback(null, flag);
                            }
                        });
                    },
                    function (flag, callback) {
                        if (flag == false) {
                            IndividualSport.findOne({
                                athleteId: n._id
                            }).lean().exec(function (err, found) {
                                if (err) {
                                    callback(err, null);
                                } else if (_.isEmpty(found)) {
                                    flag = false;
                                    callback(null, flag);
                                } else {
                                    flag = true
                                    callback(null, flag);
                                }
                            });
                        } else {
                            callback(null, flag);
                        }
                    }
                ],
                function (err, data2) {
                    if (err) {
                        callback(null, []);
                    } else {
                        if (data2 == true) {
                            targetAthlete.push(n);
                        }
                        callback(null, data2);
                    }
                });
        }, function (err) {
            var final = {};
            final.options = data.options;
            final.results = targetAthlete;
            final.total = data.total;
            callback(null, final);
        });
    },

    getOneBySfaId: function (data, callback) {
        Athelete.findOne({ //finds one with refrence to id
            sfaId: data.sfaId
        }).exec(function (err, athleteInfo) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(athleteInfo)) {
                callback("Data is empty", null);
            } else {
                callback(null, athleteInfo);
            }
        });
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
                    fields: ['firstName', 'sfaId', 'surname'],
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
            };

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
            };
        } else if (data.type == "UTM_Source") {
            matchObj = {
                utm_source: {
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
            };
        } else if (data.type == "UTM_Campaign") {
            matchObj = {
                utm_campaign: {
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
            };
        } else if (data.type == "UTM_Medium") {
            matchObj = {
                utm_medium: {
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
            };
        } else if (data.type == "Athlete Name") {
            matchObj = {
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

            };
        } else if (data.type == "Payment Mode") {
            if (data.input == "cash" || data.input == "Cash") {
                matchObj = {
                    'registrationFee': "cash",
                };
            } else if (data.input == "online" || data.input == "Online") {
                matchObj = {
                    'registrationFee': "online PAYU",
                    paymentStatus: {
                        $ne: "Pending"
                    }
                };
            } else if (data.input == "sponsor" || data.input == "Sponsor") {
                matchObj = {
                    'registrationFee': "Sponsor",
                    paymentStatus: {
                        $ne: "Pending"
                    }
                };
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
                };
            }
        } else if (data.type == "Payment Status") {
            if (data.input == "Paid" || data.input == "paid") {
                matchObj = {
                    'paymentStatus': "Paid",
                };
            } else if (data.input == "Pending" || data.input == "pending") {
                matchObj = {
                    'paymentStatus': "Pending",
                    registrationFee: {
                        $ne: "online PAYU"
                    }
                };
            } else {
                matchObj = {
                    $or: [{
                        registrationFee: {
                            $ne: "online PAYU"
                        }
                    }, {
                        paymentStatus: {
                            $ne: "Pending"
                        }
                    }],

                };
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

            };
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
            };
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
                                        $regex: data.input,
                                        // $options: 'i'
                                    }
                                },
                                {
                                    "atheleteSchoolName": {
                                        $regex: data.input,
                                        // $options: 'i'
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
        } else if (data.keyword !== "") {
            Athelete.aggregate(
                [{
                        $match: {

                            $or: [{
                                    "firstName": {
                                        $regex: data.keyword,
                                        $options: "i"
                                    }
                                }, {
                                    "surname": {
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
                    if (_.isEmpty(found)) {
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
                                                console.log("inside school save");
                                                if (data.atheleteSchoolName) {
                                                    var schoolData = {};
                                                    schoolData.schoolName = data.atheleteSchoolName;
                                                    schoolData.locality = data.atheleteSchoolLocality;
                                                    schoolData.schoolLogo = data.atheleteSchoolIdImage;
                                                    schoolData.landline = data.atheleteSchoolContact;
                                                    if (data.utm_source) {
                                                        schoolData.utm_source = data.utm_source;
                                                    }
                                                    if (data.utm_medium) {
                                                        schoolData.utm_medium = data.utm_medium;
                                                    }
                                                    if (data.utm_campaign) {
                                                        schoolData.utm_campaign = data.utm_campaign;
                                                    }
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
                                                // if (athleteData.registrationFee == "cash" && data.property.institutionType == "school") {
                                                //     Athelete.atheletePaymentMail(athleteData, function (err, vData) {
                                                //         if (err) {
                                                //             callback(err, null);
                                                //         } else if (vData) {
                                                //             callback(null, vData);
                                                //         }
                                                //     });
                                                // } else if (athleteData.registrationFee == "cash" && data.property.institutionType == "college") {
                                                //     Athelete.atheletePaymentMailCollege(athleteData, function (err, vData) {
                                                //         if (err) {
                                                //             callback(err, null);
                                                //         } else if (vData) {
                                                //             callback(null, vData);
                                                //         }
                                                //     });
                                                // } else {
                                                //     callback(null, athleteData);
                                                // }
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
                                    data.year = new Date().getFullYear();
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
                                                            console.log("inside school save");
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
                                                            // if (athleteData.registrationFee == "cash" && data.property.institutionType == "school") {
                                                            //     Athelete.atheletePaymentMail(athleteData, function (err, vData) {
                                                            //         if (err) {
                                                            //             callback(err, null);
                                                            //         } else if (vData) {
                                                            //             callback(null, vData);
                                                            //         }
                                                            //     });
                                                            // } else if (athleteData.registrationFee == "cash" && data.property.institutionType == "college") {
                                                            //     Athelete.atheletePaymentMailCollege(athleteData, function (err, vData) {
                                                            //         if (err) {
                                                            //             callback(err, null);
                                                            //         } else if (vData) {
                                                            //             callback(null, vData);
                                                            //         }
                                                            //     });
                                                            // } else {
                                                            //     callback(null, athleteData);
                                                            // }
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

    saveNewAthlete: function (data, callback) {
        async.waterfall([
            function (callback) {
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
                        if (err) {
                            callback(null, {
                                error: err,
                                data: data
                            });
                        } else {
                            callback(null, found);
                        }
                    });

            },
            function (found, callback) {
                if (found.error) {
                    callback(null, found);
                } else if (_.isEmpty(found)) {
                    data.year = new Date().getFullYear();
                    data.verifyCount = 0;
                    data.atheleteID = 0;
                    Athelete.saveAthleteData(data, found, function (err, vData) {
                        if (err) {
                            callback(err, null);
                        } else if (vData) {
                            callback(null, vData);
                        }
                    });

                } else {
                    callback("Athlete Already Exist", null);
                }
            }
        ], function (err, complete) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, complete);
            }
        });
    },

    saveAthleteData: function (data, callback) {
        async.waterfall([
            function (callback) {
                Athelete.saveData(data, function (err, athleteData) {
                    if (err || _.isEmpty(athleteData)) {
                        callback(null, {
                            error: "No data found",
                            data: data
                        });
                    } else {
                        callback(null, athleteData);
                    }
                });
            },
            function (athleteData, callback) {
                var param = {};
                param.athlete = athleteData._id;
                param.school = undefined;
                param.transaction = [];
                Accounts.saveData(param, function (err, accountsData) {
                    if (err || _.isEmpty(accountsData)) {
                        callback(null, {
                            error: "No data found",
                            data: athleteData
                        });
                    } else {
                        callback(null, athleteData);
                    }
                });
            },

            function (athleteData, callback) {
                if (athleteData.error) {
                    callback(null, athleteData);
                } else {
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
            }
        ], function (err, complete) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, complete);
            }
        });
    },
    //genarate sfa when status changes to verified and sfaid is blank
    generateAtheleteSfaID: function (data, callback) {
        //find and first time atheleteID idea is for string id generation if required
        async.waterfall([
                function (callback) {
                    ConfigProperty.find().lean().exec(function (err, complete) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(complete)) {
                                callback(null, []);
                            } else {
                                callback(null, complete);
                            }
                        }
                    });
                },
                function (complete, callback) {
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
                                if (found.atheleteSchoolName && data.atheleteSchoolName) {
                                    data.school = undefined;
                                }
                                if (_.isEmpty(data.school)) {
                                    data.school = undefined;
                                }
                                if (found.school && data.school) {
                                    data.atheleteSchoolName = '';
                                }
                                if (found.verifyCount === 0) {

                                    if (data.status == "Verified") {
                                        data.verifyCount = 1;
                                        data.password = generator.generate({
                                            length: 8,
                                            numbers: true
                                        });
                                        if (_.isEmpty(data.sfaId)) {
                                            var year = new Date().getFullYear().toString().substr(2, 2);
                                            if (_.isEmpty(complete[0].city)) {
                                                found.city = "Mumbai";
                                            }
                                            var type = complete[0].institutionType;
                                            var city = complete[0].sfaCity;
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
                                                        if (_.isEmpty(datafound) && type == 'school') {
                                                            data.atheleteID = 1;
                                                            console.log("atheleteID", data.atheleteID);
                                                            data.sfaId = prefixCity + "A" + year + data.atheleteID;
                                                        } else if (_.isEmpty(datafound) && type == 'college') {
                                                            data.atheleteID = 50001;
                                                            console.log("atheleteID", data.atheleteID);
                                                            data.sfaId = prefixCity + "A" + year + data.atheleteID;
                                                        } else {
                                                            console.log("found", datafound[0].sfaId);
                                                            // if (datafound[0].atheleteID == undefined) {
                                                            //     datafound[0].atheleteID = 0;
                                                            // }
                                                            data.atheleteID = ++datafound[0].atheleteID;
                                                            console.log("atheleteID", data.atheleteID);
                                                            data.sfaId = prefixCity + "A" + year + data.atheleteID;
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
                    if (found.verifyCount === 0) {
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
                // found = Object(found);
                // delete found.school;
                // console.log("found", found.school);
                callback(null, found);
            }

        });
    },

    updatePaymentStatus: function (data, callback) {
        async.waterfall([
                function (callback) {
                    ConfigProperty.find().lean().exec(function (err, property) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(property)) {
                                callback(null, []);
                            } else {
                                callback(null, property);
                            }
                        }
                    });
                },
                function (property, callback) {
                    console.log("inside update", data);
                    var matchObj = {
                        $set: {
                            paymentStatus: "Paid",
                            transactionID: data.transactionid
                        }
                    };

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
                                                    // if (property[0].institutionType == "school") {
                                                    //     Athelete.atheletePaymentMail(found, function (err, vData) {
                                                    //         if (err) {
                                                    //             callback(err, null);
                                                    //         } else if (vData) {
                                                    //             callback(null, vData);
                                                    //         }
                                                    //     });
                                                    // } else {
                                                    //     Athelete.atheletePaymentMailCollege(found, function (err, vData) {
                                                    //         if (err) {
                                                    //             callback(err, null);
                                                    //         } else if (vData) {
                                                    //             callback(null, vData);
                                                    //         }
                                                    //     });
                                                    // }

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
                }
            ],
            function (err, data2) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    callback(null, data2);
                }

            });
    },

    updatePaymentStatusNew: function (data, callback) {
        async.waterfall([
                function (callback) {
                    ConfigProperty.find().lean().exec(function (err, property) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(property)) {
                                callback(null, []);
                            } else {
                                callback(null, property);
                            }
                        }
                    });
                },
                function (property, callback) {
                    console.log("inside update", data);
                    var matchObj = {
                        $set: {
                            paymentStatus: "Paid",
                            transactionID: data.transactionid
                        }
                    };
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
                            async.waterfall([
                                function (callback) {
                                    var param = {};
                                    param.athlete = found._id;
                                    param.school = undefined;
                                    param.dateOfTransaction = new date();
                                    param.package = found.package;
                                    param.amountPaid = found.package.finalPrice;
                                    param.paymentMode = "onlinePayu";
                                    Transaction.saveData(param, function (err, transactData) {
                                        if (err || _.isEmpty(transactData)) {
                                            callback(null, {
                                                error: "No Data",
                                                data: found
                                            });
                                        } else {
                                            callback(null, found);
                                        }
                                    });
                                },
                                function (found, callback) {
                                    if (found.error) {
                                        callback(null, found);
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
                                                                // if (property[0].institutionType == "school") {
                                                                //     Athelete.atheletePaymentMail(found, function (err, vData) {
                                                                //         if (err) {
                                                                //             callback(err, null);
                                                                //         } else if (vData) {
                                                                //             callback(null, vData);
                                                                //         }
                                                                //     });
                                                                // } else {
                                                                //     Athelete.atheletePaymentMailCollege(found, function (err, vData) {
                                                                //         if (err) {
                                                                //             callback(err, null);
                                                                //         } else if (vData) {
                                                                //             callback(null, vData);
                                                                //         }
                                                                //     });
                                                                // }

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
                                }
                            ], function (err, complete) {
                                if (err) {
                                    callback(err, callback);
                                } else {
                                    callback(null, complete);
                                }
                            });

                        }
                    });
                }
            ],
            function (err, data2) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    callback(null, data2);
                }

            });
    },

    receiptMail: function (data, callback) {
        async.waterfall([
                function (callback) {
                    ConfigProperty.find().lean().exec(function (err, property) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(property)) {
                                callback(null, []);
                            } else {
                                callback(null, property);
                            }
                        }
                    });
                },
                function (property, callback) {
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
                            emailData.receiptNo = "SFA" + found.receiptId;
                            emailData.city = property[0].sfaCity;
                            emailData.year = property[0].year;
                            emailData.eventYear = property[0].eventYear;
                            emailData.type = property[0].institutionType;
                            emailData.athleteAmount = property[0].totalAmountAthlete;
                            emailData.amountInWords = property[0].totalAmountInWordsAthlete;
                            emailData.amountWithoutTax = property[0].amoutWithoutTaxAthlete;
                            emailData.cgstAmout = property[0].cgstAmoutAthlete;
                            emailData.cgstPercent = property[0].cgstPercentAthlete;
                            emailData.sgstAmout = property[0].sgstAmoutAthlete;
                            emailData.sgstPercent = property[0].sgstPercentAthlete;
                            emailData.igstAmout = property[0].igstAmoutAthlete;
                            emailData.igstPercent = property[0].igstPercentAthlete;

                            // emailData.from = "info@sfanow.in";
                            emailData.from = property[0].infoId;
                            emailData.infoId = property[0].infoId;
                            emailData.infoNo = property[0].infoNo;
                            emailData.cityAddress = property[0].cityAddress;
                            emailData.ddFavour = property[0].ddFavour;
                            emailData.email1 = [{
                                email: found.email
                            }];
                            emailData.bcc1 = [{
                                email: "payments@sfanow.in"
                            }, {
                                email: "admin@sfanow.in"
                            }];
                            emailData.filename = "receiptAthelete.ejs";
                            emailData.subject = "SFA: Your Payment Receipt as an Athlete for SFA " + emailData.city + " " + emailData.type + " " + emailData.eventYear + ".";
                            console.log("emaildata", emailData);
                            Config.emailTo(emailData, function (err, emailRespo) {
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
                }
            ],
            function (err, data2) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    callback(null, data2);
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
        // emailData.name = data.firstName;
        emailData.city = data.city;
        emailData.year = data.year;
        emailData.eventYear = data.eventYear;
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

                            } else {
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
                            }
                        }
                    });

                }

            });
        }

    },

    atheletePaymentMailCollege: function (data, callback) {
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
    },

    registeredUnregisteredMail: function (data, callback) {},

    registeredOnlinePaymentMailSms: function (data, callback) {
        async.waterfall([
                function (callback) {
                    ConfigProperty.find().lean().exec(function (err, property) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(property)) {
                                callback(null, []);
                            } else {
                                callback(null, property);
                            }
                        }
                    });
                },
                function (property, callback) {
                    async.parallel([
                            function (callback) {
                                var emailOtp = (Math.random() + "").substring(2, 6);
                                var emailData = {};
                                // emailData.from = "info@sfanow.in";
                                emailData.from = property[0].infoId;
                                emailData.name = data.firstName;
                                emailData.email = data.email;
                                emailData.city = property[0].sfaCity;
                                emailData.year = property[0].year;
                                emailData.eventYear = property[0].eventYear;
                                emailData.infoId = property[0].infoId;
                                emailData.infoNo = property[0].infoNo;
                                emailData.cityAddress = property[0].cityAddress;
                                emailData.ddFavour = property[0].ddFavour;
                                emailData.filename = "atheleteOnlinePayment.ejs";
                                emailData.subject = "SFA: Thank you for registering for SFA " + emailData.city + " " + emailData.year;
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
                                smsData.content = "Thank you for registering for SFA " + property[0].sfaCity + " " + property[0].eventYear + ". For further details please check your registered email ID.";
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
                }
            ],
            function (err, data2) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    callback(null, data2);
                }

            });

    },

    registeredCashPaymentMailSms: function (data, callback) {
        async.waterfall([
                function (callback) {
                    ConfigProperty.find().lean().exec(function (err, property) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(property)) {
                                callback(null, []);
                            } else {
                                callback(null, property);
                            }
                        }
                    });
                },
                function (property, callback) {
                    async.parallel([
                            function (callback) {
                                var emailData = {};
                                // emailData.from = "info@sfanow.in";
                                emailData.from = property[0].infoId;
                                emailData.email = data.email;
                                emailData.name = data.firstName;
                                emailData.city = property[0].sfaCity;
                                emailData.year = property[0].year;
                                emailData.eventYear = property[0].eventYear;
                                emailData.infoId = property[0].infoId;
                                emailData.infoNo = property[0].infoNo;
                                emailData.cityAddress = property[0].cityAddress;
                                emailData.ddFavour = property[0].ddFavour;
                                emailData.athleteAmount = property[0].totalAmountAthlete;
                                emailData.filename = "atheleteCashPayment.ejs";
                                emailData.subject = "SFA: Thank you for registering for SFA " + emailData.city + " " + emailData.eventYear;
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
                                smsData.content = "Thank you for registering for SFA " + property[0].sfaCity + " " + property[0].eventYear + ". For further details please check your registered email ID.";
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
                }
            ],
            function (err, data2) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    callback(null, data2);
                }

            });

    },

    successVerifiedMailSms: function (data, callback) {
        async.waterfall([
                function (callback) {
                    ConfigProperty.find().lean().exec(function (err, property) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(property)) {
                                callback(null, []);
                            } else {
                                callback(null, property);
                            }
                        }
                    });
                },
                function (property, callback) {
                    async.parallel([
                            function (callback) {
                                var emailData = {};
                                // emailData.from = "info@sfanow.in";
                                emailData.from = property[0].infoId;
                                emailData.infoId = property[0].infoId;
                                emailData.infoNo = property[0].infoNo;
                                emailData.cityAddress = property[0].cityAddress;
                                emailData.ddFavour = property[0].ddFavour;
                                emailData.email = data.email;
                                emailData.sfaID = data.sfaId;
                                emailData.password = data.password;
                                emailData.name = data.firstName;
                                emailData.city = property[0].sfaCity;
                                emailData.year = property[0].year;
                                emailData.eventYear = property[0].eventYear;
                                emailData.type = property[0].institutionType;
                                emailData.filename = "registeredVerification.ejs";
                                emailData.subject = "SFA: You are now a verified Athlete for SFA " + emailData.city + " " + emailData.eventYear;
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
                                smsData.content = "Congratulations ! SFA ID " + data.sfaId + "and Password " + data.password + ".Kindly complete your Sports Registrations";
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
                }
            ],
            function (err, data2) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    callback(null, data2);
                }

            });
    },

    failureVerifiedMailSms: function (data, callback) {
        async.waterfall([
                function (callback) {
                    ConfigProperty.find().lean().exec(function (err, property) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(property)) {
                                callback(null, []);
                            } else {
                                callback(null, property);
                            }
                        }
                    });
                },
                function (property, callback) {
                    async.parallel([
                            function (callback) {
                                var emailData = {};
                                // emailData.from = "info@sfanow.in";
                                emailData.from = property[0].infoId;
                                emailData.infoId = property[0].infoId;
                                emailData.infoNo = property[0].infoNo;
                                emailData.cityAddress = property[0].cityAddress;
                                emailData.ddFavour = property[0].ddFavour;
                                emailData.email = data.email;
                                emailData.name = data.firstName;
                                emailData.sfaID = data.sfaID;
                                emailData.password = data.password;
                                emailData.city = property[0].sfaCity;
                                emailData.year = property[0].year;
                                emailData.eventYear = property[0].eventYear;
                                emailData.type = property[0].institutionType;
                                emailData.filename = "rejection.ejs";
                                emailData.subject = "SFA: Rejection of Your Application for SFA " + emailData.city + " " + emailData.eventYear;
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
                                var city = property[0].sfaCity;
                                var year = property[0].year;
                                var eventYear = property[0].eventYear;
                                smsData.content = "We regret to inform you that your application has been rejected for SFA " + city + " " + eventYear + ". For further queries please email us at info@sfanow.in";
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
                }
            ],
            function (err, data2) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    callback(null, data2);
                }

            });

    },

    unregistedOnlinePaymentMailSms: function (data, callback) {
        async.waterfall([
                function (callback) {
                    ConfigProperty.find().lean().exec(function (err, property) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(property)) {
                                callback(null, []);
                            } else {
                                callback(null, property);
                            }
                        }
                    });
                },
                function (property, callback) {
                    async.parallel([
                            function (callback) {
                                var emailData = {};
                                // emailData.from = "info@sfanow.in";
                                emailData.from = property[0].infoId;
                                emailData.infoId = property[0].infoId;
                                emailData.infoNo = property[0].infoNo;
                                emailData.cityAddress = property[0].cityAddress;
                                emailData.ddFavour = property[0].ddFavour;
                                emailData.email = data.email;
                                emailData.name = data.firstName;
                                emailData.city = property[0].sfaCity;
                                emailData.year = property[0].year;
                                emailData.type = property[0].institutionType;
                                emailData.eventYear = property[0].eventYear;
                                emailData.athleteAmount = property[0].totalAmountAthlete;
                                // emailData.sfaID = data.sfaID;
                                // emailData.password = data.password;
                                emailData.filename = "unregisteredOnlinePayment.ejs";
                                emailData.subject = "SFA: Thank you for registering for SFA " + emailData.city + " " + emailData.eventYear + ".";
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
                                var city = property[0].sfaCity;
                                var year = property[0].year;
                                var eventYear = property[0].eventYear;
                                smsData.content = "Thank you for registering for SFA " + city + " " + eventYear + ". For further details please check your registered email ID.";
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
                }
            ],
            function (err, data2) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    callback(null, data2);
                }

            });

    },

    unregistedCashPaymentMailSms: function (data, callback) {
        async.waterfall([
                function (callback) {
                    ConfigProperty.find().lean().exec(function (err, property) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(property)) {
                                callback(null, []);
                            } else {
                                callback(null, property);
                            }
                        }
                    });
                },
                function (property, callback) {
                    async.parallel([
                            function (callback) {
                                var emailData = {};
                                // emailData.from = "info@sfanow.in";
                                emailData.from = property[0].infoId;
                                emailData.infoId = property[0].infoId;
                                emailData.infoNo = property[0].infoNo;
                                emailData.cityAddress = property[0].cityAddress;
                                emailData.ddFavour = property[0].ddFavour;
                                emailData.email = data.email;
                                emailData.name = data.firstName;
                                emailData.city = property[0].sfaCity;
                                emailData.year = property[0].year;
                                emailData.type = property[0].institutionType;
                                emailData.eventYear = property[0].eventYear;
                                emailData.athleteAmount = property[0].totalAmountAthlete;
                                emailData.filename = "unregistercashpayment.ejs";
                                emailData.subject = "SFA: Thank you for registering for SFA " + emailData.city + " " + emailData.eventYear + ".";
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
                                var city = property[0].sfaCity;
                                var year = property[0].year;
                                var eventYear = property[0].eventYear;
                                smsData.content = "Thank you for registering for SFA " + city + " " + eventYear + ". For further details please check your registered email ID.";
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

                }
            ],
            function (err, data2) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    callback(null, data2);
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
                };

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
                };
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
            };
        } else if (data.type == "UTM_Source") {
            matchObj = {
                utm_source: {
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
            };
        } else if (data.type == "UTM_Campaign") {
            matchObj = {
                utm_campaign: {
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
            };
        } else if (data.type == "UTM_Medium") {
            matchObj = {
                utm_medium: {
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
            };
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

            };
        } else if (data.type == "Payment Mode") {
            if (data.input == "cash" || data.input == "Cash") {
                matchObj = {
                    'registrationFee': "cash",
                };
            } else if (data.input == "online" || data.input == "Online") {
                matchObj = {
                    'registrationFee': "online PAYU",
                    paymentStatus: {
                        $ne: "Pending"
                    }
                };

            }
            //-----------for sponsered--------- 
            else if (data.input == "sponsor" || data.input == "Sponsor") {
                matchObj = {
                    'registrationFee': "Sponsor",
                    paymentStatus: {
                        $ne: "Pending"
                    }
                };

            }
            //-----------for sponsered---------
            else {
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
                };

            }

        } else if (data.type == "Payment Status") {

            if (data.input == "Paid" || data.input == "paid") {
                matchObj = {
                    'paymentStatus': "Paid",
                };
            } else if (data.input == "Pending" || data.input == "pending") {
                matchObj = {
                    'paymentStatus': "Pending",
                    registrationFee: {
                        $ne: "online PAYU"
                    }
                };
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

                };
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

            };
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

            };
        }
        if (data.type == "School Name") {
            Athelete.aggregate(
                [{
                        $lookup: {
                            "from": "schools",
                            "localField": "school",
                            "foreignField": "_id",
                            "as": "school"
                        }
                    },
                    // Stage 2
                    {
                        $unwind: {
                            path: "$school",
                            preserveNullAndEmptyArrays: true // optional
                        }
                    },
                    // Stage 3
                    {
                        $match: {

                            $or: [{
                                    "school.name": {
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
        } else if (data.keyword !== "" && data.type !== "") {
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
                        $lookup: {
                            "from": "schools",
                            "localField": "school",
                            "foreignField": "_id",
                            "as": "school"
                        }
                    },
                    // Stage 2
                    {
                        $unwind: {
                            path: "$school",
                            preserveNullAndEmptyArrays: true // optional
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
                            callback(null, returnReq);

                        }
                    }
                });
        } else {
            Athelete.find(matchObj).lean().deepPopulate("school")
                .sort({
                    createdAt: -1
                }).exec(function (err, found) {
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

    // oldgenerateExcel: function (data, res) {
    //     console.log('generate req data', data);

    //     async.waterfall([
    //             function (callback) {
    //                 Athelete.excelFilterAthlete(data, function (err, complete) {
    //                     if (err) {
    //                         callback(err, null);
    //                     } else {
    //                         if (_.isEmpty(complete)) {
    //                             callback(null, complete);
    //                         } else {
    //                             // console.log('logs', complete);
    //                             callback(null, complete);
    //                         }
    //                     }
    //                 });

    //             },
    //             function (complete, callback) {
    //                 //    console.log('logs for excel', complete.length);
    //                 var excelData = [];
    //                 var schoolData;
    //                 async.concatLimit(complete, 20, function (n, callback) {
    //                         var obj = {};
    //                         obj.sfaID = n.sfaId;
    //                         async.waterfall([
    //                             function (callback) {
    //                                 if (_.isEmpty(n.school)) {
    //                                     schoolData = n.atheleteSchoolName;
    //                                     callback(null, schoolData);
    //                                 } else {
    //                                     School.findOne({
    //                                         _id: n.school
    //                                     }).lean().exec(function (err, found) {
    //                                         if (_.isEmpty(found)) {
    //                                             console.log("name is null");
    //                                             schoolData = "";
    //                                             callback(null, schoolData);
    //                                         } else {
    //                                             schoolData = found.name;
    //                                             // console.log("found", schoolData);
    //                                             callback(null, schoolData);
    //                                         }

    //                                     });

    //                                 }
    //                             },
    //                             function (schoolData, callback) {
    //                                 // if (n.receiptId) {
    //                                 //     if (n.registrationFee == "online PAYU") {
    //                                 //         obj.receiptNo = "SFA" + n.receiptId;
    //                                 //     } else {
    //                                 //         obj.receiptNo = "";
    //                                 //     }
    //                                 // } else {
    //                                 //     obj.receiptNo = "";
    //                                 // }
    //                                 obj.receiptNo = "SFA" + n.receiptId;
    //                                 obj.school = schoolData;
    //                                 if (n.university) {
    //                                     obj.university = n.university;
    //                                 } else {
    //                                     obj.university = "";
    //                                 }
    //                                 if (n.faculty) {
    //                                     obj.faculty = n.faculty;
    //                                 } else {
    //                                     obj.faculty = "";
    //                                 }
    //                                 if (n.course) {
    //                                     obj.course = n.course;
    //                                 } else {
    //                                     obj.course = "";
    //                                 }
    //                                 if (n.year) {
    //                                     obj.collegeYear = n.collegeYear;
    //                                 } else {
    //                                     obj.collegeYear = "";
    //                                 }
    //                                 if (n.degree) {
    //                                     obj.degree = n.degree;
    //                                 } else {
    //                                     obj.degree = "";
    //                                 }
    //                                 var parentInfo;
    //                                 var countParent = 0;
    //                                 var levelInfo;
    //                                 var countLevel = 0;
    //                                 _.each(n.parentDetails, function (details) {
    //                                     var name = details.name + details.surname;
    //                                     var email = details.email;
    //                                     var mobile = details.mobile;
    //                                     var relation = details.relation;
    //                                     if (countParent === 0) {
    //                                         parentInfo = "{ Name:" + name + "," + "Relation:" + relation + "," + "Email:" + email + "," + "Mobile:" + mobile + "}";
    //                                     } else {
    //                                         parentInfo = parentInfo + "{ Name:" + name + "," + "Relation:" + relation + "," + "Email:" + email + "," + "Mobile:" + mobile + "}";
    //                                     }
    //                                     countParent++;

    //                                 });
    //                                 obj.parentDetails = parentInfo;
    //                                 _.each(n.sportLevel, function (details) {
    //                                     var level = details.level;
    //                                     var sport = details.sport;
    //                                     if (countLevel === 0) {
    //                                         levelInfo = "{ Level:" + level + "," + "Sport:" + sport + "}";
    //                                     } else {
    //                                         levelInfo = levelInfo + "{ Level:" + level + "," + "Sport:" + sport + "}";
    //                                     }
    //                                     countLevel++;

    //                                     // console.log("levelInfo", levelInfo);

    //                                 });
    //                                 obj.sportLevel = levelInfo;
    //                                 var dateTime = moment.utc(n.createdAt).utcOffset("+05:30").format('YYYY-MM-DD HH:mm');
    //                                 obj.date = dateTime;
    //                                 obj.idProof = n.idProof;
    //                                 obj.surname = n.surname;
    //                                 obj.firstName = n.firstName;
    //                                 obj.middleName = n.middleName;
    //                                 obj.gender = n.gender;
    //                                 obj.standard = n.standard;
    //                                 obj.bloodGroup = n.bloodGroup;
    //                                 obj.photograph = n.photograph;
    //                                 obj.dob = n.dob;
    //                                 obj.age = n.age;
    //                                 obj.ageProof = n.ageProof;
    //                                 obj.photoImage = n.photoImage;
    //                                 obj.birthImage = n.birthImage;
    //                                 obj.playedTournaments = n.playedTournaments;
    //                                 obj.mobile = n.mobile;
    //                                 obj.email = n.email;
    //                                 obj.smsOTP = n.smsOTP;
    //                                 obj.emailOTP = n.emailOTP;
    //                                 obj.address = n.address;
    //                                 obj.addressLine2 = n.addressLine2;
    //                                 obj.state = n.state;
    //                                 obj.district = n.district;
    //                                 obj.city = n.city;
    //                                 obj.pinCode = n.pinCode;
    //                                 obj.status = n.status;
    //                                 obj.password = n.password;
    //                                 obj.year = n.year;
    //                                 obj.registrationFee = n.registrationFee;
    //                                 obj.paymentStatus = n.paymentStatus;
    //                                 obj.transactionID = n.transactionID;
    //                                 obj.remarks = n.remarks;
    //                                 // obj.utm_medium = n.utm_medium;
    //                                 // obj.utm_source = n.utm_source;
    //                                 // obj.utm_campaign = n.utm_campaign;
    //                                 if (n.utm_medium) {
    //                                     obj.utm_medium = n.utm_medium;
    //                                 } else {
    //                                     obj.utm_medium = "";
    //                                 }

    //                                 if (n.utm_campaign) {
    //                                     obj.utm_campaign = n.utm_campaign;
    //                                 } else {
    //                                     obj.utm_campaign = "";
    //                                 }
    //                                 if (n.utm_source) {
    //                                     obj.utm_source = n.utm_source;
    //                                 } else {
    //                                     obj.utm_source = "";
    //                                 }
    //                                 // console.log("obj", obj);
    //                                 excelData.push(obj);
    //                                 callback(null, excelData);
    //                             }
    //                         ], function (err, excelData) {
    //                             if (err) {
    //                                 callback(err, null);
    //                             } else {
    //                                 //    console.log("length", excelData.length);
    //                                 callback(null, excelData);
    //                             }
    //                         });
    //                     },
    //                     function (err, data) {
    //                         Config.generateExcel("Athlete", excelData, res);
    //                     });
    //             }
    //         ],
    //         function (err, data2) {
    //             if (err) {
    //                 console.log(err);
    //                 callback(null, []);
    //             } else if (data2) {
    //                 if (_.isEmpty(data2)) {
    //                     callback(null, []);
    //                 } else {
    //                     callback(null, data2);
    //                 }
    //             }
    //         });

    // },

    generateExcel: function (data, res) {
        Athelete.excelFilterAthlete(data, function (err, complete) {
            if (err) {
                callback(err, null);
            } else {
                if (_.isEmpty(complete)) {
                    callback(null, complete);
                } else {
                    var excelData = [];
                    _.each(complete, function (n) {
                        var obj = {};
                        obj.sfaID = n.sfaId;
                        obj.receiptNo = "SFA" + n.receiptId;
                        // if (n.atheleteSchoolName) {
                        //     obj.school = n.atheleteSchoolName;
                        // } else {
                        //     if (n.school !== null) {
                        //         obj.school = n.school.name;
                        //     } else {
                        //         obj.school = "";
                        //     }
                        // }
                        if (n.school !== null && !n.atheleteSchoolName) {
                            obj.school = n.school.name;
                        } else {
                            obj.school = "";
                        }
                        if (n.atheleteSchoolName) {
                            obj.addedSchool = n.atheleteSchoolName;
                        } else {
                            obj.addedSchool = "";
                        }
                        if (n.university) {
                            obj.university = n.university;
                        } else {
                            obj.university = "";
                        }
                        if (n.faculty) {
                            obj.faculty = n.faculty;
                        } else {
                            obj.faculty = "";
                        }
                        if (n.course) {
                            obj.course = n.course;
                        } else {
                            obj.course = "";
                        }
                        if (n.year) {
                            obj.collegeYear = n.collegeYear;
                        } else {
                            obj.collegeYear = "";
                        }
                        if (n.degree) {
                            obj.degree = n.degree;
                        } else {
                            obj.degree = "";
                        }
                        var parentInfo;
                        var countParent = 0;
                        var levelInfo;
                        var countLevel = 0;
                        _.each(n.parentDetails, function (details) {
                            var name = details.name + details.surname;
                            var email = details.email;
                            var mobile = details.mobile;
                            var relation = details.relation;
                            if (countParent === 0) {
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
                            if (countLevel === 0) {
                                levelInfo = "{ Level:" + level + "," + "Sport:" + sport + "}";
                            } else {
                                levelInfo = levelInfo + "{ Level:" + level + "," + "Sport:" + sport + "}";
                            }
                            countLevel++;
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

                        // obj.utm_medium = n.utm_medium;
                        // obj.utm_source = n.utm_source;
                        // obj.utm_campaign = n.utm_campaign;
                        if (n.utm_medium) {
                            obj.utm_medium = n.utm_medium;
                        } else {
                            obj.utm_medium = "";
                        }

                        if (n.utm_campaign) {
                            obj.utm_campaign = n.utm_campaign;
                        } else {
                            obj.utm_campaign = "";
                        }
                        if (n.utm_source) {
                            obj.utm_source = n.utm_source;
                        } else {
                            obj.utm_source = "";
                        }
                        if (n.isBib == true) {
                            obj.BIB = "YES";
                        } else {
                            obj.BIB = "NO";
                        }
                        excelData.push(obj);
                    });
                    Config.generateExcel("Athlete", excelData, res);
                }
            }
        });
    },

    generateExcelOld: function (res) {
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
        };
        Athelete.find(matchObj).sort({
            createdAt: -1
        }).lean().deepPopulate("school").exec(function (err, data) {
            var excelData = [];
            _.each(data, function (n) {
                var obj = {};
                obj.sfaID = n.sfaId;
                // if (n.atheleteSchoolName) {
                //     obj.school = n.atheleteSchoolName;
                // } else {
                //     if (n.school !== null) {
                //         obj.school = n.school.name;
                //     } else {
                //         obj.school = "";
                //     }
                // }
                if (n.school !== null && !n.atheleteSchoolName) {
                    obj.school = n.school.name;
                } else {
                    obj.school = "";
                }
                if (n.atheleteSchoolName) {
                    obj.addedSchool = n.atheleteSchoolName;
                } else {
                    obj.addedSchool = "";
                }
                if (n.university) {
                    obj.university = n.university;
                } else {
                    obj.university = "";
                }
                if (n.faculty) {
                    obj.faculty = n.faculty;
                } else {
                    obj.faculty = "";
                }
                if (n.course) {
                    obj.course = n.course;
                } else {
                    obj.course = "";
                }
                if (n.year) {
                    obj.collegeYear = n.collegeYear;
                } else {
                    obj.collegeYear = "";
                }
                if (n.degree) {
                    obj.degree = n.degree;
                } else {
                    obj.degree = "";
                }
                var parentInfo;
                var countParent = 0;
                var levelInfo;
                var countLevel = 0;
                _.each(n.parentDetails, function (details) {
                    var name = details.name + details.surname;
                    var email = details.email;
                    var mobile = details.mobile;
                    var relation = details.relation;
                    if (countParent === 0) {
                        parentInfo = "{ Name:" + name + "," + "Relation:" + relation + "," + "Email:" + email + "," + "Mobile:" + mobile + "}";
                    } else {
                        parentInfo = parentInfo + "{ Name:" + name + "," + "Relation:" + relation + "," + "Email:" + email + "," + "Mobile:" + mobile + "}";
                    }
                    countParent++;
                });
                obj.parentDetails = parentInfo;
                _.each(n.sportLevel, function (details) {
                    var level = details.level;
                    var sport = details.sport;
                    if (countLevel === 0) {
                        levelInfo = "{ Level:" + level + "," + "Sport:" + sport + "}";
                    } else {
                        levelInfo = levelInfo + "{ Level:" + level + "," + "Sport:" + sport + "}";
                    }
                    countLevel++;
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
                if (n.utm_medium) {
                    obj.utm_medium = n.utm_medium;
                } else {
                    obj.utm_medium = "";
                }

                if (n.utm_campaign) {
                    obj.utm_campaign = n.utm_campaign;
                } else {
                    obj.utm_campaign = "";
                }
                if (n.utm_source) {
                    obj.utm_source = n.utm_source;
                } else {
                    obj.utm_source = "";
                }
                if (n.isBib == true) {
                    obj.BIB = "YES";
                } else {
                    obj.BIB = "NO";
                }
                excelData.push(obj);
            });
            Config.generateExcelOld("Athlete", excelData, res);
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
                async.each(found, function (data1, callback) {
                    if (data1.registrationFee != "online PAYU" && data1.paymentStatus != "Pending") {
                        var now = moment(new Date()); //todays date
                        var end = moment(data1.createdAt); // another date
                        var duration = moment.duration(now.diff(end));
                        var dump = duration.asDays();
                        var days = parseInt(dump);
                        console.log("days", days);
                        if (days == 5) {
                            var emailData = {};
                            // emailData.from = "info@sfanow.in";
                            emailData.from = data.property.infoId;
                            emailData.infoId = data.property.infoId;
                            emailData.infoNo = data.property.infoNo;
                            emailData.cityAddress = data.property.cityAddress;
                            emailData.ddFavour = data.property.ddFavour;
                            emailData.city = data.property.sfaCity;
                            emailData.year = data.property.year;
                            emailData.eventYear = data.property.eventYear;
                            emailData.type = data.property.institutionType;
                            emailData.athleteAmount = data.property.totalAmountAthlete;
                            emailData.name = data1.firstName;
                            emailData.email = data1.email;
                            emailData.filename = "paymentReminderAthlete.ejs";
                            emailData.subject = "SFA: Your Payment Reminder for SFA " + emailData.city + " " + emailData.eventYear;
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

                        } else if (days == 10) {
                            var emailData = {};
                            // emailData.from = "info@sfanow.in";
                            emailData.from = data.property.infoId;
                            emailData.infoId = data.property.infoId;
                            emailData.infoNo = data.property.infoNo;
                            emailData.cityAddress = data.property.cityAddress;
                            emailData.ddFavour = data.property.ddFavour;
                            emailData.city = data.property.sfaCity;
                            emailData.year = data.property.year;
                            emailData.eventYear = data.property.eventYear;
                            emailData.type = data.property.institutionType;
                            emailData.athleteAmount = data.property.totalAmountAthlete;
                            emailData.name = data1.firstName;
                            emailData.email = data1.email;
                            emailData.filename = "paymentReminderAthlete.ejs";
                            emailData.subject = "SFA: Your Payment Reminder for SFA " + emailData.city + " " + emailData.eventYear;
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

    getTargetAthleteold: function (data, res) {
        async.waterfall([
                function (callback) {
                    athlete = [];
                    async.parallel([
                            function (callback) {
                                StudentTeam.find().lean().exec(function (err, found) {
                                    if (err) {
                                        callback(err, null);
                                    } else if (_.isEmpty(found)) {
                                        callback(null, []);
                                    } else {
                                        _.each(found, function (n) {
                                            athlete.push(n.studentId);
                                            // callback(null, n);
                                            // }, function (err, complete) {
                                            console.log("team", athlete);
                                            //     callback(null, athlete);
                                        });
                                        callback(null, athlete);
                                    }
                                });
                            },
                            function (callback) {
                                IndividualSport.find().lean().exec(function (err, found) {
                                    if (err) {
                                        callback(err, null);
                                    } else if (_.isEmpty(found)) {
                                        callback(null, []);
                                    } else {
                                        _.each(found, function (n) {
                                            athlete.push(n.athleteId);
                                            // callback(null, n);
                                            // }, function (err, complete) {
                                            console.log("athlete", athlete);
                                            //     callback(null, athlete);
                                        });
                                        callback(null, athlete);
                                    }
                                });
                            }
                        ],
                        function (err, data2) {
                            if (err) {
                                callback(null, []);
                            } else if (data2) {
                                if (_.isEmpty(data2)) {
                                    callback(null, []);
                                } else {
                                    var registerdAthlete = [].concat.apply([], [
                                        data2[0],
                                        data2[1]
                                    ]);
                                    console.log("registerdAthlete", registerdAthlete);
                                    callback(null, registerdAthlete);
                                }
                            }
                        });
                },
                function (registerdAthlete, callback) {
                    var targetAthlete = [];
                    var deepSearch = "school";
                    Athelete.find().lean().deepPopulate(deepSearch).exec(function (err, athlete) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(athlete)) {
                            callback(null, []);
                        } else {
                            var i = 0;
                            _.each(athlete, function (n) {
                                _.each(registerdAthlete, function (m) {
                                    if (n._id !== m) {
                                        console.log("matched", n);
                                        targetAthlete.push(n);
                                    }
                                });
                            });
                            callback(null, targetAthlete);
                        }
                    });
                },
                function (targetAthlete, callback) {
                    console.log("inside generate");
                    Athelete.generateTargetAthlete(targetAthlete, function (err, singleData) {
                        // callback(null, singleData);
                        Config.generateExcel("targetAthlete", singleData, res);
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

    },

    generateTargetAthlete: function (match, callback) {
        var singleData = [];
        _.each(match, function (athleteData) {
            var obj = {};
            if (athleteData.sfaId) {
                obj["SFA ID"] = athleteData.sfaId;
            } else {
                obj["SFA ID"] = "-";
            }
            if (athleteData.middleName) {
                obj.NAME = athleteData.firstName + " " + athleteData.middleName + " " + athleteData.surname;
            } else {
                obj.NAME = athleteData.firstName + " " + athleteData.surname;
            }
            obj["EMAIL ID"] = athleteData.email;
            obj["MOBILE"] = athleteData.mobile;
            if (!_.isEmpty(athleteData.school)) {
                obj.SCHOOL = athleteData.school.name;
            } else {
                obj.SCHOOL = athleteData.atheleteSchoolName;
            }
            obj["STATUS"] = athleteData.status;
            obj["PAYMENT MODE"] = athleteData.registrationFee;
            obj["PAYMENT STATUS"] = athleteData.paymentStatus;
            singleData.push(obj);
        });
        callback(null, singleData);
    },

    getTargetAthlete: function (data, res) {
        async.waterfall([
                function (callback) {
                    var deepSearch = "school";
                    Athelete.find().lean().deepPopulate(deepSearch).exec(function (err, athlete) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(athlete)) {
                            callback(null, []);
                        } else {
                            callback(null, athlete);
                        }
                    });
                },
                function (athlete, callback) {
                    var targetAthlete = [];
                    var flag = false;
                    async.each(athlete, function (n, callback) {
                        async.waterfall([
                                function (callback) {
                                    StudentTeam.findOne({
                                        studentId: n._id
                                    }).lean().exec(function (err, found) {
                                        if (err) {
                                            callback(err, null);
                                        } else if (_.isEmpty(found)) {
                                            flag = false;
                                            callback(null, flag);
                                        } else {
                                            flag = true;
                                            callback(null, flag);
                                        }
                                    });
                                },
                                function (flag, callback) {
                                    if (flag == false) {
                                        IndividualSport.findOne({
                                            athleteId: n._id
                                        }).lean().exec(function (err, found) {
                                            if (err) {
                                                callback(err, null);
                                            } else if (_.isEmpty(found)) {
                                                flag = false;
                                                callback(null, flag);
                                            } else {
                                                flag = true
                                                callback(null, flag);
                                            }
                                        });
                                    } else {
                                        callback(null, flag);
                                    }
                                }
                            ],
                            function (err, data2) {
                                if (err) {
                                    callback(null, []);
                                } else {
                                    if (data2 == false) {
                                        targetAthlete.push(n);
                                    }
                                    callback(null, data2);
                                }
                            });
                    }, function (err) {
                        callback(null, targetAthlete);
                    });
                },
                function (targetAthlete, callback) {
                    console.log("inside generate");
                    Athelete.generateTargetAthlete(targetAthlete, function (err, singleData) {
                        Config.generateExcel("targetAthlete", singleData, res);
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
    },



    // async.concatSeries(totals, function (n, callback) {
    //     console.log("n", n);
    //     var d = new Date(n._id.event);
    //     n._id.month = monthNames[n._id.month];
    //     callback(null, n);
    // }, function (err, complete) {
    //     if (err) {
    //         callback(err, null);
    //     } else {
    //         callback(null, complete);
    //     }
    // })

    toTitleCase: function (data) {
        if (data) {
            return data.replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });

        } else {
            return '';
        }
    },


    updateAthleteName: function (data, callback) {
        Athelete.find({
            $or: [{
                firstName: {
                    $exists: true
                }
            }, {
                middleName: {
                    $exists: true
                }
            }, {
                surname: {
                    $exists: true
                }
            }]
        }, {
            _id: 1,
            surname: 1,
            firstName: 1,
            middleName: 1
        }).lean().exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, "Data is empty");
            } else {
                async.concatLimit(found, 10, function (key, callback) {
                    if (!_.isEmpty(key.firstName)) {
                        key.firstName = Athelete.toTitleCase(key.firstName);
                    }
                    if (!_.isEmpty(key.surname)) {
                        key.surname = Athelete.toTitleCase(key.surname);
                    }
                    if (!_.isEmpty(key.middleName) && key.middleName != '') {
                        key.middleName = Athelete.toTitleCase(key.middleName);
                    }

                    Athelete.saveData(key, function (err, res) {
                        if (err) {
                            callback(err, 'no data found');
                        } else {
                            if (_.isEmpty(res)) {
                                callback(null, "No data found");
                            } else {
                                callback(null, res);
                            }
                        }
                    });

                }, function (err, res) {
                    console.log("Finished");
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, res);
                    }
                });
            }
        });

    },

    updateAthleteEmailMobileNo: function (data, callback) {
        Athelete.find({
            $or: [{
                firstName: {
                    $exists: true
                }
            }, {
                middleName: {
                    $exists: true
                }
            }, {
                surname: {
                    $exists: true
                }
            }]
        }, {
            _id: 1,
            surname: 1,
            firstName: 1,
            middleName: 1,
            email: 1,
            mobile: 1
        }).lean().exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, 'No data found');

            } else {
                async.concatLimit(found, 10, function (key, callback) {
                    key.mobile = data.mobile;
                    key.email = data.email;
                    Athelete.saveData(key, function (err, res) {
                        if (err) {
                            callback(err, 'no data found');
                        } else {
                            if (_.isEmpty(res)) {
                                callback(null, "No data found");
                            } else {
                                callback(null, res);
                            }
                        }
                    });

                }, function (err, res) {
                    console.log("Finished");
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, res);
                    }
                });
            }

        });

    },
    getAthletePaymentStatus: function (data, callback) {
        console.log("Confgi", Config);
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
                    fields: ['firstName', 'sfaId', 'surname'],
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
            matchObj = {
                createdAt: {
                    $gt: data.startDate,
                    $lt: endOfDay,
                },
                $and: [{
                    registrationFee: {
                        $eq: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $eq: "Pending"
                    }
                }]
            };

        } else if (data.type == "SFA-ID") {
            matchObj = {
                sfaId: {
                    $regex: data.input,
                    $options: "i"
                },
                $and: [{
                    registrationFee: {
                        $eq: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $eq: "Pending"
                    }
                }]
            };
        } else if (data.type == "UTM_Source") {
            matchObj = {
                utm_source: {
                    $regex: data.input,
                    $options: "i"
                },
                $and: [{
                    registrationFee: {
                        $eq: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $eq: "Pending"
                    }
                }]
            };
        } else if (data.type == "UTM_Campaign") {
            matchObj = {
                utm_campaign: {
                    $regex: data.input,
                    $options: "i"
                },
                $and: [{
                    registrationFee: {
                        $eq: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $eq: "Pending"
                    }
                }]
            };
        } else if (data.type == "UTM_Medium") {
            matchObj = {
                utm_medium: {
                    $regex: data.input,
                    $options: "i"
                },
                $and: [{
                    registrationFee: {
                        $eq: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $eq: "Pending"
                    }
                }]
            };
        } else if (data.type == "Athlete Name") {
            matchObj = {
                firstName: {
                    $regex: data.input,
                    $options: "i"

                },
                $and: [{
                    registrationFee: {
                        $eq: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $eq: "Pending"
                    }
                }]

            };
        } else if (data.type == "Payment Mode") {
            if (data.input == "cash" || data.input == "Cash") {
                matchObj = {
                    'registrationFee': "cash",
                };
            } else if (data.input == "online" || data.input == "Online") {
                matchObj = {
                    'registrationFee': "online PAYU",
                    paymentStatus: {
                        $eq: "Pending"
                    }
                };
            } else if (data.input == "sponsor" || data.input == "Sponsor") {
                matchObj = {
                    'registrationFee': "Sponsor",
                    paymentStatus: {
                        $eq: "Pending"
                    }
                };
            } else {
                var matchObj = {
                    $and: [{
                        registrationFee: {
                            $eq: "online PAYU"
                        }
                    }, {
                        paymentStatus: {
                            $eq: "Pending"
                        }
                    }],
                };
            }
        } else if (data.type == "Payment Status") {
            if (data.input == "Paid" || data.input == "paid") {
                matchObj = {
                    'paymentStatus': "Paid",
                };
            } else if (data.input == "Pending" || data.input == "pending") {
                matchObj = {
                    'paymentStatus': "Pending",
                    registrationFee: {
                        $eq: "online PAYU"
                    }
                };
            } else {
                matchObj = {
                    $and: [{
                        registrationFee: {
                            $eq: "online PAYU"
                        }
                    }, {
                        paymentStatus: {
                            $eq: "Pending"
                        }
                    }],

                };
            }
        } else if (data.type == "Verified Status") {
            matchObj = {
                'status': {
                    $regex: data.input,
                    $options: "i"
                },
                $and: [{
                    registrationFee: {
                        $eq: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $eq: "Pending"
                    }
                }]

            };
        } else {
            var matchObj = {
                $and: [{
                    registrationFee: {
                        $eq: "online PAYU"
                    }
                }, {
                    paymentStatus: {
                        $eq: "Pending"
                    }
                }],
            };
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
                                        $regex: data.input,
                                        // $options: 'i'
                                    }
                                },
                                {
                                    "atheleteSchoolName": {
                                        $regex: data.input,
                                        // $options: 'i'
                                    }
                                }
                            ]

                        }
                    },
                    // Stage 4
                    {
                        $match: {
                            $and: [{
                                registrationFee: {
                                    $eq: "online PAYU"
                                }
                            }, {
                                paymentStatus: {
                                    $eq: "Pending"
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
        } else if (data.keyword !== "") {
            Athelete.aggregate(
                [{
                        $match: {

                            $or: [{
                                    "firstName": {
                                        $regex: data.keyword,
                                        $options: "i"
                                    }
                                }, {
                                    "surname": {
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
                            $and: [{
                                registrationFee: {
                                    $eq: "online PAYU"
                                }
                            }, {
                                paymentStatus: {
                                    $eq: "Pending"
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
    }



};
module.exports = _.assign(module.exports, exports, model);