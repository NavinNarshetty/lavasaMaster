var schema = new Schema({
    gender: String,
    maxTeam: Number,
    minTeamPlayers: Number,
    maxTeamPlayers: Number,
    sportslist: {
        type: Schema.Types.ObjectId,
        ref: 'OldSportsList',
        index: true
    },
    ageGroup: {
        type: Schema.Types.ObjectId,
        ref: 'OldAgeGroup',
        index: true
    },
    weight: {
        type: Schema.Types.ObjectId,
        ref: 'OldWeight',
        index: true
    },
    fromDate: Date,
    toDate: Date,
    eventPdf: String,
    matchPrefix: String
});

schema.plugin(deepPopulate, {
    populate: {
        'sportslist': {
            select: '_id name sportsListSubCategory drawFormat inactiveimage image'
        },
        'sportslist.sportsListSubCategory': {
            select: '_id name isTeam rules sportsListCategory'
        },
        'sportslist.sportsListSubCategory.rules': {
            select: ''
        },
        'sportslist.sportsListSubCategory.sportsListCategory': {
            select: ''
        },
        "sportslist.drawFormat": {
            select: ''
        },
        'ageGroup': {
            select: '_id name'
        },
        'weight': {
            select: '_id name'
        }

    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('OldSport', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getAllSports: function (data, callback) {
        async.waterfall([
            function (callback) {
                var deepSearch = "sportslist.sportsListSubCategory.sportsListCategory sportslist.sportsListSubCategory.rules ageGroup weight sportslist.drawFormat";
                OldSport.find().lean().deepPopulate(deepSearch).exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (_.isEmpty(found)) {
                            callback(null, []);
                        } else {
                            callback(null, found);
                        }
                    }
                });
            },
            function (found, callback) {
                var sportUniq = _.uniqBy(found, 'sportslist.sportsListSubCategory.rules.name');
                OldSport.saveRules(sportUniq, function (err, complete) {
                    if (err || _.isEmpty(complete)) {
                        var err = "Error found in Rules";
                        callback(err, null);
                    } else {
                        callback(null, found);
                    }
                });
            },
            function (found, callback) {
                var sportUniq = _.uniqBy(found, 'sportslist.sportsListSubCategory.sportsListCategory.name');
                OldSport.savesportsListCategory(sportUniq, function (err, complete) {
                    if (err || _.isEmpty(complete)) {
                        var err = "Error found in SportsListCategory";
                        callback(err, null);
                    } else {
                        callback(null, found);
                    }
                });
            },
            function (found, callback) {
                var sportUniq = _.uniqBy(found, 'sportslist.sportsListSubCategory.name');
                OldSport.savesportsListSubCategory(sportUniq, function (err, complete) {
                    if (err || _.isEmpty(complete)) {
                        var err = "Error found in sportsListSubCategory";
                        callback(err, null);
                    } else {
                        callback(null, found);
                    }
                });
            },
            function (found, callback) {
                var sportUniq = _.uniqBy(found, 'sportslist.name');
                OldSport.saveSportlist(sportUniq, function (err, complete) {
                    if (err || _.isEmpty(complete)) {
                        var err = "Error found in SportsList";
                        callback(err, null);
                    } else {
                        callback(null, found);
                    }
                });
            },
            function (found, callback) {
                var sportUniq = _.uniqBy(found, 'ageGroup.name');
                OldSport.saveAgeGroup(sportUniq, function (err, complete) {
                    if (err || _.isEmpty(complete)) {
                        var err = "Error found in AgeGroup";
                        callback(err, null);
                    } else {
                        callback(null, found);
                    }
                });
            },
            function (found, callback) {
                var sportUniq = _.uniqBy(found, 'weight.name');
                OldSport.saveWeight(sportUniq, function (err, complete) {
                    if (err || _.isEmpty(complete)) {
                        var err = "Error found in weight";
                        callback(err, null);
                    } else {
                        callback(null, found);
                    }
                });
            },
            function (found, callback) {
                OldSport.getEvent(found, function (err, complete) {
                    if (err || _.isEmpty(complete)) {
                        var err = "Error found in sport";
                        callback(err, null);
                    } else {
                        callback(null, complete);
                    }
                });
            },
            function (found, callback) {
                // var result = found.sport.filter(
                //     function (value) {
                //         return ((value.sportslist.name === 'Handball') && (value.ageGroup.name === "U-10") && (value.gender == "male"));
                //     }
                // );
                // console.log("filter result", result);
                // callback(null, result);
                OldSport.saveSport(found, function (err, complete) {
                    if (err || _.isEmpty(complete)) {
                        var err = "Error found in sport";
                        callback(err, null);
                    } else {
                        callback(null, found);
                    }
                });
            },
        ], function (err, result) {
            if (err) {
                callback(err, null);
            } else {

                callback(null, result);
            }
        });
    },

    saveSportlist: function (data, callback) {
        async.eachSeries(data, function (n, callback) {
            console.log("****inside n******", n);
            if (n.sportslist != null) {
                async.waterfall([
                    function (callback) {
                        if (n.sportslist.drawFormat != null) {
                            DrawFormat.findOne({
                                name: n.sportslist.drawFormat.name
                            }).lean().exec(function (err, drawFormatData) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    if (_.isEmpty(drawFormatData)) {
                                        var param = {};
                                        param.name = n.sportslist.drawFormat.name;
                                        DrawFormat.saveData(param, function (err, complete) {
                                            if (err || _.isEmpty(complete)) {
                                                callback(null, {
                                                    error: "Error",
                                                    success: complete
                                                });
                                            } else {
                                                callback(null, complete);
                                            }
                                        });
                                    } else {
                                        callback(null, drawFormatData);
                                    }
                                }
                            });
                        } else {
                            callback(null, n);
                        }
                    },
                    function (drawFormatData, callback) {
                        if (n.sportslist.sportsListSubCategory != null) {
                            SportsListSubCategory.findOne({
                                name: n.sportslist.sportsListSubCategory.name
                            }).lean().exec(function (err, sportsListSubCategoryData) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    if (_.isEmpty(sportsListSubCategoryData)) {
                                        var final = {};
                                        final.drawFormat = drawFormatData;
                                        final.sportsListSubCategory = null;
                                    } else {
                                        var final = {};
                                        final.drawFormat = drawFormatData;
                                        final.sportsListSubCategory = sportsListSubCategoryData;
                                        callback(null, final);
                                    }
                                }
                            });
                        } else {
                            var final = {};
                            final.drawFormat = drawFormatData;
                            final.sportsListSubCategory = null;
                        }
                    },
                    function (final, callback) {
                        // console.log("n", n.sportslist);
                        var formData = {};
                        formData.name = n.sportslist.name;
                        if (final.sportsListSubCategory != null) {
                            formData.sportsListSubCategory = final.sportsListSubCategory._id;
                        }
                        formData.drawFormat = final.drawFormat._id;
                        SportsList.findOne({
                            name: formData.name
                        }).lean().exec(function (err, found) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(found)) {
                                    SportsList.saveData(formData, function (err, complete) {
                                        if (err || _.isEmpty(complete)) {
                                            callback(null, {
                                                error: "Error",
                                                success: complete
                                            });
                                        } else {
                                            callback(null, complete);
                                        }
                                    });
                                } else {
                                    callback(null, found);
                                }
                            }
                        });
                    }
                ], function (err, complete) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, complete);
                    }
                });
            } else {
                callback();
            }
        }, function (err) {
            if (err) {
                callback(null, {
                    error: "error found",
                    data: data
                });
            } else {
                callback(null, data);
            }
        });

    },

    savesportsListSubCategory: function (data, callback) {
        async.eachSeries(data, function (n, callback) {
                if (n.sportslist != null && n.sportslist.sportsListSubCategory != null && n.sportslist.sportsListSubCategory.sportsListCategory != null) {
                    async.waterfall([
                        function (callback) {
                            console.log("n.sportslist", n.sportslist);
                            if (n.sportslist.sportsListSubCategory.rules != null) {
                                Rules.findOne({
                                    name: n.sportslist.sportsListSubCategory.rules.name
                                }).lean().exec(function (err, rulesData) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        callback(null, rulesData);
                                    }
                                });
                            } else {
                                callback(null, {});
                            }
                        },
                        function (rulesData, callback) {
                            console.log("n----->", n);
                            if (n.sportslist.sportsListSubCategory.sportsListCategory != null) {
                                SportsListCategory.findOne({
                                    name: n.sportslist.sportsListSubCategory.sportsListCategory.name
                                }).lean().exec(function (err, found) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        if (_.isEmpty(found)) {
                                            var final = {};
                                            if (_.isEmpty(rulesData)) {
                                                final.rules = null;
                                                final.sportsListCategory = null;
                                            } else {
                                                final.rules = rulesData;
                                                final.sportsListCategory = null;
                                            }
                                            callback(null, final);
                                        } else {
                                            var final = {};
                                            if (_.isEmpty(rulesData)) {
                                                final.rules = null;
                                                final.sportsListCategory = found;
                                            } else {
                                                final.rules = rulesData;
                                                final.sportsListCategory = found;
                                            }
                                            callback(null, final);
                                        }
                                    }
                                });
                            } else {
                                var final = {};
                                if (_.isEmpty(rulesData)) {
                                    final.rules = null;
                                    final.sportsListCategory = null;
                                } else {
                                    final.rules = rulesData;
                                    final.sportsListCategory = null;
                                }
                                callback(null, final);
                            }
                        },
                        function (final, callback) {
                            console.log("n", n.sportslist);
                            var formData = {};
                            formData.name = n.sportslist.sportsListSubCategory.name;
                            if (final.sportsListCategory != null) {
                                formData.sportsListCategory = final.sportsListCategory._id;
                            }
                            if (final.rules != null) {
                                formData.rules = final.rules._id;
                            }
                            formData.isTeam = n.sportslist.sportsListSubCategory.isTeam;
                            SportsListSubCategory.findOne({
                                name: formData.name
                            }).lean().exec(function (err, found) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    if (_.isEmpty(found)) {
                                        SportsListSubCategory.saveData(formData, function (err, complete) {
                                            if (err || _.isEmpty(complete)) {
                                                callback(null, {
                                                    error: "Error",
                                                    success: complete
                                                });
                                            } else {
                                                callback(null, data);
                                            }
                                        });
                                    } else {
                                        callback(null, data);
                                    }
                                }
                            });
                        }
                    ], function (err, complete) {
                        if (err) {
                            callback(err, null);
                        } else {
                            callback(null, complete);
                        }
                    });
                } else {
                    callback(null, data);
                }
            },
            function (err) {
                if (err) {
                    callback(null, {
                        error: "error found",
                        data: data
                    });
                } else {
                    callback(null, data);
                }
            });

    },

    savesportsListCategory: function (data, callback) {
        async.eachSeries(data, function (n, callback) {
            if (n.sportslist != null && n.sportslist.sportsListSubCategory != null && n.sportslist.sportsListSubCategory.sportsListCategory != null) {
                console.log("n", n.sportslist);
                var formData = {};
                formData.name = n.sportslist.sportsListSubCategory.sportsListCategory.name;
                SportsListCategory.findOne({
                    name: formData.name
                }).lean().exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (_.isEmpty(found)) {
                            SportsListCategory.saveData(formData, function (err, complete) {
                                if (err || _.isEmpty(complete)) {
                                    callback(null, {
                                        error: "Error",
                                        success: complete
                                    });
                                } else {
                                    callback(null, data);
                                }
                            });
                        } else {
                            callback(null, data);
                        }
                    }
                });
            } else {
                callback(null, data);
            }
        }, function (err) {
            if (err) {
                callback(null, {
                    error: "error found",
                    data: data
                });
            } else {
                callback(null, data);
            }
        });

    },

    saveRules: function (data, callback) {
        async.eachSeries(data, function (n, callback) {
            if (n.sportslist != null && n.sportslist.sportsListSubCategory != null && n.sportslist.sportsListSubCategory.rules != null) {
                console.log("n", n.sportslist);
                var formData = {};
                formData.name = n.sportslist.sportsListSubCategory.rules.name;
                Rules.findOne({
                    name: formData.name
                }).lean().exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (_.isEmpty(found)) {
                            Rules.saveData(formData, function (err, complete) {
                                if (err || _.isEmpty(complete)) {
                                    callback(null, {
                                        error: "Error",
                                        success: complete
                                    });
                                } else {
                                    callback(null, data);
                                }
                            });
                        } else {
                            callback(null, data);
                        }
                    }
                });
            } else {
                callback(null, data);
            }
        }, function (err) {
            if (err) {
                callback(null, {
                    error: "error found",
                    data: data
                });
            } else {
                callback(null, data);
            }
        });

    },

    saveAgeGroup: function (data, callback) {
        async.eachSeries(data, function (n, callback) {
            // console.log("n", n);
            if (n.ageGroup != null) {
                var formData = {};
                formData.name = n.ageGroup.name;
                AgeGroup.findOne({
                    name: formData.name
                }).lean().exec(function (err, found) {
                    console.log("ageGroup", found);
                    if (err) {
                        callback(err, null);
                    } else {
                        if (_.isEmpty(found)) {
                            AgeGroup.saveData(formData, function (err, complete) {
                                if (err || _.isEmpty(complete)) {
                                    callback(null, {
                                        error: "Error",
                                        success: complete
                                    });
                                } else {
                                    callback(null, complete);
                                }
                            });
                        } else {
                            callback(null, found);
                        }
                    }
                });
            } else {
                callback();
            }
        }, function (err) {
            if (err) {
                callback(null, {
                    error: "error found",
                    data: data
                });
            } else {
                callback(null, data);
            }
        });

    },

    saveWeight: function (data, callback) {
        async.eachSeries(data, function (n, callback) {
            if (n.weight != null) {
                var formData = {};
                formData.name = n.weight.name;
                Weight.findOne({
                    name: formData.name
                }).lean().exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (_.isEmpty(found)) {
                            Weight.saveData(formData, function (err, complete) {
                                if (err || _.isEmpty(complete)) {
                                    callback(null, {
                                        error: "Error",
                                        success: complete
                                    });
                                } else {
                                    callback(null, complete);
                                }
                            });
                        } else {
                            callback(null, found);
                        }
                    }
                });
            } else {
                callback();
            }
        }, function (err) {
            if (err) {
                callback(null, {
                    error: "error found",
                    data: data
                });
            } else {
                callback(null, data);
            }
        });

    },

    saveSportold: function (data, callback) {
        var concatcount = 0;
        async.eachSeries(data.sport, function (n, callback) {
                var sportData = {};
                if (n.sportslist) {
                    async.waterfall([
                        function (callback) {
                            SportsList.findOne({
                                name: n.sportslist.name
                            }).lean().exec(function (err, found) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    if (_.isEmpty(found)) {
                                        callback(null, []);
                                    } else {
                                        sportData.sportslist = found._id;
                                        callback(null, sportData);
                                    }
                                }
                            });
                        },
                        function (sportData, callback) {
                            AgeGroup.findOne({
                                name: n.ageGroup.name
                            }).lean().exec(function (err, found) {
                                if (err) {
                                    callback(err, null);
                                } else {
                                    if (_.isEmpty(found)) {
                                        callback(null, []);
                                    } else {
                                        sportData.ageGroup = found._id;
                                        callback(null, sportData);
                                    }
                                }
                            });
                        },
                    ], function (err, result) {
                        if (err) {
                            callback(err, null);
                        } else {
                            console.log("for weight", n);
                            if (n.weight && n.weight != null) {
                                Weight.findOne({
                                    name: n.weight.name
                                }).lean().exec(function (err, found) {
                                    if (!_.isEmpty(found)) {
                                        sportData.weight = found._id;
                                        sportData.gender = n.gender;
                                        sportData.maxTeam = n.maxTeam;
                                        sportData.minTeamPlayers = n.minTeamPlayers;
                                        sportData.maxTeamPlayers = n.maxTeamPlayers;
                                        sportData.toDate = n.toDate;
                                        sportData.fromDate = n.fromDate;
                                        Sport.findOne({
                                            sportslist: sportData.sportslist,
                                            gender: sportData.gender,
                                            ageGroup: sportData.ageGroup,
                                            weight: sportData.weight
                                        }).lean().exec(function (err, sportFound) {
                                            if (err) {
                                                callback(err, null);
                                            } else {
                                                if (_.isEmpty(sportFound)) {
                                                    console.log("sport empty");
                                                    var arr = [];
                                                    arr.push(data.event._id);
                                                    sportData.eventId = arr;
                                                    Sport.saveData(sportData, function (err, complete) {
                                                        if (err || _.isEmpty(complete)) {
                                                            callback(null, {
                                                                error: "Error",
                                                                success: complete
                                                            });
                                                        } else {
                                                            callback(null, complete);
                                                        }
                                                    });
                                                } else {
                                                    concatcount++;
                                                    var arr = [];
                                                    arr.push(data.event._id);
                                                    var mainArr = [].concat.apply([], [
                                                        sportFound.eventId,
                                                        arr
                                                    ]);
                                                    mainArr = _.uniq(mainArr);
                                                    console.log("mainArr", mainArr, "sportFound", sportFound, "concatcount", concatcount);
                                                    var updateObj = {
                                                        $set: {
                                                            eventId: mainArr
                                                        }
                                                    };
                                                    Sport.update({
                                                        matchId: sportFound._id
                                                    }, updateObj).exec(
                                                        function (err, sportData) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(sportData)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    callback(null, sportData);
                                                                }
                                                            }
                                                        });
                                                }
                                            }
                                        });
                                    } else {
                                        Sport.findOne({
                                            sportslist: sportData.sportslist,
                                            gender: n.gender,
                                            ageGroup: sportData.ageGroup,
                                            // weight: sportData.weight
                                        }).lean().exec(function (err, sportFound) {
                                            if (err) {
                                                callback(err, null);
                                            } else {
                                                if (_.isEmpty(sportFound)) {
                                                    console.log("empty sport");
                                                    var arr = [];
                                                    arr.push(data.event._id);
                                                    sportData.eventId = arr;
                                                    Sport.saveData(sportData, function (err, complete) {
                                                        if (err || _.isEmpty(complete)) {
                                                            callback(null, {
                                                                error: "Error",
                                                                success: complete
                                                            });
                                                        } else {
                                                            callback(null, complete);
                                                        }
                                                    });
                                                } else {
                                                    concatcount++;
                                                    var arr = [];
                                                    arr.push(data.event._id);
                                                    var mainArr = [].concat.apply([], [
                                                        sportFound.eventId,
                                                        arr
                                                    ]);
                                                    mainArr = _.uniq(mainArr);
                                                    console.log("mainArr", mainArr, "sportFound", sportFound, "concatcount", concatcount);
                                                    var updateObj = {
                                                        $set: {
                                                            eventId: mainArr
                                                        }
                                                    };
                                                    Sport.update({
                                                        matchId: sportFound._id
                                                    }, updateObj).exec(
                                                        function (err, sportData) {
                                                            if (err) {
                                                                callback(err, null);
                                                            } else {
                                                                if (_.isEmpty(sportData)) {
                                                                    callback(null, []);
                                                                } else {
                                                                    callback(null, sportData);
                                                                }
                                                            }
                                                        });
                                                }
                                            }
                                        });

                                    }
                                });
                            } else {
                                // sportData.weight = null;
                                sportData.gender = n.gender;
                                sportData.maxTeam = n.maxTeam;
                                sportData.minTeamPlayers = n.minTeamPlayers;
                                sportData.maxTeamPlayers = n.maxTeamPlayers;
                                sportData.toDate = n.toDate;
                                sportData.fromDate = n.fromDate;
                                sportData.oldId = n._id;
                                Sport.findOne({
                                    sportslist: sportData.sportslist,
                                    gender: sportData.gender,
                                    ageGroup: sportData.ageGroup,
                                }).lean().exec(function (err, sportFound) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        if (_.isEmpty(sportFound)) {
                                            console.log("empty sport");
                                            var arr = [];
                                            arr.push(data.event._id);
                                            sportData.eventId = arr;
                                            Sport.saveData(sportData, function (err, complete) {
                                                if (err || _.isEmpty(complete)) {
                                                    callback(null, {
                                                        error: "Error",
                                                        success: complete
                                                    });
                                                } else {
                                                    callback(null, complete);
                                                }
                                            });
                                        } else {
                                            concatcount++;
                                            var arr = [];
                                            arr.push(data.event._id);
                                            var mainArr = [].concat.apply([], [
                                                sportFound.eventId,
                                                arr
                                            ]);
                                            mainArr = _.uniq(mainArr);
                                            console.log("mainArr", mainArr, "sportFound", sportFound, "concatcount", concatcount);
                                            var updateObj = {
                                                $set: {
                                                    eventId: mainArr
                                                }
                                            };
                                            Sport.update({
                                                matchId: sportFound._id
                                            }, updateObj).exec(
                                                function (err, sportData) {
                                                    if (err) {
                                                        callback(err, null);
                                                    } else {
                                                        if (_.isEmpty(sportData)) {
                                                            callback(null, []);
                                                        } else {
                                                            callback(null, sportData);
                                                        }
                                                    }
                                                });
                                        }
                                    }
                                });
                            }
                        }
                    });
                } else {
                    callback(null, n);
                }
            },
            function (err) {
                if (err) {
                    callback(null, {
                        error: "error found",
                        data: data
                    });
                } else {
                    callback(null, data);
                }
            });

    },

    getAggregatePipeline: function () {
        var pipeline = [
            // Stage 1
            {
                $lookup: {
                    "from": "sportslists",
                    "localField": "sportslist",
                    "foreignField": "_id",
                    "as": "sportslist"
                }
            },

            // Stage 2
            {
                $unwind: {
                    path: "$sportslist",
                }
            },

            // Stage 3
            {
                $lookup: {
                    "from": "agegroups",
                    "localField": "ageGroup",
                    "foreignField": "_id",
                    "as": "ageGroup"
                }
            },

            // Stage 4
            {
                $unwind: {
                    path: "$ageGroup"
                }
            },
            {
                $lookup: {
                    "from": "weights",
                    "localField": "weight",
                    "foreignField": "_id",
                    "as": "weight"
                }
            },
            {
                $unwind: {
                    path: "$weight",
                    preserveNullAndEmptyArrays: true // optional
                }
            },

        ];
        return pipeline;
    },

    saveSport: function (data, callback) {
        async.eachSeries(data.sport, function (n, callback) {
                if (n.weight && n.weight != null) {
                    var pipeLine = OldSport.getAggregatePipeline();
                    var newPipeLine = _.cloneDeep(pipeLine);
                    newPipeLine.push(
                        // Stage 6
                        {
                            $match: {
                                "sportslist.name": n.sportslist.name,
                                "ageGroup.name": n.ageGroup.name,
                                "gender": n.gender,
                                "weight": n.weight.name
                            }
                        }
                    );
                    Sport.aggregate(newPipeLine, function (err, singleData) {
                        if (err) {
                            callback(err, "error in mongoose");
                        } else if (_.isEmpty(singleData)) {
                            OldSport.getSportData(n, function (err, sportData) {
                                if (err || _.isEmpty(sportData)) {
                                    var err = "Error found in sport";
                                    callback(err, null);
                                } else {
                                    var arr = [];
                                    arr.push(data.event._id);
                                    sportData.eventId = arr;
                                    Sport.saveData(sportData, function (err, complete) {
                                        if (err || _.isEmpty(complete)) {
                                            callback(null, {
                                                error: "Error",
                                                success: complete
                                            });
                                        } else {
                                            callback(null, complete);
                                        }
                                    })
                                }
                            });
                        } else {
                            var arr = [];
                            arr.push(data.event._id);
                            var mainArr = [].concat.apply([], [
                                singleData[0].eventId,
                                arr
                            ]);
                            mainArr = _.uniq(mainArr);
                            console.log("mainArr", mainArr, "singleData", singleData[0]);
                            var updateObj = {
                                $set: {
                                    eventId: mainArr
                                }
                            };
                            Sport.update({
                                matchId: singleData[0]._id
                            }, updateObj).exec(
                                function (err, sportData) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        if (_.isEmpty(sportData)) {
                                            callback(null, []);
                                        } else {
                                            callback(null, sportData);
                                        }
                                    }
                                });
                        }
                    });
                } else {
                    var pipeLine = OldSport.getAggregatePipeline();
                    var newPipeLine = _.cloneDeep(pipeLine);
                    newPipeLine.push(
                        // Stage 6
                        {
                            $match: {
                                "sportslist.name": n.sportslist.name,
                                "ageGroup.name": n.ageGroup.name,
                                "gender": n.gender
                            }
                        }
                    );
                    Sport.aggregate(newPipeLine, function (err, singleData) {
                        if (err) {
                            callback(err, "error in mongoose");
                        } else if (_.isEmpty(singleData)) {
                            OldSport.getSportData(n, function (err, sportData) {
                                if (err || _.isEmpty(sportData)) {
                                    var err = "Error found in sport";
                                    callback(err, null);
                                } else {
                                    var arr = [];
                                    arr.push(data.event._id);
                                    sportData.eventId = arr;
                                    Sport.saveData(sportData, function (err, complete) {
                                        if (err || _.isEmpty(complete)) {
                                            callback(null, {
                                                error: "Error",
                                                success: complete
                                            });
                                        } else {
                                            callback(null, complete);
                                        }
                                    })
                                }
                            });
                        } else {
                            var arr = [];
                            arr.push(data.event._id);
                            var mainArr = [].concat.apply([], [
                                singleData[0].eventId,
                                arr
                            ]);
                            mainArr = _.uniq(mainArr);
                            console.log("mainArr", mainArr, "singleData", singleData[0]);
                            var updateObj = {
                                $set: {
                                    eventId: mainArr
                                }
                            };
                            Sport.update({
                                _id: singleData[0]._id
                            }, updateObj).exec(
                                function (err, sportData) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        if (_.isEmpty(sportData)) {
                                            callback(null, []);
                                        } else {
                                            callback(null, sportData);
                                        }
                                    }
                                });
                        }
                    });
                }
            },
            function (err) {
                if (err) {
                    callback(null, {
                        error: "error found",
                        data: data
                    });
                } else {
                    callback(null, data);
                }
            });

    },

    getSportData: function (data, callback) {
        var sportData = {};
        async.waterfall([
            function (callback) {
                SportsList.findOne({
                    name: data.sportslist.name
                }).lean().exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (_.isEmpty(found)) {
                            callback(null, []);
                        } else {
                            sportData.sportslist = found._id;
                            sportData.gender = data.gender;
                            sportData.maxTeam = data.maxTeam;
                            sportData.minTeamPlayers = data.minTeamPlayers;
                            sportData.maxTeamPlayers = data.maxTeamPlayers;
                            sportData.toDate = data.toDate;
                            sportData.fromDate = data.fromDate;
                            callback(null, sportData);
                        }
                    }
                });
            },
            function (sportData, callback) {
                AgeGroup.findOne({
                    name: data.ageGroup.name
                }).lean().exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (_.isEmpty(found)) {
                            callback(null, []);
                        } else {
                            sportData.ageGroup = found._id;
                            callback(null, sportData);
                        }
                    }
                });
            },
            function (sportData, callback) {
                if (data.weight) {
                    Weight.findOne({
                        name: data.weight.name
                    }).lean().exec(function (err, found) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (_.isEmpty(found)) {
                                callback(null, []);
                            } else {
                                sportData.ageGroup = found._id;
                                callback(null, sportData);
                            }
                        }
                    });
                } else {
                    callback(null, sportData);
                }
            }
        ], function (err, complete) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, complete);
            }
        })
    },

    getOldSport: function (data, callback) {
        var deepSearch = "sportslist.sportsListSubCategory.sportsListCategory sportslist.sportsListSubCategory.rules ageGroup weight sportslist.drawFormat";
        OldSport.find().lean().deepPopulate(deepSearch).exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else {
                if (_.isEmpty(found)) {
                    callback(null, []);
                } else {
                    callback(null, found);
                }
            }
        });
    },

    getEvent: function (data, callback) {
        async.waterfall([
            function (callback) {
                ConfigProperty.findOne().exec(function (err, property) {
                    if (err || _.isEmpty(property)) {
                        callback(null, {
                            error: "error"
                        });
                    } else {
                        callback(null, property);
                    }
                });
            },
            function (property, callback) {
                Event.findOne({
                    city: property.city,
                    year: property.year
                }).exec(function (err, eventData) {
                    if (err || _.isEmpty(eventData)) {
                        callback(null, {
                            error: "error"
                        });
                    } else {
                        var final = {};
                        final.sport = data;
                        final.event = eventData;
                        callback(null, final);
                    }
                });
            }
        ], function (err, complete) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, complete);
            }
        });
    }


};
module.exports = _.assign(module.exports, exports, model);