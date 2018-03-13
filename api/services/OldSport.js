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
                async.waterfall([
                    function (callback) {
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
                            if (n.sportslist.sportsListSubCategory.rules != null) {
                                Rules.findOne({
                                    name: n.sportslist.rules.name
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

    saveSport: function (data, callback) {
        async.eachSeries(data.sport, function (n, callback) {
                var sportData = {};
                if (n.sportslist) {
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
                                        }).lean().exec(function (err, found) {
                                            if (err) {
                                                callback(err, null);
                                            } else {
                                                if (_.isEmpty(found)) {
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
                                                    callback(null, found);
                                                }
                                            }
                                        });
                                    } else {
                                        var arr = [];
                                        arr = found.eventId;
                                        arr.push(data.event._id);
                                        var updateObj = {
                                            $set: {
                                                eventId: arr
                                            }
                                        };
                                        Sport.update({
                                            matchId: found._id
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
                                sportData.weight = null;
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
                                }).lean().exec(function (err, found) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        if (_.isEmpty(found)) {
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
                                            var arr = [];
                                            arr = found.eventId;
                                            arr.push(data.event._id);
                                            var updateObj = {
                                                $set: {
                                                    eventId: arr
                                                }
                                            };
                                            Sport.update({
                                                matchId: found._id
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