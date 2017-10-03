var schema = new Schema({
    gender: String,
    year: String,
    minPlayers: Number,
    maxPlayers: Number,
    sportslist: {
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'SportsList'
        },
        name: String,
        sporttype: String
    },
    agegroup: {
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'Agegroup'
        },
        name: String
    },
    firstcategory: {
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'FirstCategory'
        },
        name: String
    },
    secondcategory: {

        _id: {
            type: Schema.Types.ObjectId,
            ref: 'SecondCategory'
        },
        name: String

    },
    thirdcategory: {

        _id: {
            type: Schema.Types.ObjectId,
            ref: 'ThirdCategory'
        },
        name: String

    },
    drawFormat: String
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('OldSport', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getAllTeam: function (data, callback) {
        var sport = {};
        async.waterfall([
                function (callback) {
                    OldSport.find({
                        year: data.year,
                        "sportslist.sporttype": "Team"
                    }).lean().exec(function (err, oldSportData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(oldSportData)) {
                                callback(null, []);
                            } else {
                                callback(null, oldSportData);
                            }
                        }
                    });
                },
                function (oldSportData, callback) {
                    var team = _.groupBy(oldSportData, "sportslist.name");
                    var arr = _.keys(team);
                    var sportlist;
                    async.eachSeries(team, function (sportData, callback) {
                            async.waterfall([
                                function (callback) {
                                    OldSport.saveCategory(sportData, function (err, category) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(category)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, category);
                                            }
                                        }
                                    });
                                },
                                function (category, callback) {
                                    console.log("category", category);
                                    OldSport.saveSportsListSubCategory(sportData, category, function (err, subCategory) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(subCategory)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, subCategory);
                                            }
                                        }
                                    });
                                },
                                function (subCategory, callback) {
                                    console.log("sportlist inside", subCategory);
                                    OldSport.saveSportsList(sportData, subCategory, function (err, drawFormat) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(drawFormat)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, drawFormat);
                                            }
                                        }
                                    });
                                },
                                function (drawFormat, callback) {
                                    async.eachSeries(sportData, function (singleData, callback) {
                                            console.log("category", singleData);
                                            async.waterfall([
                                                    function (callback) {
                                                        OldSport.saveAge(singleData, function (err, ageData) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(ageData)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    sport.sportslist = drawFormat._id;
                                                                    sport.ageGroup = ageData._id;
                                                                    console.log("drawFormat", sport);
                                                                    callback(null, sport);
                                                                }
                                                            }
                                                        });
                                                    },
                                                    function (sport, callback) {
                                                        OldSport.saveSport(singleData, sport, function (err, drawFormat) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(drawFormat)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    callback(null, drawFormat);
                                                                }
                                                            }
                                                        });
                                                    },
                                                ],
                                                function (err, found) {
                                                    if (found) {
                                                        callback(null, found);
                                                    } else {
                                                        callback(null, found);
                                                    }
                                                });
                                        },
                                        function (err, found) {
                                            callback(null, found);
                                        });
                                },
                            ], function (err, found) {
                                sport = {};
                                callback(null, found);
                            });
                        },
                        function (err, found) {
                            callback(null, found);
                        });
                }
            ],
            function (err, found) {
                if (found) {
                    callback(null, found);
                } else {
                    callback(null, found);
                }
            });
    },

    getAllRacquetSingle: function (data, callback) {
        var sport = {};
        async.waterfall([
                function (callback) {
                    OldSport.find({
                        year: data.year,
                        "sportslist.sporttype": "Racquet",
                        "firstcategory.name": "Singles"
                    }).lean().exec(function (err, oldSportData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(oldSportData)) {
                                callback(null, []);
                            } else {
                                callback(null, oldSportData);
                            }
                        }
                    });
                },
                function (oldSportData, callback) {
                    var team = _.groupBy(oldSportData, "sportslist.name");
                    var arr = _.keys(team);

                    var sportlist;
                    // callback(null, team);
                    async.eachSeries(team, function (sportData, callback) {
                            console.log("sportData", sportData.length);
                            async.waterfall([
                                function (callback) {
                                    OldSport.saveCategory(sportData, function (err, category) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(category)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, category);
                                            }
                                        }
                                    });
                                },
                                function (category, callback) {
                                    console.log("category", category);
                                    OldSport.saveSportsListSubCategory(sportData, category, function (err, subCategory) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(subCategory)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, subCategory);
                                            }
                                        }
                                    });
                                },
                                function (subCategory, callback) {
                                    console.log("sportlist inside", subCategory);
                                    OldSport.saveSportsList(sportData, subCategory, function (err, drawFormat) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(drawFormat)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, drawFormat);
                                            }
                                        }
                                    });
                                },
                                function (drawFormat, callback) {
                                    async.eachSeries(sportData, function (singleData, callback) {
                                            console.log("category", singleData);
                                            async.waterfall([
                                                    function (callback) {
                                                        OldSport.saveAge(singleData, function (err, ageData) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(ageData)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    sport.sportslist = drawFormat._id;
                                                                    sport.ageGroup = ageData._id;
                                                                    console.log("drawFormat", sport);
                                                                    callback(null, sport);
                                                                }
                                                            }
                                                        });
                                                    },
                                                    function (sport, callback) {
                                                        OldSport.saveSport(singleData, sport, function (err, drawFormat) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(drawFormat)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    callback(null, drawFormat);
                                                                }
                                                            }
                                                        });
                                                    },
                                                ],
                                                function (err, found) {
                                                    if (found) {
                                                        callback(null, found);
                                                    } else {
                                                        callback(null, found);
                                                    }
                                                });
                                        },
                                        function (err, found) {
                                            callback(null, found);
                                        });
                                },
                            ], function (err, found) {
                                sport = {};
                                callback(null, found);
                            });
                        },
                        function (err, found) {
                            callback(null, found);
                        });
                }
            ],
            function (err, found) {
                if (found) {
                    callback(null, found);
                } else {
                    callback(null, found);
                }
            });

    },

    getAllRacquetDouble: function (data, callback) {
        var sport = {};
        async.waterfall([
                function (callback) {
                    OldSport.find({
                        year: data.year,
                        "sportslist.sporttype": "Racquet",
                        "firstcategory.name": "Doubles"
                    }).lean().exec(function (err, oldSportData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(oldSportData)) {
                                callback(null, []);
                            } else {
                                callback(null, oldSportData);
                            }
                        }
                    });
                },
                function (oldSportData, callback) {
                    var team = _.groupBy(oldSportData, "sportslist.name");
                    var arr = _.keys(team);

                    var sportlist;
                    // callback(null, team);
                    async.eachSeries(team, function (sportData, callback) {
                            console.log("sportData", sportData.length);
                            async.waterfall([
                                function (callback) {
                                    OldSport.saveCategory(sportData, function (err, category) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(category)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, category);
                                            }
                                        }
                                    });
                                },
                                function (category, callback) {
                                    console.log("category", category);
                                    OldSport.saveSportsListSubCategory(sportData, category, function (err, subCategory) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(subCategory)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, subCategory);
                                            }
                                        }
                                    });
                                },
                                function (subCategory, callback) {
                                    console.log("sportlist inside", subCategory);
                                    OldSport.saveSportsList(sportData, subCategory, function (err, drawFormat) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(drawFormat)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, drawFormat);
                                            }
                                        }
                                    });
                                },
                                function (drawFormat, callback) {
                                    async.eachSeries(sportData, function (singleData, callback) {
                                            console.log("category", singleData);
                                            async.waterfall([
                                                    function (callback) {
                                                        OldSport.saveAge(singleData, function (err, ageData) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(ageData)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    sport.sportslist = drawFormat._id;
                                                                    sport.ageGroup = ageData._id;
                                                                    console.log("drawFormat", sport);
                                                                    callback(null, sport);
                                                                }
                                                            }
                                                        });
                                                    },
                                                    function (sport, callback) {
                                                        OldSport.saveSport(singleData, sport, function (err, drawFormat) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(drawFormat)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    callback(null, drawFormat);
                                                                }
                                                            }
                                                        });
                                                    },
                                                ],
                                                function (err, found) {
                                                    if (found) {
                                                        callback(null, found);
                                                    } else {
                                                        callback(null, found);
                                                    }
                                                });
                                        },
                                        function (err, found) {
                                            callback(null, found);
                                        });
                                },
                            ], function (err, found) {
                                sport = {};
                                callback(null, found);
                            });
                        },
                        function (err, found) {
                            callback(null, found);
                        });
                }
            ],
            function (err, found) {
                if (found) {
                    callback(null, found);
                } else {
                    callback(null, found);
                }
            });

    },

    getAllAcquatics: function (data, callback) {
        var sport = {};
        async.waterfall([
                function (callback) {
                    OldSport.find({
                        year: data.year,
                        "sportslist.sporttype": "Aquatics"
                    }).lean().exec(function (err, oldSportData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(oldSportData)) {
                                callback(null, []);
                            } else {
                                callback(null, oldSportData);
                            }
                        }
                    });
                },
                function (oldSportData, callback) {
                    var team = _.groupBy(oldSportData, "sportslist.name");
                    var arr = _.keys(team);
                    var sportlist;
                    async.eachSeries(team, function (sportData, callback) {
                            async.waterfall([
                                function (callback) {
                                    OldSport.saveCategory(sportData, function (err, category) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(category)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, category);
                                            }
                                        }
                                    });
                                },
                                function (category, callback) {
                                    console.log("category", category);
                                    OldSport.saveSportsListSubCategory(sportData, category, function (err, subCategory) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(subCategory)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, subCategory);
                                            }
                                        }
                                    });
                                },

                                function (subCategory, callback) {
                                    async.eachSeries(sportData, function (singleData, callback) {
                                            console.log("category", singleData);
                                            async.waterfall([
                                                    function (callback) {
                                                        console.log("sportlist inside", subCategory);
                                                        if (singleData.sportslist.name == "Water Polo") {
                                                            sportData.isTeam = true;
                                                            var param = [];
                                                            param.push(singleData);
                                                            OldSport.saveSportsList(param, subCategory, function (err, drawFormat) {
                                                                if (err) {
                                                                    callback(err, null);
                                                                } else {
                                                                    if (_.isEmpty(drawFormat)) {
                                                                        callback(null, []);
                                                                    } else {
                                                                        callback(null, drawFormat);
                                                                    }
                                                                }
                                                            });
                                                        } else {
                                                            OldSport.saveSportsListAcquatics(singleData, subCategory, function (err, drawFormat) {
                                                                if (err) {
                                                                    callback(err, null);
                                                                } else {
                                                                    if (_.isEmpty(drawFormat)) {
                                                                        callback(null, []);
                                                                    } else {
                                                                        callback(null, drawFormat);
                                                                    }
                                                                }
                                                            });
                                                        }
                                                    },
                                                    function (drawFormat, callback) {
                                                        OldSport.saveAge(singleData, function (err, ageData) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(ageData)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    sport.sportslist = drawFormat._id;
                                                                    sport.ageGroup = ageData._id;
                                                                    console.log("drawFormat", sport);
                                                                    callback(null, sport);
                                                                }
                                                            }
                                                        });
                                                    },
                                                    function (sport, callback) {
                                                        OldSport.saveSport(singleData, sport, function (err, drawFormat) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(drawFormat)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    callback(null, drawFormat);
                                                                }
                                                            }
                                                        });
                                                    },
                                                ],
                                                function (err, found) {
                                                    if (found) {
                                                        callback(null, found);
                                                    } else {
                                                        callback(null, found);
                                                    }
                                                });
                                        },
                                        function (err, found) {
                                            callback(null, found);
                                        });
                                },
                            ], function (err, found) {
                                sport = {};
                                callback(null, found);
                            });
                        },
                        function (err, found) {
                            callback(null, found);
                        });
                }
            ],
            function (err, found) {
                if (found) {
                    callback(null, found);
                } else {
                    callback(null, found);
                }
            });
    },

    getAllTarget: function (data, callback) {
        var sport = {};
        async.waterfall([
                function (callback) {
                    OldSport.find({
                        year: data.year,
                        "sportslist.sporttype": "Target"
                    }).lean().exec(function (err, oldSportData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(oldSportData)) {
                                callback(null, []);
                            } else {
                                callback(null, oldSportData);
                            }
                        }
                    });
                },
                function (oldSportData, callback) {
                    var team = _.groupBy(oldSportData, "sportslist.name");
                    var arr = _.keys(team);
                    var sportlist;
                    async.eachSeries(team, function (sportData, callback) {
                            async.waterfall([
                                function (callback) {
                                    OldSport.saveCategory(sportData, function (err, category) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(category)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, category);
                                            }
                                        }
                                    });
                                },
                                function (category, callback) {
                                    console.log("category", category);
                                    OldSport.saveSportsListSubCategory(sportData, category, function (err, subCategory) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(subCategory)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, subCategory);
                                            }
                                        }
                                    });
                                },

                                function (subCategory, callback) {
                                    async.eachSeries(sportData, function (singleData, callback) {
                                            console.log("category", singleData);
                                            async.waterfall([
                                                    function (callback) {
                                                        console.log("sportlist inside", subCategory);
                                                        OldSport.saveSportsListAcquatics(singleData, subCategory, function (err, drawFormat) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(drawFormat)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    callback(null, drawFormat);
                                                                }
                                                            }
                                                        });
                                                    },
                                                    function (drawFormat, callback) {
                                                        OldSport.saveAge(singleData, function (err, ageData) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(ageData)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    sport.sportslist = drawFormat._id;
                                                                    sport.ageGroup = ageData._id;
                                                                    console.log("drawFormat", sport);
                                                                    callback(null, sport);
                                                                }
                                                            }
                                                        });
                                                    },
                                                    function (sport, callback) {
                                                        OldSport.saveSport(singleData, sport, function (err, drawFormat) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(drawFormat)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    callback(null, drawFormat);
                                                                }
                                                            }
                                                        });
                                                    },
                                                ],
                                                function (err, found) {
                                                    if (found) {
                                                        callback(null, found);
                                                    } else {
                                                        callback(null, found);
                                                    }
                                                });
                                        },
                                        function (err, found) {
                                            callback(null, found);
                                        });
                                },
                            ], function (err, found) {
                                sport = {};
                                callback(null, found);
                            });
                        },
                        function (err, found) {
                            callback(null, found);
                        });
                }
            ],
            function (err, found) {
                if (found) {
                    callback(null, found);
                } else {
                    callback(null, found);
                }
            });
    },

    getAllCombat: function (data, callback) {
        var sport = {};
        async.waterfall([
                function (callback) {
                    OldSport.find({
                        year: data.year,
                        "sportslist.sporttype": "Combat"
                    }).lean().exec(function (err, oldSportData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(oldSportData)) {
                                callback(null, []);
                            } else {
                                callback(null, oldSportData);
                            }
                        }
                    });
                },
                function (oldSportData, callback) {
                    var team = _.groupBy(oldSportData, "sportslist.name");
                    var arr = _.keys(team);
                    var sportlist;
                    callback(null, team);
                }
            ],
            function (err, found) {
                if (found) {
                    callback(null, found);
                } else {
                    callback(null, found);
                }
            });
    },

    getAllIndividual: function (data, callback) {
        var sport = {};
        async.waterfall([
                function (callback) {
                    OldSport.find({
                        year: data.year,
                        "sportslist.sporttype": "Individual"
                    }).lean().exec(function (err, oldSportData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(oldSportData)) {
                                callback(null, []);
                            } else {
                                callback(null, oldSportData);
                            }
                        }
                    });
                },
                function (oldSportData, callback) {
                    var team = _.groupBy(oldSportData, "sportslist.name");
                    var arr = _.keys(team);
                    var sportlist;
                    async.eachSeries(team, function (sportData, callback) {
                            async.waterfall([
                                function (callback) {
                                    OldSport.saveCategory(sportData, function (err, category) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(category)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, category);
                                            }
                                        }
                                    });
                                },
                                function (category, callback) {
                                    console.log("category", category);
                                    OldSport.saveSportsListSubCategory(sportData, category, function (err, subCategory) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(subCategory)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, subCategory);
                                            }
                                        }
                                    });
                                },

                                function (subCategory, callback) {
                                    async.eachSeries(sportData, function (singleData, callback) {
                                            console.log("category", singleData);
                                            async.waterfall([
                                                    function (callback) {
                                                        console.log("sportlist inside", subCategory);
                                                        sportData.isTeam = false;
                                                        var param = [];
                                                        param.push(singleData);
                                                        OldSport.saveSportsList(param, subCategory, function (err, drawFormat) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(drawFormat)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    callback(null, drawFormat);
                                                                }
                                                            }
                                                        });
                                                    },
                                                    function (drawFormat, callback) {
                                                        if (singleData.agegroup) {
                                                            OldSport.saveAge(singleData, function (err, ageData) {
                                                                if (err) {
                                                                    callback(err, null);
                                                                } else {
                                                                    if (_.isEmpty(ageData)) {
                                                                        callback(null, []);
                                                                    } else {
                                                                        sport.sportslist = drawFormat._id;
                                                                        sport.ageGroup = ageData._id;
                                                                        console.log("drawFormat", sport);
                                                                        callback(null, sport);
                                                                    }
                                                                }
                                                            });
                                                        } else {
                                                            callback(null, {
                                                                error: "no agegroup found",
                                                                data: sportData
                                                            });
                                                        }
                                                    },
                                                    function (sport, callback) {
                                                        if (sport.error) {
                                                            callback(null, sport);
                                                        } else {
                                                            OldSport.saveSport(singleData, sport, function (err, drawFormat) {
                                                                if (err) {
                                                                    callback(err, null);
                                                                } else {
                                                                    if (_.isEmpty(drawFormat)) {
                                                                        callback(null, []);
                                                                    } else {
                                                                        callback(null, drawFormat);
                                                                    }
                                                                }
                                                            });
                                                        }
                                                    },
                                                ],
                                                function (err, found) {
                                                    if (found) {
                                                        callback(null, found);
                                                    } else {
                                                        callback(null, found);
                                                    }
                                                });
                                        },
                                        function (err, found) {
                                            callback(null, found);
                                        });
                                },
                            ], function (err, found) {
                                sport = {};
                                callback(null, found);
                            });
                        },
                        function (err, found) {
                            callback(null, found);
                        });
                }
            ],
            function (err, found) {
                if (found) {
                    callback(null, found);
                } else {
                    callback(null, found);
                }
            });
    },

    getAllFencing: function (data, callback) {
        var sport = {};
        async.waterfall([
                function (callback) {
                    OldSport.find({
                        year: data.year,
                        "sportslist.sporttype": "Combat",
                        "sportslist.name": "Fencing",
                    }).lean().exec(function (err, oldSportData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(oldSportData)) {
                                callback(null, []);
                            } else {
                                callback(null, oldSportData);
                            }
                        }
                    });
                },
                function (oldSportData, callback) {
                    var team = _.groupBy(oldSportData, "sportslist.name");
                    var arr = _.keys(team);
                    var sportlist;
                    async.eachSeries(team, function (sportData, callback) {
                            async.waterfall([
                                function (callback) {
                                    OldSport.saveCategory(sportData, function (err, category) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(category)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, category);
                                            }
                                        }
                                    });
                                },
                                function (category, callback) {
                                    console.log("category", category);
                                    OldSport.saveSportsListSubCategory(sportData, category, function (err, subCategory) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(subCategory)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, subCategory);
                                            }
                                        }
                                    });
                                },

                                function (subCategory, callback) {
                                    async.eachSeries(sportData, function (singleData, callback) {
                                            console.log("category", singleData);
                                            async.waterfall([
                                                    function (callback) {
                                                        console.log("sportlist inside", subCategory);
                                                        OldSport.saveSportsListAcquatics(singleData, subCategory, function (err, drawFormat) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(drawFormat)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    callback(null, drawFormat);
                                                                }
                                                            }
                                                        });
                                                    },
                                                    function (drawFormat, callback) {
                                                        OldSport.saveAge(singleData, function (err, ageData) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(ageData)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    sport.sportslist = drawFormat._id;
                                                                    sport.ageGroup = ageData._id;
                                                                    console.log("drawFormat", sport);
                                                                    callback(null, sport);
                                                                }
                                                            }
                                                        });
                                                    },
                                                    function (sport, callback) {
                                                        OldSport.saveSport(singleData, sport, function (err, drawFormat) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(drawFormat)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    callback(null, drawFormat);
                                                                }
                                                            }
                                                        });
                                                    },
                                                ],
                                                function (err, found) {
                                                    if (found) {
                                                        callback(null, found);
                                                    } else {
                                                        callback(null, found);
                                                    }
                                                });
                                        },
                                        function (err, found) {
                                            callback(null, found);
                                        });
                                },
                            ], function (err, found) {
                                sport = {};
                                callback(null, found);
                            });
                        },
                        function (err, found) {
                            callback(null, found);
                        });
                }
            ],
            function (err, found) {
                if (found) {
                    callback(null, found);
                } else {
                    callback(null, found);
                }
            });
    },

    getAllJudo: function (data, callback) {
        var sport = {};
        async.waterfall([
                function (callback) {
                    OldSport.find({
                        year: data.year,
                        "sportslist.sporttype": "Combat",
                        "sportslist.name": "Judo"
                    }).lean().exec(function (err, oldSportData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(oldSportData)) {
                                callback(null, []);
                            } else {
                                callback(null, oldSportData);
                            }
                        }
                    });
                },
                function (oldSportData, callback) {
                    var team = _.groupBy(oldSportData, "sportslist.name");
                    var arr = _.keys(team);
                    var sportlist;
                    async.eachSeries(team, function (sportData, callback) {
                            async.waterfall([
                                function (callback) {
                                    OldSport.saveCategory(sportData, function (err, category) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(category)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, category);
                                            }
                                        }
                                    });
                                },
                                function (category, callback) {
                                    console.log("category", category);
                                    OldSport.saveSportsListSubCategory(sportData, category, function (err, subCategory) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(subCategory)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, subCategory);
                                            }
                                        }
                                    });
                                },
                                function (subCategory, callback) {
                                    console.log("sportlist inside", subCategory);
                                    OldSport.saveSportsList(sportData, subCategory, function (err, drawFormat) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(drawFormat)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, drawFormat);
                                            }
                                        }
                                    });
                                },
                                function (drawFormat, callback) {
                                    async.eachSeries(sportData, function (singleData, callback) {
                                            console.log("category", singleData);
                                            async.waterfall([
                                                    function (callback) {
                                                        OldSport.saveAge(singleData, function (err, ageData) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(ageData)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    sport.sportslist = drawFormat._id;
                                                                    sport.ageGroup = ageData._id;
                                                                    console.log("drawFormat", sport);
                                                                    callback(null, sport);
                                                                }
                                                            }
                                                        });
                                                    },
                                                    function (sport, callback) {
                                                        var final = {};
                                                        final.weight = singleData.firstcategory.name;
                                                        OldSport.saveWeight(final, function (err, weightData) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                sport.weight = weightData._id;
                                                                callback(null, sport);
                                                            }
                                                        });
                                                    },
                                                    function (sport, callback) {
                                                        OldSport.saveSport(singleData, sport, function (err, drawFormat) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(drawFormat)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    callback(null, drawFormat);
                                                                }
                                                            }
                                                        });
                                                    },
                                                ],
                                                function (err, found) {
                                                    if (found) {
                                                        callback(null, found);
                                                    } else {
                                                        callback(null, found);
                                                    }
                                                });
                                        },
                                        function (err, found) {
                                            callback(null, found);
                                        });
                                },
                            ], function (err, found) {
                                sport = {};
                                callback(null, found);
                            });
                        },
                        function (err, found) {
                            callback(null, found);
                        });
                }
            ],
            function (err, found) {
                if (found) {
                    callback(null, found);
                } else {
                    callback(null, found);
                }
            });
    },

    getAllBoxing: function (data, callback) {
        var sport = {};
        async.waterfall([
                function (callback) {
                    OldSport.find({
                        year: data.year,
                        "sportslist.sporttype": "Combat",
                        "sportslist.name": "Boxing"
                    }).lean().exec(function (err, oldSportData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(oldSportData)) {
                                callback(null, []);
                            } else {
                                callback(null, oldSportData);
                            }
                        }
                    });
                },
                function (oldSportData, callback) {
                    var team = _.groupBy(oldSportData, "sportslist.name");
                    var arr = _.keys(team);
                    var sportlist;
                    async.eachSeries(team, function (sportData, callback) {
                            async.waterfall([
                                function (callback) {
                                    OldSport.saveCategory(sportData, function (err, category) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(category)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, category);
                                            }
                                        }
                                    });
                                },
                                function (category, callback) {
                                    console.log("category", category);
                                    OldSport.saveSportsListSubCategory(sportData, category, function (err, subCategory) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(subCategory)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, subCategory);
                                            }
                                        }
                                    });
                                },
                                function (subCategory, callback) {
                                    console.log("sportlist inside", subCategory);
                                    OldSport.saveSportsList(sportData, subCategory, function (err, drawFormat) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(drawFormat)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, drawFormat);
                                            }
                                        }
                                    });
                                },
                                function (drawFormat, callback) {
                                    async.eachSeries(sportData, function (singleData, callback) {
                                            console.log("category", singleData);
                                            async.waterfall([
                                                    function (callback) {
                                                        OldSport.saveAge(singleData, function (err, ageData) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(ageData)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    sport.sportslist = drawFormat._id;
                                                                    sport.ageGroup = ageData._id;
                                                                    console.log("drawFormat", sport);
                                                                    callback(null, sport);
                                                                }
                                                            }
                                                        });
                                                    },
                                                    function (sport, callback) {
                                                        var final = {};
                                                        final.weight = singleData.firstcategory.name;
                                                        OldSport.saveWeight(final, function (err, weightData) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                sport.weight = weightData._id;
                                                                callback(null, sport);
                                                            }
                                                        });
                                                    },
                                                    function (sport, callback) {
                                                        OldSport.saveSport(singleData, sport, function (err, drawFormat) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(drawFormat)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    callback(null, drawFormat);
                                                                }
                                                            }
                                                        });
                                                    },
                                                ],
                                                function (err, found) {
                                                    if (found) {
                                                        callback(null, found);
                                                    } else {
                                                        callback(null, found);
                                                    }
                                                });
                                        },
                                        function (err, found) {
                                            callback(null, found);
                                        });
                                },
                            ], function (err, found) {
                                sport = {};
                                callback(null, found);
                            });
                        },
                        function (err, found) {
                            callback(null, found);
                        });
                }
            ],
            function (err, found) {
                if (found) {
                    callback(null, found);
                } else {
                    callback(null, found);
                }
            });
    },

    getAllSportsMMA: function (data, callback) {
        var sport = {};
        async.waterfall([
                function (callback) {
                    OldSport.find({
                        year: data.year,
                        "sportslist.sporttype": "Combat",
                        "sportslist.name": "Sport MMA"
                    }).lean().exec(function (err, oldSportData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(oldSportData)) {
                                callback(null, []);
                            } else {
                                callback(null, oldSportData);
                            }
                        }
                    });
                },
                function (oldSportData, callback) {
                    var team = _.groupBy(oldSportData, "sportslist.name");
                    var arr = _.keys(team);
                    var sportlist;
                    async.eachSeries(team, function (sportData, callback) {
                            async.waterfall([
                                function (callback) {
                                    OldSport.saveCategory(sportData, function (err, category) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(category)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, category);
                                            }
                                        }
                                    });
                                },
                                function (category, callback) {
                                    console.log("category", category);
                                    OldSport.saveSportsListSubCategory(sportData, category, function (err, subCategory) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(subCategory)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, subCategory);
                                            }
                                        }
                                    });
                                },
                                function (subCategory, callback) {
                                    console.log("sportlist inside", subCategory);
                                    OldSport.saveSportsList(sportData, subCategory, function (err, drawFormat) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(drawFormat)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, drawFormat);
                                            }
                                        }
                                    });
                                },
                                function (drawFormat, callback) {
                                    async.eachSeries(sportData, function (singleData, callback) {
                                            console.log("category", singleData);
                                            async.waterfall([
                                                    function (callback) {
                                                        OldSport.saveAge(singleData, function (err, ageData) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(ageData)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    sport.sportslist = drawFormat._id;
                                                                    sport.ageGroup = ageData._id;
                                                                    console.log("drawFormat", sport);
                                                                    callback(null, sport);
                                                                }
                                                            }
                                                        });
                                                    },
                                                    function (sport, callback) {
                                                        var final = {};
                                                        final.weight = singleData.firstcategory.name;
                                                        OldSport.saveWeight(final, function (err, weightData) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                sport.weight = weightData._id;
                                                                callback(null, sport);
                                                            }
                                                        });
                                                    },
                                                    function (sport, callback) {
                                                        OldSport.saveSport(singleData, sport, function (err, drawFormat) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(drawFormat)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    callback(null, drawFormat);
                                                                }
                                                            }
                                                        });
                                                    },
                                                ],
                                                function (err, found) {
                                                    if (found) {
                                                        callback(null, found);
                                                    } else {
                                                        callback(null, found);
                                                    }
                                                });
                                        },
                                        function (err, found) {
                                            callback(null, found);
                                        });
                                },
                            ], function (err, found) {
                                sport = {};
                                callback(null, found);
                            });
                        },
                        function (err, found) {
                            callback(null, found);
                        });
                }
            ],
            function (err, found) {
                if (found) {
                    callback(null, found);
                } else {
                    callback(null, found);
                }
            });
    },

    getAllTaekwondo: function (data, callback) {
        var sport = {};
        async.waterfall([
                function (callback) {
                    OldSport.find({
                        year: data.year,
                        "sportslist.sporttype": "Combat",
                        "sportslist.name": "Taekwondo"
                    }).lean().exec(function (err, oldSportData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(oldSportData)) {
                                callback(null, []);
                            } else {
                                callback(null, oldSportData);
                            }
                        }
                    });
                },
                function (oldSportData, callback) {
                    var team = _.groupBy(oldSportData, "sportslist.name");
                    var arr = _.keys(team);
                    var sportlist;
                    async.eachSeries(team, function (sportData, callback) {
                            async.waterfall([
                                function (callback) {
                                    OldSport.saveCategory(sportData, function (err, category) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(category)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, category);
                                            }
                                        }
                                    });
                                },
                                function (category, callback) {
                                    console.log("category", category);
                                    OldSport.saveSportsListSubCategory(sportData, category, function (err, subCategory) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(subCategory)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, subCategory);
                                            }
                                        }
                                    });
                                },
                                function (subCategory, callback) {
                                    console.log("sportlist inside", subCategory);
                                    OldSport.saveSportsList(sportData, subCategory, function (err, drawFormat) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(drawFormat)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, drawFormat);
                                            }
                                        }
                                    });
                                },
                                function (drawFormat, callback) {
                                    async.eachSeries(sportData, function (singleData, callback) {
                                            console.log("category", singleData);
                                            async.waterfall([
                                                    function (callback) {
                                                        OldSport.saveAge(singleData, function (err, ageData) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(ageData)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    sport.sportslist = drawFormat._id;
                                                                    sport.ageGroup = ageData._id;
                                                                    console.log("drawFormat", sport);
                                                                    callback(null, sport);
                                                                }
                                                            }
                                                        });
                                                    },
                                                    function (sport, callback) {
                                                        var final = {};
                                                        final.weight = singleData.firstcategory.name;
                                                        OldSport.saveWeight(final, function (err, weightData) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                sport.weight = weightData._id;
                                                                callback(null, sport);
                                                            }
                                                        });
                                                    },
                                                    function (sport, callback) {
                                                        OldSport.saveSport(singleData, sport, function (err, drawFormat) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(drawFormat)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    callback(null, drawFormat);
                                                                }
                                                            }
                                                        });
                                                    },
                                                ],
                                                function (err, found) {
                                                    if (found) {
                                                        callback(null, found);
                                                    } else {
                                                        callback(null, found);
                                                    }
                                                });
                                        },
                                        function (err, found) {
                                            callback(null, found);
                                        });
                                },
                            ], function (err, found) {
                                sport = {};
                                callback(null, found);
                            });
                        },
                        function (err, found) {
                            callback(null, found);
                        });
                }
            ],
            function (err, found) {
                if (found) {
                    callback(null, found);
                } else {
                    callback(null, found);
                }
            });
    },

    getAllKumite: function (data, callback) {
        var sport = {};
        async.waterfall([
                function (callback) {
                    OldSport.find({
                        year: data.year,
                        "sportslist.sporttype": "Combat",
                        "sportslist.name": "Karate",
                        "firstcategory.name": "Kumite",
                    }).lean().exec(function (err, oldSportData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(oldSportData)) {
                                callback(null, []);
                            } else {
                                callback(null, oldSportData);
                            }
                        }
                    });
                },
                function (oldSportData, callback) {
                    var team = _.groupBy(oldSportData, "sportslist.name");
                    var arr = _.keys(team);
                    var sportlist;
                    async.eachSeries(team, function (sportData, callback) {
                            async.waterfall([
                                function (callback) {
                                    OldSport.saveCategory(sportData, function (err, category) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(category)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, category);
                                            }
                                        }
                                    });
                                },
                                function (category, callback) {
                                    console.log("category", category);
                                    OldSport.saveSportsListSubCategory(sportData, category, function (err, subCategory) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(subCategory)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, subCategory);
                                            }
                                        }
                                    });
                                },
                                function (subCategory, callback) {
                                    console.log("sportlist inside", subCategory);
                                    OldSport.saveSportsListAcquatics(sportData[0], subCategory, function (err, drawFormat) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(drawFormat)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, drawFormat);
                                            }
                                        }
                                    });
                                },
                                function (drawFormat, callback) {
                                    async.eachSeries(sportData, function (singleData, callback) {
                                            console.log("category", singleData);
                                            async.waterfall([
                                                    function (callback) {
                                                        OldSport.saveAge(singleData, function (err, ageData) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(ageData)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    sport.sportslist = drawFormat._id;
                                                                    sport.ageGroup = ageData._id;
                                                                    console.log("drawFormat", sport);
                                                                    callback(null, sport);
                                                                }
                                                            }
                                                        });
                                                    },
                                                    function (sport, callback) {
                                                        if (singleData.secondcategory) {
                                                            var final = {};
                                                            final.weight = singleData.secondcategory.name;
                                                            OldSport.saveWeight(final, function (err, weightData) {
                                                                if (err) {
                                                                    callback(err, null);
                                                                } else {
                                                                    sport.weight = weightData._id;
                                                                    callback(null, sport);
                                                                }
                                                            });
                                                        } else {
                                                            callback(null, sport);
                                                        }
                                                    },
                                                    function (sport, callback) {
                                                        OldSport.saveSport(singleData, sport, function (err, drawFormat) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(drawFormat)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    callback(null, drawFormat);
                                                                }
                                                            }
                                                        });
                                                    },
                                                ],
                                                function (err, found) {
                                                    if (found) {
                                                        callback(null, found);
                                                    } else {
                                                        callback(null, found);
                                                    }
                                                });
                                        },
                                        function (err, found) {
                                            callback(null, found);
                                        });
                                },
                            ], function (err, found) {
                                sport = {};
                                callback(null, found);
                            });
                        },
                        function (err, found) {
                            callback(null, found);
                        });
                }
            ],
            function (err, found) {
                if (found) {
                    callback(null, found);
                } else {
                    callback(null, found);
                }
            });
    },

    getAllKata: function (data, callback) {
        var sport = {};
        async.waterfall([
                function (callback) {
                    OldSport.find({
                        year: data.year,
                        "sportslist.sporttype": "Combat",
                        "sportslist.name": "Karate",
                        "firstcategory.name": "Kata",
                    }).lean().exec(function (err, oldSportData) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(oldSportData)) {
                                callback(null, []);
                            } else {
                                callback(null, oldSportData);
                            }
                        }
                    });
                },
                function (oldSportData, callback) {
                    var team = _.groupBy(oldSportData, "sportslist.name");
                    var arr = _.keys(team);
                    var sportlist;
                    async.eachSeries(team, function (sportData, callback) {
                            async.waterfall([
                                function (callback) {
                                    OldSport.saveCategory(sportData, function (err, category) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(category)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, category);
                                            }
                                        }
                                    });
                                },
                                function (category, callback) {
                                    console.log("category", category);
                                    OldSport.saveSportsListSubCategory(sportData, category, function (err, subCategory) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(subCategory)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, subCategory);
                                            }
                                        }
                                    });
                                },
                                function (subCategory, callback) {
                                    console.log("sportlist inside", subCategory);
                                    OldSport.saveSportsListAcquatics(sportData[0], subCategory, function (err, drawFormat) {
                                        if (err) {
                                            callback(err, null);
                                        } else {
                                            if (_.isEmpty(drawFormat)) {
                                                callback(null, []);
                                            } else {
                                                callback(null, drawFormat);
                                            }
                                        }
                                    });
                                },
                                function (drawFormat, callback) {
                                    async.eachSeries(sportData, function (singleData, callback) {
                                            console.log("category", singleData);
                                            async.waterfall([
                                                    function (callback) {
                                                        OldSport.saveAge(singleData, function (err, ageData) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(ageData)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    sport.sportslist = drawFormat._id;
                                                                    sport.ageGroup = ageData._id;
                                                                    console.log("drawFormat", sport);
                                                                    callback(null, sport);
                                                                }
                                                            }
                                                        });
                                                    },
                                                    function (sport, callback) {
                                                        var final = {};
                                                        final.weight = singleData.firstcategory.name;
                                                        OldSport.saveWeight(final, function (err, weightData) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                sport.weight = weightData._id;
                                                                callback(null, sport);
                                                            }
                                                        });
                                                    },
                                                    function (sport, callback) {
                                                        OldSport.saveSport(singleData, sport, function (err, drawFormat) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(drawFormat)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    callback(null, drawFormat);
                                                                }
                                                            }
                                                        });
                                                    },
                                                ],
                                                function (err, found) {
                                                    if (found) {
                                                        callback(null, found);
                                                    } else {
                                                        callback(null, found);
                                                    }
                                                });
                                        },
                                        function (err, found) {
                                            callback(null, found);
                                        });
                                },
                            ], function (err, found) {
                                sport = {};
                                callback(null, found);
                            });
                        },
                        function (err, found) {
                            callback(null, found);
                        });
                }
            ],
            function (err, found) {
                if (found) {
                    callback(null, found);
                } else {
                    callback(null, found);
                }
            });
    },

    saveSportsList: function (data, subCategory, callback) {
        console.log("inside", data[0], "sub", subCategory);
        async.waterfall([
            function (callback) {
                DrawFormat.find({
                    name: data[0].drawFormat
                }).lean().exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else {
                        console.log("found", found);
                        callback(null, found);
                    }
                });
            },
            function (found, callback) {
                if (found.length == 0) {
                    var drawFormat = {};
                    drawFormat.name = data[0].drawFormat;
                    DrawFormat.saveData(drawFormat, function (err, drawFormat) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(drawFormat)) {
                                callback(null, []);
                            } else {
                                console.log("drawFormat", drawFormat);
                                callback(null, drawFormat);
                            }
                        }
                    });
                } else {
                    var drawFormat = found[0];
                    callback(null, drawFormat);
                }
            },
            function (drawFormat, callback) {
                if (data[0].firstcategory) {
                    SportsList.find({
                        name: data[0].firstcategory.name
                    }).lean().exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else {
                            var final = {};
                            final.found = found;
                            final.drawFormat = drawFormat;
                            console.log("found", found);
                            callback(null, final);
                        }
                    });
                } else {
                    SportsList.find({
                        name: data[0].sportslist.name
                    }).lean().exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else {
                            var final = {};
                            final.found = found;
                            final.drawFormat = drawFormat;
                            console.log("found", found);
                            callback(null, final);
                        }
                    });
                }
            },
            function (final, callback) {
                if (final.found.length == 0) {
                    console.log("length", final.found.length);
                    var sportslist = {};
                    if (data[0].firstcategory) {
                        if (data[0].firstcategory.name == "Singles" || data[0].firstcategory.name == "Doubles") {
                            if (data[0].sportslist.name == "Squash") {
                                sportslist.name = data[0].sportslist.name;
                                sportslist.oldId = data[0].sportslist._id;
                            } else {
                                sportslist.name = data[0].sportslist.name + " " + data[0].firstcategory.name;
                                if (data[0].firstcategory._id) {
                                    sportslist.oldId = data[0].firstcategory._id;
                                } else {
                                    sportslist.oldId = data[0].sportslist._id;
                                }
                            }
                        } else if (data[0].sportslist.name == "Athletics") {
                            sportslist.name = data[0].firstcategory.name;
                            if (data[0].firstcategory._id) {
                                sportslist.oldId = data[0].firstcategory._id;
                            }

                        } else {
                            sportslist.name = data[0].sportslist.name;
                            sportslist.oldId = data[0].sportslist._id;
                        }
                    } else {
                        sportslist.name = data[0].sportslist.name;
                        sportslist.oldId = data[0].sportslist._id;
                    }
                    sportslist.sportsListSubCategory = subCategory._id;
                    sportslist.drawFormat = final.drawFormat._id;
                    SportsList.saveData(sportslist, function (err, sportslist) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(sportslist)) {
                                callback(null, []);
                            } else {
                                sportlist = sportslist._id;
                                callback(null, sportslist);
                            }
                        }
                    });
                } else {
                    callback(null, final.found[0]);
                }
            },
        ], function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, []);
            } else {
                callback(null, found);
            }
        });

    },

    saveSportsListAcquatics: function (data, subCategory, callback) {
        console.log("inside", data, "sub", subCategory);
        async.waterfall([
            function (callback) {
                DrawFormat.find({
                    name: data.drawFormat
                }).lean().exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else {
                        console.log("found", found);
                        callback(null, found);
                    }
                });
            },
            function (found, callback) {
                if (found.length == 0 && !_.isEmpty(data.drawFormat)) {
                    var drawFormat = {};
                    drawFormat.name = data.drawFormat;
                    DrawFormat.saveData(drawFormat, function (err, drawFormat) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(drawFormat)) {
                                callback(null, []);
                            } else {
                                console.log("drawFormat", drawFormat);
                                callback(null, drawFormat);
                            }
                        }
                    });
                } else {
                    var drawFormat = found[0];
                    callback(null, drawFormat);
                }
            },
            function (drawFormat, callback) {
                SportsList.find({
                    name: data.firstcategory.name
                }).lean().exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else {
                        var final = {};
                        final.found = found;
                        final.drawFormat = drawFormat;
                        console.log("found", found);
                        callback(null, final);
                    }
                });
            },
            function (final, callback) {
                if (final.found.length == 0) {
                    var sportslist = {};
                    sportslist.name = data.firstcategory.name;
                    sportslist.sportsListSubCategory = subCategory._id;
                    if (_.isEmpty(final.drawFormat)) {
                        sportslist.drawFormat = undefined;
                    } else {
                        sportslist.drawFormat = final.drawFormat._id;
                    }

                    if (data.firstcategory._id) {
                        sportslist.oldId = data.firstcategory._id;
                    } else {
                        sportslist.oldId = data.sportslist._id;
                    }
                    SportsList.saveData(sportslist, function (err, sportslist) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(sportslist)) {
                                callback(null, []);
                            } else {
                                callback(null, sportslist);
                            }
                        }
                    });
                } else {
                    callback(null, final.found[0]);
                }
            },
        ], function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, []);
            } else {
                callback(null, found);
            }
        });

    },

    saveSportsListSubCategory: function (data, category, callback) {
        async.waterfall([
            function (callback) {
                SportsListSubCategory.find({
                    name: data[0].sportslist.name
                }).lean().exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else {
                        console.log("found", found);
                        callback(null, found);
                    }
                });
            },
            function (found, callback) {
                console.log("length", found.length);
                if (found.length == 0) {
                    var sportsSubCategory = {};
                    sportsSubCategory.name = data[0].sportslist.name;
                    sportsSubCategory.sportsListCategory = category._id;
                    if (category.name == "Team Sport") {
                        sportsSubCategory.isTeam = true;
                    } else {
                        sportsSubCategory.isTeam = false;
                    }
                    SportsListSubCategory.saveData(sportsSubCategory, function (err, subCategory) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(subCategory)) {
                                callback(null, []);
                            } else {
                                callback(null, subCategory);
                            }
                        }
                    });
                } else {
                    callback(null, found[0]);
                }
            },
        ], function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, []);
            } else {
                callback(null, found);
            }
        });

    },

    saveCategory: function (data, callback) {
        async.waterfall([
            function (callback) {
                SportsListCategory.find({
                    name: {
                        $regex: data[0].sportslist.sporttype
                    }
                }).lean().exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else {
                        console.log("found", found);
                        callback(null, found);
                    }
                });
            },
            function (found, callback) {
                console.log("length", found.length);
                if (found.length == 0) {
                    var sportsCategory = {};
                    sportsCategory.name = data[0].sportslist.sporttype + " Sports";
                    SportsListCategory.saveData(sportsCategory, function (err, category) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(category)) {
                                callback(null, []);
                            } else {
                                callback(null, category);
                            }
                        }
                    });
                } else {
                    callback(null, found[0]);
                }
            },
        ], function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, []);
            } else {
                callback(null, found);
            }
        });

    },

    saveAge: function (data, callback) {
        console.log("data", data);
        async.waterfall([
            function (callback) {
                AgeGroup.find({
                    name: data.agegroup.name
                }).lean().exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, found);
                    }
                });
            },
            function (found, callback) {
                console.log("length", found.length);
                if (found.length == 0) {
                    var ageGroup = {};
                    ageGroup.name = data.agegroup.name;
                    if (data.agegroup._id) {
                        ageGroup.oldId = data.agegroup._id;
                    }
                    AgeGroup.saveData(ageGroup, function (err, ageGroup) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(ageGroup)) {
                                callback(null, []);
                            } else {
                                callback(null, ageGroup);
                            }
                        }
                    });
                } else {
                    callback(null, found[0]);
                }
            },
        ], function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, []);
            } else {
                callback(null, found);
            }
        });
    },

    saveWeight: function (data, callback) {
        console.log("data", data);
        async.waterfall([
            function (callback) {
                Weight.find({
                    name: data.weight
                }).lean().exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else {
                        console.log("found", found);
                        callback(null, found);
                    }
                });
            },
            function (found, callback) {
                console.log("length", found.length);
                if (found.length == 0) {
                    var ageGroup = {};
                    ageGroup.name = data.weight;
                    Weight.saveData(ageGroup, function (err, ageGroup) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(ageGroup)) {
                                callback(null, []);
                            } else {
                                callback(null, ageGroup);
                            }
                        }
                    });
                } else {
                    callback(null, found[0]);
                }
            },
        ], function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, []);
            } else {
                callback(null, found);
            }
        });
    },

    saveSport: function (data, data1, callback) {
        var sport = {};
        if (data.gender == 'Boys') {
            sport.gender = "male";
        } else if (data.gender == 'Girls') {
            sport.gender = "female";
        } else {
            sport.gender = "both";
        }
        sport.sportslist = data1.sportslist;
        sport.ageGroup = data1.ageGroup;
        if (data1.weight) {
            sport.weight = data1.weight;
        } else {
            sport.weight = undefined;
        }
        sport.oldId = data._id;
        Sport.saveData(sport, function (err, subCategory) {
            if (err) {
                callback(err, null);
            } else {
                if (_.isEmpty(subCategory)) {
                    callback(null, []);
                } else {
                    callback(null, subCategory);
                }
            }
        });
    },
};
module.exports = _.assign(module.exports, exports, model);