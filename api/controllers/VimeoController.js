module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    setVimeo: function (req, res) {
        Vimeo.setVimeo(req.body, res.callback);
    },

    generateToken: function (req, res) {
        Vimeo.generateToken(req.body, res.callback);
    },

    getAllFolderNameCloud: function (req, res) {
        console.log("vimeo");
        if (req.body && req.body.folderType) {
            ConfigProperty.find().lean().exec(function (err, property) {
                if (err) {
                    res.callback(err, null);
                } else {
                    if (_.isEmpty(property)) {
                        res.callback(null, {
                            "data": "ConfigProperty Empty",
                            "value": false
                        });
                    } else {
                        console.log("property", property);
                        req.body.keyfileName = property[0].keyfileName;
                        Vimeo.getAllFolderNameCloud(req.body, res.callback);
                    }
                }
            });


        } else {
            res.json({
                "data": "Insufficient Data",
                "value": false
            });
        }
    },

    getFilesPerFolder: function (req, res) {
        console.log("vimeo");
        if (req.body && req.body.folderType && req.body.folderName) {
            ConfigProperty.find().lean().exec(function (err, property) {
                if (err) {
                    res.callback(err, null);
                } else {
                    if (_.isEmpty(property)) {
                        res.callback(null, {
                            "data": "ConfigProperty Empty",
                            "value": false
                        });
                    } else {
                        console.log("property", property);
                        req.body.keyfileName = property[0].keyfileName;
                        Vimeo.getFilesPerFolder(req.body, res.callback);
                    }
                }
            });

        } else {
            res.json({
                "data": "Insufficient Data",
                "value": false
            });
        }
    },

    authenticateCloud: function (req, res) {
        ConfigProperty.find().lean().exec(function (err, property) {
            if (err) {
                res.callback(err, null);
            } else {
                if (_.isEmpty(property)) {
                    res.callback(null, {
                        "data": "ConfigProperty Empty",
                        "value": false
                    });
                } else {
                    console.log("property", property);
                    req.body.keyfileName = property[0].keyfileName;
                    Vimeo.authenticateCloud(req.body, res.callback);
                }
            }
        });

    },

    videoUpload: function (req, res) {
        Vimeo.videoUpload(req.body, res.callback);
    },

    setVideoDescription: function (req, res) {
        Vimeo.setVideoDescription(req.body, res.callback);
    },

    thumbnailsUpdate: function (req, res) {
        Vimeo.thumbnailsUpdate(req.body, res.callback);
    },

    thumbnailsUpdateMedia: function (req, res) {
        Vimeo.thumbnailsUpdateMedia(req.body, res.callback);
    },

    deleteFolderImage: function (req, res) {
        ConfigProperty.find().lean().exec(function (err, property) {
            if (err) {
                res.callback(err, null);
            } else {
                if (_.isEmpty(property)) {
                    res.callback(null, {
                        "data": "ConfigProperty Empty",
                        "value": false
                    });
                } else {
                    console.log("property", property);
                    req.body.keyfileName = property[0].keyfileName;
                    Vimeo.deleteFolderImage(req.body, res.callback);
                }
            }
        });

    },

};
module.exports = _.assign(module.exports, controller);