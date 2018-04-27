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
    coupon: {
        type: Schema.Types.ObjectId,
        ref: 'CouponCode',
        index: true
    },
    selectedEvent: {
        type: Number,
        min: 0,
        default: 0
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
        certificateImage: String
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
    isBib: Boolean,
    Document_Status: String,
    Photo_ID: Boolean,
    School_Id: Boolean,
    Age_Proof: Boolean,
});

schema.plugin(deepPopulate, {
    populate: {
        // school: "_id name",
        // package: ''
        'school': {
            select: '_id name'
        },
        'package': {
            select: ''
        }
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

var exports = _.cloneDeep(require("sails-wohlig-service")(schema, "school package", "school"));
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

    getOneBySfaIdStatus: function (data, callback) {
        Athelete.findOne({ //finds one with refrence to id
            sfaId: data.sfaId,
            $or: [{
                registrationFee: {
                    $ne: "online PAYU"
                }
            }, {
                paymentStatus: {
                    $ne: "Pending"
                }
            }]
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

    getSearchAggregatePipeline: function (data) {
        var pipeline = [ // Stage 1
            {
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
        ];
        return pipeline;
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
            var count = 0;
            var pipeLine = Athelete.getSearchAggregatePipeline(data);
            var newPipeLine = _.cloneDeep(pipeLine);
            Athelete.aggregate(pipeLine, function (err, matchData) {
                if (err) {
                    callback(err, null);
                } else {
                    newPipeLine.push({
                        $skip: options.start
                    }, {
                        $limit: options.count
                    });
                    Athelete.aggregate(newPipeLine, function (err, returnReq) {
                        if (err) {
                            console.log(err);
                            callback(err, "error in mongoose");
                        } else {
                            if (_.isEmpty(returnReq)) {
                                callback(null, []);
                            } else {
                                count = matchData.length;
                                console.log("count", count);
                                var data = {};
                                data.options = options;
                                data.results = returnReq;
                                data.total = count;
                                callback(null, data);
                            }
                        }
                    });
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
    saveAtheleteOld: function (data, callback) {
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

    saveAthelete: function (data, callback) {
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
                    Athelete.saveAthleteData(data, function (err, vData) {
                        if (err) {
                            callback(err, null);
                        } else if (vData) {
                            callback(null, vData);
                        }
                    });
                } else {
                    if (found[0].registrationFee == 'online PAYU' && found[0].paymentStatus == 'Pending') {
                        Athelete.removal(data, found, function (err, vData) {
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
            }
        ], function (err, complete) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, complete);
            }
        });
    },

    removal: function (data, found, callback) {
        async.waterfall([
                function (callback) {
                    Athelete.remove({ //finds one with refrence to id
                        _id: found[0]._id
                    }).exec(function (err, removed) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, removed)
                        }
                    });
                },
                function (removed, callback) {
                    Accounts.remove({ //finds one with refrence to id
                        athlete: found[0]._id
                    }).exec(function (err, removed) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, removed);
                        }
                    });
                },
                function (removed, callback) {
                    data.year = new Date().getFullYear();
                    data.verifyCount = 0;
                    data.atheleteID = 0;
                    Athelete.saveAthleteData(data, function (err, vData) {
                        if (err) {
                            callback(err, null);
                        } else if (vData) {
                            callback(null, vData);
                        }
                    });
                }
            ],
            function (err, complete) {
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
                    if (athleteData.error) {
                        callback(null, athleteData);
                    } else {
                        data.transaction = [];
                        if (athleteData.registrationFee == "cash") {
                            var param = {};
                            param.athlete = athleteData._id;
                            param.school = undefined;
                            param.package = athleteData.package;
                            param.sgstAmount = data.sgstAmt;
                            param.cgstAmount = data.cgstAmt;
                            param.igstAmout = data.igstAmt;
                            param.discount = data.discount;
                            param.outstandingAmount = data.amountPaid;
                            param.paymentMode = athleteData.registrationFee;
                            param.paymentStatus = athleteData.paymentStatus;

                            param.receiptId = [];
                            param.checkNo = [];
                            Transaction.saveData(param, function (err, transactData) {
                                if (err || _.isEmpty(transactData)) {
                                    callback(null, {
                                        error: "no data found",
                                        data: data
                                    });
                                } else {
                                    data.transaction.push(transactData._id);
                                    callback(null, athleteData);
                                }
                            });
                        } else {
                            callback(null, athleteData);
                        }
                    }

                },
                function (athleteData, callback) {
                    if (athleteData.error) {
                        callback(null, athleteData);
                    } else {
                        if (athleteData.registrationFee == "online PAYU") {
                            var param = {};
                            param.athlete = athleteData._id;
                            param.school = undefined;
                            param.sgst = data.sgstAmt;
                            param.cgst = data.cgstAmt;
                            param.igst = data.igstAmt;
                            param.refundAmount = data.refundAmount;
                            param.totalToPay = data.amountToPay;
                            param.totalPaid = data.amountPaid;
                            param.discount = data.discount;
                            param.upgrade = false;
                            param.paymentMode = athleteData.registrationFee;
                            param.transaction = [];
                        } else {
                            var param = {};
                            param.athlete = athleteData._id;
                            param.school = undefined;
                            param.sgst = data.sgstAmt;
                            param.cgst = data.cgstAmt;
                            param.igst = data.igstAmt;
                            param.refundAmount = data.refundAmount;
                            param.discount = data.discount;
                            param.outstandingAmount = data.amountPaid;
                            param.paymentMode = athleteData.registrationFee;
                            param.upgrade = false;
                            param.transaction = data.transaction;
                        }
                        Accounts.saveData(param, function (err, accountsData) {
                            if (err || _.isEmpty(accountsData)) {
                                callback(null, {
                                    error: "No data found",
                                    data: athleteData
                                });
                            } else {
                                console.log("athelete accounts created", accountsData);
                                callback(null, athleteData);
                            }
                        });
                    }
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
            ],
            function (err, complete) {
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
                    }).lean().deepPopulate("package").sort({
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
                                        data.password = found.password;
                                        data.package = found.package;
                                        // data.password = generator.generate({
                                        //     length: 8,
                                        //     numbers: true
                                        // });
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

    updatePaymentStatusOld: function (data, callback) {
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
                    Athelete.findOne({ //finds one with refrence to id
                        firstName: data.firstName,
                        surname: data.surname,
                        email: data.email,
                    }).lean().deepPopulate("package coupon").exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(found)) {
                            console.log("empty in Athelete found");
                            callback(null, "Data is empty");
                        } else {
                            async.waterfall([
                                    function (callback) {
                                        Accounts.findOne({
                                            athlete: found._id
                                        }).lean().exec(function (err, accountsData) {
                                            if (err || _.isEmpty(accountsData)) {
                                                callback(null, {
                                                    error: "no data found",
                                                    data: found
                                                });
                                            } else {
                                                found.accounts = accountsData;
                                                callback(null, found);
                                            }
                                        });
                                    },
                                    function (found, callback) {
                                        data.athlete = true;
                                        Transaction.saveTransaction(data, found, function (err, vData) {
                                            if (err || _.isEmpty(vData)) {
                                                callback(null, {
                                                    error: "no data found",
                                                    data: found
                                                });
                                            } else {
                                                callback(null, found);
                                            }
                                        });
                                    },
                                ],
                                function (err, complete) {
                                    if (err) {
                                        callback(err, callback);
                                    } else {
                                        callback(null, complete);
                                    }
                                });
                        }
                    });
                },
                function (found, callback) {
                    if (found.error) {
                        callback(null, found);
                    } else {
                        console.log("found in update", found);
                        var matchObj = {
                            $set: {
                                paymentStatus: "Paid",
                                transactionID: data.transactionid
                            }
                        };
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
                },
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

    receiptMailOld: function (data, callback) {
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
                Accounts.findOne({
                        athlete: data._id
                    }).lean()
                    .deepPopulate("athlete athlete.package transaction transaction.package")
                    .exec(function (err, accountsData) {
                        if (err || _.isEmpty(accountsData)) {
                            callback(null, {
                                error: "no accounts found",
                                data: data
                            });
                        } else {
                            var final = {};
                            final.accounts = accountsData;
                            final.property = property[0];
                            callback(null, final);
                        }
                    });
            },
            function (final, callback) {
                console.log("final data------->", final);
                var len = final.accounts.transaction.length;
                var temp = len;
                len--;
                var emailData = {};
                emailData.city = final.property.sfaCity;
                emailData.type = final.property.institutionType;
                emailData.infoNo = final.property.infoNo;
                emailData.infoId = final.property.infoId;
                emailData.ddFavour = final.property.ddFavour;
                emailData.cityAddress = final.property.cityAddress;
                emailData.upgrade = false;
                emailData.packageName = final.accounts.transaction[len].package.name;
                emailData.amountWithoutTax = final.accounts.transaction[len].package.finalPrice;
                var dateTime = moment().utc(final.accounts.transaction[len].dateOfTransaction).format("DD-MM-YYYY");
                emailData.registrationDate = dateTime;
                // emailData.registrationDate = final.accounts.transaction[len].dateOfTransaction;
                emailData.cgstPercent = final.accounts.transaction[len].package.cgstPercent;
                emailData.sgstPercent = final.accounts.transaction[len].package.sgstPercent;
                emailData.igstPercent = final.accounts.transaction[len].package.igstPercent;
                emailData.cgstAmount = final.accounts.transaction[len].cgstAmount;
                emailData.sgstAmount = final.accounts.transaction[len].sgstAmount;
                emailData.igstAmount = final.accounts.transaction[len].igstAmount;
                emailData.eventYear = final.property.eventYear;
                if (temp > 1) {
                    temp = temp - 2;
                } else {
                    temp = 0;
                }
                emailData.prevPaidAmount = final.accounts.transaction[temp].amountPaid;
                emailData.discount = final.accounts.discount;
                emailData.firstName = final.accounts.athlete.firstName;
                emailData.receiptNo = final.accounts.transaction[len].receiptId[0];
                emailData.surname = final.accounts.athlete.surname;
                emailData.paymentMode = final.accounts.transaction[len].paymentMode;
                emailData.athleteAmount = final.accounts.transaction[len].amountPaid;
                if (final.accounts.transaction[len].PayuId) {
                    emailData.transactionId = final.accounts.transaction[len].PayuId;
                }
                emailData.amountToWords = Accounts.amountToWords(final.accounts.transaction[len].amountPaid);
                emailData.from = final.property.infoId;
                emailData.email1 = [{
                    email: final.accounts.athlete.email
                }];
                emailData.bcc1 = [{
                    email: "payments@sfanow.in"
                }, {
                    email: "admin@sfanow.in"
                }];
                emailData.filename = "e-player/receipt.ejs";
                emailData.subject = "SFA: Your Payment Receipt as an Athlete for SFA " + emailData.city + " " + emailData.eventYear + ".";
                console.log("emaildata", emailData);
                Config.emailTo(emailData, function (err, emailRespo) {
                    if (err) {
                        console.log(err);
                        callback(null, err);
                    } else {
                        callback(null, emailRespo);
                    }
                });

            },

        ], function (err, complete) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, complete);
            }
        })
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
        emailData.filename = "e-player-school/emailOtp.ejs";
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
                    Accounts.findOne({
                        athlete: data._id
                    }).lean().exec(function (err, accountData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(accountData)) {
                                callback(null, []);
                            } else {
                                callback(null, property, accountData);
                            }
                        }
                    });
                },
                function (property, accountData, callback) {
                    Package.findOne({
                        _id: data.package._id
                    }).lean().exec(function (err, package) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(accountData)) {
                                callback(null, []);
                            } else {
                                callback(null, property, accountData, package);
                            }
                        }
                    });
                },
                function (property, accountData, package, callback) {
                    var packageId = {};
                    packageId._id = data.package._id;
                    Featurepackage.featureDetailByPackage(packageId, function (err, features) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(features)) {
                                callback(null, []);
                            } else {
                                var finalData = {};
                                finalData.features = features;
                                finalData.property = property;
                                finalData.accountData = accountData;
                                finalData.package = package;
                                callback(null, finalData);
                            }
                        }
                    });
                },
                function (finalData, callback) {
                    var property = finalData.property;
                    var accountData = finalData.accountData;
                    var features = finalData.features;
                    var package = finalData.package;
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
                                emailData.playerUrl = property[0].playerUrl;
                                emailData.infoNo = property[0].infoNo;
                                emailData.cityAddress = property[0].cityAddress;
                                emailData.ddFavour = property[0].ddFavour;
                                emailData.amount = accountData.totalPaid;
                                emailData.packageName = package.name;
                                emailData.packageOrder = package.order;
                                emailData.featureDetail = features;
                                emailData.registrationFee = data.registrationFee;
                                emailData.filename = "e-player/playerRegistration.ejs";
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
                    Accounts.findOne({
                        athlete: data._id
                    }).lean().exec(function (err, accountData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(accountData)) {
                                callback(null, []);
                            } else {
                                callback(null, property, accountData);
                            }
                        }
                    });
                },
                function (property, accountData, callback) {
                    Package.findOne({
                        _id: data.package
                    }).lean().exec(function (err, package) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(accountData)) {
                                callback(null, []);
                            } else {
                                callback(null, property, accountData, package);
                            }
                        }
                    });
                },
                function (property, accountData, package, callback) {
                    var packageId = {};
                    packageId._id = data.package;
                    Featurepackage.featureDetailByPackage(packageId, function (err, features) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(features)) {
                                callback(null, []);
                            } else {
                                var finalData = {};
                                finalData.features = features;
                                finalData.property = property;
                                finalData.accountData = accountData;
                                finalData.package = package;
                                callback(null, finalData);
                            }
                        }
                    });
                },
                function (finalData, callback) {
                    var property = finalData.property;
                    var accountData = finalData.accountData;
                    var features = finalData.features;
                    var package = finalData.package;
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
                                emailData.playerUrl = property[0].playerUrl;
                                emailData.cityAddress = property[0].cityAddress;
                                emailData.ddFavour = property[0].ddFavour;
                                emailData.amount = accountData.outstandingAmount;
                                emailData.packageName = package.name;
                                emailData.packageOrder = package.order;
                                emailData.featureDetail = features;
                                emailData.registrationFee = data.registrationFee;
                                emailData.filename = "e-player/playerRegistration.ejs";
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
                    var packageId = {};
                    packageId._id = data.package._id;
                    Featurepackage.featureDetailByPackage(packageId, function (err, features) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(features)) {
                                callback(null, []);
                            } else {
                                callback(null, property, features);
                            }
                        }
                    });
                },
                function (property, features, callback) {
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
                                emailData.sfaId = data.sfaId;
                                emailData.password = data.password;
                                emailData.name = data.firstName;
                                emailData.city = property[0].sfaCity;
                                emailData.year = property[0].year;
                                emailData.playerUrl = property[0].playerUrl;
                                emailData.schoolUrl = property[0].schoolUrl;
                                emailData.eventYear = property[0].eventYear;
                                emailData.type = property[0].institutionType;
                                emailData.packageName = data.package.name;
                                emailData.packageOrder = data.package.order;
                                emailData.featureDetail = features;
                                emailData.flag = 'athlete';
                                emailData.filename = "e-player-school/verification.ejs";
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
                                // emailData.sfaId = data.sfaID;
                                emailData.password = data.password;
                                emailData.city = property[0].sfaCity;
                                emailData.year = property[0].year;
                                emailData.eventYear = property[0].eventYear;
                                emailData.type = property[0].institutionType;
                                emailData.filename = "e-player-school/rejection.ejs";
                                emailData.subject = "SFA: Rejection of Your Application for SFA " + emailData.city + " " + emailData.eventYear;
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
                    Accounts.findOne({
                        athlete: data._id
                    }).lean().exec(function (err, accountData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(accountData)) {
                                callback(null, []);
                            } else {
                                callback(null, property, accountData);
                            }
                        }
                    });
                },
                function (property, accountData, callback) {
                    Package.findOne({
                        _id: data.package._id
                    }).lean().exec(function (err, package) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(accountData)) {
                                callback(null, []);
                            } else {
                                callback(null, property, accountData, package);
                            }
                        }
                    });
                },
                function (property, accountData, package, callback) {
                    var packageId = {};
                    packageId._id = data.package._id;
                    Featurepackage.featureDetailByPackage(packageId, function (err, features) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(features)) {
                                callback(null, []);
                            } else {
                                var finalData = {};
                                finalData.features = features;
                                finalData.property = property;
                                finalData.accountData = accountData;
                                finalData.package = package;
                                callback(null, finalData);
                            }
                        }
                    });
                },
                function (finalData, callback) {
                    var property = finalData.property;
                    var accountData = finalData.accountData;
                    var features = finalData.features;
                    var package = finalData.package;
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
                                emailData.amount = accountData.totalPaid;
                                emailData.playerUrl = property[0].playerUrl;
                                emailData.packageName = data.package.name;
                                emailData.packageOrder = data.package.order;
                                emailData.featureDetail = features;
                                emailData.registrationFee = data.registrationFee;
                                emailData.filename = "e-player/playerRegistration.ejs";
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
                    Accounts.findOne({
                        athlete: data._id
                    }).lean().exec(function (err, accountData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(accountData)) {
                                callback(null, []);
                            } else {
                                callback(null, property, accountData);
                            }
                        }
                    });
                },
                function (property, accountData, callback) {
                    Package.findOne({
                        _id: data.package
                    }).lean().exec(function (err, package) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(accountData)) {
                                callback(null, []);
                            } else {
                                callback(null, property, accountData, package);
                            }
                        }
                    });
                },
                function (property, accountData, package, callback) {
                    var packageId = {};
                    packageId._id = data.package;
                    Featurepackage.featureDetailByPackage(packageId, function (err, features) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(features)) {
                                callback(null, []);
                            } else {
                                var finalData = {};
                                finalData.features = features;
                                finalData.property = property;
                                finalData.accountData = accountData;
                                finalData.package = package;
                                callback(null, finalData);
                            }
                        }
                    });
                },
                function (finalData, callback) {
                    var property = finalData.property;
                    var accountData = finalData.accountData;
                    var features = finalData.features;
                    var package = finalData.package;
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
                                emailData.playerUrl = property[0].playerUrl;
                                emailData.amount = accountData.outstandingAmount;
                                emailData.packageName = package.name;
                                emailData.packageOrder = package.order;
                                emailData.featureDetail = features;
                                emailData.registrationFee = data.registrationFee;
                                emailData.filename = "e-player/playerRegistration.ejs";
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
                        if (n.Document_Status) {
                            obj.Document_Status = n.Document_Status;
                        } else {
                            obj.Document_Status = "";
                        }
                        if (n.Photo_ID) {
                            obj.Photo_ID = n.Photo_ID;
                        } else {
                            obj.Photo_ID = "";
                        }

                        if (n.School_Id) {
                            obj.School_Id = n.School_Id;
                        } else {
                            obj.School_Id = "";
                        }

                        if (n.Age_Proof) {
                            obj.Age_Proof = n.Age_Proof;
                        } else {
                            obj.Age_Proof = "";
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
                if (n.Document_Status) {
                    obj.Document_Status = n.Document_Status;
                } else {
                    obj.Document_Status = "";
                }
                if (n.Photo_ID) {
                    obj.Photo_ID = n.Photo_ID;
                } else {
                    obj.Photo_ID = "";
                }

                if (n.School_Id) {
                    obj.School_Id = n.School_Id;
                } else {
                    obj.School_Id = "";
                }

                if (n.Age_Proof) {
                    obj.Age_Proof = n.Age_Proof;
                } else {
                    obj.Age_Proof = "";
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
                    Accounts.findOne({
                        athlete: data1._id
                    }).lean().deepPopulate("transaction transaction.package").exec(function (err, accountsData) {
                        if (err || _.isEmpty(accountsData)) {
                            callback(null, "no accounts data");
                        } else {
                            if (data1.registrationFee == "cash") {
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
                                    if (accountsData.upgrade) {
                                        emailData.upgrade = accountsData.upgrade;
                                    } else {
                                        emailData.upgrade = false;
                                    }
                                    emailData.player = true;
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
                                    emailData.filename = "e-reminders/paymentRegistration.ejs";
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
                                    if (accountsData.upgrade) {
                                        emailData.upgrade = accountsData.upgrade;
                                    } else {
                                        emailData.upgrade = false;
                                    }
                                    emailData.player = true;
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
                                    emailData.filename = "e-reminders/paymentRegistration.ejs";
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
                        }
                    });

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
            if (athleteData.Document_Status) {
                obj.Document_Status = athleteData.Document_Status;
            } else {
                obj.Document_Status = "";
            }
            if (athleteData.Photo_ID) {
                obj.Photo_ID = athleteData.Photo_ID;
            } else {
                obj.Photo_ID = "";
            }

            if (athleteData.School_Id) {
                obj.School_Id = athleteData.School_Id;
            } else {
                obj.School_Id = "";
            }

            if (athleteData.Age_Proof) {
                obj.Age_Proof = athleteData.Age_Proof;
            } else {
                obj.Age_Proof = "";
            }
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
    },

    generateOtp: function () {
        return (Math.random() + "").substring(2, 6);
    },

    sendOTPMobile: function (data, callback) {
        var smsData = {};
        smsData.mobile = data.mobile;
        smsData.content = data.content + data.otp;
        Config.sendSms(smsData, function (err, smsRespo) {
            console.log("err, smsRespo", err, smsRespo);
            if (err) {
                console.log(err);
                callback(err, null);
            } else if (smsRespo) {
                console.log(null, "sms sent");
                callback(null, "sms sent")
            } else {
                callback(null, "Invalid data");
            }
        });
    },

    getOneAthlete: function (data, callback) {
        async.waterfall([
            function (callback) {
                Athelete.findOne({
                    _id: data._id
                }, function (err, complete) {
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
            function (response, callback) {
                var final = {};
                final.athlete = response;
                Accounts.findOne({
                    athlete: response._id
                }).lean().deepPopulate("transaction,transaction.package").exec(function (err, found) {
                    if (err) {
                        callback(null, final);
                    } else {
                        if (_.isEmpty(found)) {
                            callback(null, final);
                        } else {
                            var accounts = {};
                            var i = 1;
                            accounts.paymentMode = found.paymentMode;
                            accounts.payuId = found.PayuId;
                            accounts.AmountPaid = found.totalPaid;
                            accounts.AmountToPay = found.totalToPay;
                            accounts.outstandingAmount = found.outstandingAmount;
                            accounts.sgst = found.sgst;
                            accounts.cgst = found.cgst;
                            accounts.discount = found.discount;
                            accounts.receiptId = found.receiptId;
                            if (found.remarks) {
                                accounts.remarks = found.remarks;
                            }
                            if (found.checkNo) {
                                accounts.checkNo = found.checkNo;
                            }
                            _.each(found.transaction, function (n) {
                                accounts["package" + i] = {};
                                accounts["package" + i].name = n.package.name;
                                accounts["package" + i].date = n.createdAt;
                                accounts["package" + i].dateOfTransaction = n.dateOfTransaction;
                                accounts["package" + i].user = n.package.packageUser;
                                accounts["package" + i].amount = n.package.finalPrice;
                                i++;

                            });
                            final.display = accounts;
                            callback(null, final);
                        }
                    }
                });


            }
        ], function (err, results) {
            if (err) {
                callback(err, null);
            } else {
                if (_.isEmpty(results)) {
                    callback(null, []);
                } else {
                    callback(null, results);
                }
            }
        });


    },

    getOTP: function (data, callback) {
        var otp = "";
        async.waterfall([
            // generate 4-digit OTP
            function (callback) {
                otp = Athelete.generateOtp();
                console.log("otp", otp);
                callback();
            },
            // send OTP on Mobile
            function (callback) {
                if (data.mobile) {
                    console.log("OTP Sent On Mobile");
                    var mobileObj = {
                        "otp": otp,
                        "mobile": data.mobile,
                        "content": "OTP Athlete: Your Mobile OTP (One time Password) for SFA registration is "
                    };
                    Athelete.sendOTPMobile(mobileObj, callback);
                    // callback(null, "Move Ahead");
                } else {
                    callback(null, "Move Ahead");
                }
            },

            // send OTP on email
            function (resp, callback) {
                if (data.email) {
                    console.log("OTP Sent On Email");
                    var emailObj = {
                        "otp": otp,
                        "mobile": data.mobile,
                        "content": "OTP Athlete: Your Email OTP (One time Password) for SFA registration is ",
                        "from": "info@sfanow.in",
                        "filename": "e-player-school/emailOtp.ejs",
                        "subject": "SFA: Your Email OTP (One time Password) for SFA registration is"
                    };
                    ConfigProperty.find().lean().exec(function (err, property) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(property)) {
                                callback(null, []);
                            } else {
                                emailObj.sfaid = data.sfaId;
                                emailObj.email = data.email;
                                emailObj.city = property[0].sfaCity;
                                emailObj.year = property[0].year;
                                emailObj.eventYear = property[0].eventYear;
                                emailObj.infoNo = property[0].infoNo;
                                emailObj.cityAddress = property[0].cityAddress;
                                emailObj.ddFavour = property[0].ddFavour;
                                Config.email(emailObj, callback);
                            }
                        }
                    });
                } else {
                    callback(null, "Move Ahead");
                }
            },

            // send final Obj
            function (resp, callback) {
                if (data.email && data.mobile) {
                    var sendObj = {
                        "sfaId": data.sfaId,
                        "mobile": data.mobile,
                        "email": data.email,
                        "otp": otp
                    };
                } else if (data.email) {
                    var sendObj = {
                        "sfaId": data.sfaId,
                        "email": data.email,
                        "otp": otp
                    };
                } else if (data.mobile) {
                    var sendObj = {
                        "sfaId": data.sfaId,
                        "mobile": data.mobile,
                        "otp": otp
                    };
                } else {
                    var sendObj = {
                        "sfaId": data.sfaId,
                        "otp": otp
                    };
                }
                // var sendObj = {
                //     "sfaId": data.sfaId,
                //     "mobile": data.mobile,
                //     "email": data.email,
                //     "otp": otp
                // };
                callback(null, sendObj);
            }
        ], callback);

    },

    cronAthleteWithSportsRegistrationDue: function (data, callback) {
        async.waterfall([
                function (callback) {

                },
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
                    async.each(targetAthlete, function (n, callback) {
                        Accounts.findOne({
                            athlete: n._id
                        }).lean().deepPopulate("transaction transaction.package").exec(function (err, accountsData) {
                            if (err || _.isEmpty(accountsData)) {
                                callback(null, "no accounts data");
                            } else {
                                if (data1.registrationFee == "cash") {
                                    var now = moment(new Date()); //todays date
                                    var end = moment(data1.createdAt); // another date
                                    var duration = moment.duration(now.diff(end));
                                    var dump = duration.asDays();
                                    var days = parseInt(dump);
                                    console.log("days", days);
                                    var emailData = {};
                                    // emailData.from = "info@sfanow.in";
                                    emailData.from = data.property.infoId;
                                    emailData.infoId = data.property.infoId;
                                    if (accountsData.upgrade) {
                                        emailData.upgrade = accountsData.upgrade;
                                    } else {
                                        emailData.upgrade = false;
                                    }
                                    // emailData.player = true;
                                    emailData.infoNo = data.property.infoNo;
                                    emailData.cityAddress = data.property.cityAddress;
                                    emailData.ddFavour = data.property.ddFavour;
                                    emailData.city = data.property.sfaCity;
                                    emailData.year = data.property.year;
                                    emailData.playerUrl = data.property.playerUrl;
                                    emailData.schoolUrl = data.property.schoolUrl;
                                    emailData.eventYear = data.property.eventYear;
                                    emailData.sfaId = n.sfaId;
                                    emailData.password = n.password;
                                    emailData.email = data1.email;
                                    emailData.filename = "e-reminders/sportRegistrationReminder.ejs";
                                    emailData.subject = "SFA: Your Sport Registration Reminder for SFA " + emailData.city + " " + emailData.eventYear;
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
                                    callback(null, "hidden athlete found");
                                }
                            }
                        });
                    }, function (err, data3) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, data3);
                        }
                    })
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

    delete: function (data, callback) {
        async.waterfall([
            function (callback) {
                Athelete.remove({
                    _id: data._id
                }).exec(function (err, found) {
                    if (err || _.isEmpty(found)) {
                        callback(null, {
                            error: "no data removed",
                            data: data
                        });
                    } else {
                        callback(null, found);
                    }
                })
            },
            function (found, callback) {
                if (found.error) {
                    callback(null, found);
                } else {
                    Accounts.remove({
                        athlete: data._id
                    }).exec(function (err, found) {
                        if (err || _.isEmpty(found)) {
                            callback(null, {
                                error: "no data removed",
                                data: data
                            });
                        } else {
                            callback(null, found);
                        }
                    });
                }
            },
            function (found, callback) {
                if (found.error) {
                    callback(null, found);
                } else {
                    Transaction.remove({
                        athlete: data._id
                    }).exec(function (err, found) {
                        if (err || _.isEmpty(found)) {
                            callback(null, {
                                error: "no data removed",
                                data: data
                            });
                        } else {
                            callback(null, found);
                        }
                    });
                }
            }
        ], function (err, data3) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, data3);
            }
        });
    },
};
module.exports = _.assign(module.exports, exports, model);