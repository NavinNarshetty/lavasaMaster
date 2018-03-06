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
                // var sportUniq = _.uniqBy(found, 'weight.name');
                // callback(null, sportUniq);
                OldSport.saveWeight(found, function (err, complete) {
                    if (err || _.isEmpty(complete)) {
                        var err = "Error found in weight";
                        callback(err, null);
                    } else {
                        callback(null, found);
                    }
                });
            },
            function (found, callback) {
                // console.log("found length", found.length, "found", found);
                // var calling = {};
                // calling.found = found;
                // calling.size = found.length;
                // callback(null, calling);
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
            if (n.sportslist != null) {
                console.log("n", n.sportslist);
                var formData = {};
                formData.name = n.sportslist.name;
                if (n.sportslist.sportsListSubCategory != null) {
                    formData.sportsListSubCategory = n.sportslist.sportsListSubCategory._id;
                }
                formData.drawFormat = n.sportslist.drawFormat._id;
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
                if (n.sportslist != null && n.sportslist.sportsListSubCategory != null) {
                    console.log("n", n.sportslist);
                    var formData = {};
                    formData.name = n.sportslist.sportsListSubCategory.name;
                    if (n.sportslist.sportsListSubCategory.sportsListCategory != null) {
                        formData.sportsListCategory = n.sportslist.sportsListSubCategory.sportsListCategory._id;
                    }
                    if (n.sportslist.sportsListSubCategory.rules != null) {
                        formData.rules = n.sportslist.sportsListSubCategory.rules._id;
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

    saveRules: function (data, callback) {
        async.eachSeries(data, function (n, callback) {
            if (n.sportslist != null && n.sportslist.sportsListSubCategory != null && n.sportslist.sportsListSubCategory.rules != null) {
                // console.log("n", n.sportslist);
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

    saveSport: function (data, callback) {
        async.eachSeries(data, function (n, callback) {
                var sportData = {};
                if (n.sportslist != null) {
                    async.parallel([
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
                                        callback(null, found);
                                    }
                                }
                            });
                        },
                        function (callback) {
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
                                        callback(null, found);
                                    }
                                }
                            });
                        },
                    ], function (err, result) {
                        if (err) {
                            callback(err, null);
                        } else {
                            if (n.weight != null) {
                                Weight.findOne({
                                    name: n.weight.name
                                }).lean().exec(function (err, found) {
                                    if (!_.isEmpty(found)) {
                                        sportData.weight = found._id;
                                    } else {
                                        sportData.weight = null;
                                    }
                                });
                            }
                            sportData.gender = n.gender;
                            sportData.maxTeam = n.maxTeam;
                            sportData.minTeamPlayers = n.minTeamPlayers;
                            sportData.maxTeamPlayers = n.maxTeamPlayers;
                            sportData.toDate = n.toDate;
                            sportData.fromDate = n.fromDate;
                            console.log("sportdata", sportData);
                            if (sportData.weight) {
                                Sport.findOne({
                                    sportslist: sportData.sportslist,
                                    gender: sportData.gender,
                                    ageGroup: sportData.ageGroup,
                                    weight: sportData.weight
                                }).lean().exec(function (err, found) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        if (_.isEmpty(found)) {
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
                                            callback(null, found);
                                        }
                                    }
                                });
                            } else {
                                Sport.findOne({
                                    sportslist: sportData.sportslist,
                                    gender: sportData.gender,
                                    ageGroup: sportData.ageGroup,
                                }).lean().exec(function (err, found) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        if (_.isEmpty(found)) {
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
                                            callback(null, found);
                                        }
                                    }
                                });
                            }
                        }
                    });
                } else {
                    callback();
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

    }


};
module.exports = _.assign(module.exports, exports, model);