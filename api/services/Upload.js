global.md5 = require("md5");
var schema = new Schema({
    name: {
        type: String,
        index: true
    },
    size: {
        type: Number
    },
    storageName: {
        type: String,
        index: true
    },
    location: {
        type: String,
        index: true
    },
    downloadLink: {
        type: String,
        index: true
    },
    sizes: [{
        width: {
            type: String,
            index: true
        },
        height: {
            type: String,
            index: true
        },
        style: {
            type: String,
            index: true
        },
        storageName: {
            type: String,
            index: true
        }
    }]
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Upload', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {
    // cron.schedule('*/10 * * * * *', function () {
    //         console.log('**** Cron Run for grid to mongo ref ****');
    //         UploadFileInfo.find().exec(function (error, data) {
    //             if (error || data === undefined) {
    //                 console.log("error in cron call", error);
    //             } else {
    //                 if (!_.isEmpty(data)) {
    //                     if (data[0].isCronRunning === false) {
    //                         UploadFileInfo.update({
    //                             _id: data[0]._id
    //                         }, {
    //                                 isCronRunning: true
    //                             }, function (err, updatedRecord) {
    //                                 Upload.gridFsToMongoImageTransfer({}, function (error, gridFsToMongoImageTransferRes) {
    //                                     console.log("Cron is already running gridFsToMongoImageTransfer", error, gridFsToMongoImageTransferRes);
    //                                 })

    //                             })
    //                     } else {
    //                         console.log("Cron is already running");
    //                     }
    //                 } else {
    //                     Upload.gridFsToMongoImageTransfer({}, function (error, gridFsToMongoImageTransferRes) {
    //                         console.log("Cron is already running gridFsToMongoImageTransfer 2", error, gridFsToMongoImageTransferRes);
    //                     })
    //                     console.log("No record found");
    //                 }
    //             }
    //         });
    //     });

    convertUploadObj: function (uploadObject) {
        var obj = {
            name: uploadObject.filename,
            size: uploadObject.size,
            storageName: uploadObject.fd,
            location: uploadObject.extra.Location,
            downloadLink: uploadObject.extra.mediaLink
        };
        return obj;
    },

    findFile: function (fileObj, callback) {
        var obj;
        if (fileObj.file.indexOf(".") > 0) {
            obj = {
                name: fileObj.file
            };
        } else {
            obj = {
                _id: fileObj.file
            };
        }
        if (fileObj || fileObj.file) {
            Upload.findOne(obj, function (err, data) {
                if (err || _.isEmpty(data)) {
                    callback(err);
                } else {
                    if (fileObj.width || fileObj.height) {
                        Upload.generateFile(data, fileObj, callback);
                    } else {
                        callback(null, data);
                    }
                }
            });
        }
    },

    generateFile: function (data, fileObj, callback) {
        var resizeVal = {};
        if (fileObj.width && !_.isNaN(parseInt(fileObj.width))) {
            resizeVal.width = parseInt(fileObj.width);
        } else {
            resizeVal.width = Jimp.AUTO;
            fileObj.width = 0;
        }
        if (fileObj.height && !_.isNaN(parseInt(fileObj.height))) {
            resizeVal.height = parseInt(fileObj.height);
        } else {
            resizeVal.height = Jimp.AUTO;
            fileObj.height = 0;
        }
        if ((fileObj.style == "cover" || fileObj.style == "scaleToFit" || fileObj.style == "resize") && (fileObj.width && !_.isNaN(parseInt(fileObj.width)) && fileObj.height && !_.isNaN(parseInt(fileObj.height)))) {
            resizeVal.style = fileObj.style;
        } else {
            resizeVal.style = "contain";
            fileObj.style = "contain";
        }
        var finalObject = _.find(data.sizes, function (size) {
            return (size.width == fileObj.width && size.height == fileObj.height && size.style == fileObj.style);
        });
        if (finalObject) {
            callback(null, finalObject);
        } else {
            Jimp.read(data.location, function (err, image) {
                if (err) {
                    callback(err);
                } else if (image) {
                    image[resizeVal.style](resizeVal.width, resizeVal.height).quality(60).getBuffer(Jimp.MIME_PNG, function (err, buffer) {
                        fileObj.storageName = md5(JSON.stringify(fileObj)) + data.storageName;
                        var file = storage.bucket(storageBucket).file(fileObj.storageName);
                        var wstream = file.createWriteStream({
                            metadata: {
                                contentType: Jimp.MIME_PNG,
                            },
                            public: true
                        });
                        wstream.write(buffer);
                        wstream.end();
                        wstream.on('finish', function () {
                            data.sizes.push(fileObj);
                            data.save();
                            callback(null, fileObj);
                        });
                    });
                }

            });
        }
    },

    gridFsToMongoImageTransfer: function (req, res) {

        var skip = 0;
        var limit = 25;
        var skipData = {};
        var fileFound = true;
        async.waterfall([
            function (callback) {
                UploadSkipLimit.find().exec(function (error, infoFound) {
                    if (error || infoFound == undefined) {
                        console.log("gridFsToMongoImageTransfer >>> UploadSkipLimit >>> error", error);
                        cb(error, null);
                    } else {
                        console.log("infoFound", infoFound);
                        if (!_.isEmpty(infoFound)) {
                            skipData = infoFound[0];
                            skip = infoFound[0].skip;
                            limit = infoFound[0].limit;
                            // if (_.isEmpty(infoFound[0].limit)) {
                            //     limit = limit;
                            // } else {
                            //     limit = infoFound[0].limit;
                            // }
                            callback(null, {
                                skip: skip,
                                limit: limit
                            });
                        } else {
                            callback(null, {
                                skip: skip,
                                limit: limit
                            });
                        }


                    }
                });
            },
            function (data, callback) {
                Upload.getNameOfFiles(data, callback);
            },
            function (gridFs, callback) {
                if (!_.isEmpty(gridFs)) {
                    fileFound = true;
                    console.log("gridFs length", gridFs.length);
                    async.concatLimit(gridFs, 5, function (gridFile, callback1) {
                        console.log("is ", gridFile.name, " check name");
                        if (gridFile.name && gridFile.name.search("-") < 0) {
                            var myBucket = global.storage.bucket(storageBucket);
                            var file = myBucket.file(gridFile.storageName);
                            console.log("is ", gridFile.name, " check name inside if");
                            file.exists().then((data) => {
                                // console.log("is ", gridFile.storageName, " exits ", data[0]);
                                if (data[0] === false) {
                                    gfs.exist({
                                        filename: gridFile.name
                                    }, function (err, found) {
                                        if (err) return handleError(err);
                                        if (found) {
                                            console.log('File exists', found);
                                            console.log("is ", gridFile.storageName, " exits (before transfer)", data[0]);
                                            var readstream = gfs.createReadStream({
                                                filename: gridFile.name
                                            });
                                            var remoteWriteStream = myBucket.file(gridFile.name).createWriteStream();
                                            remoteWriteStream.on('error', function (err) {
                                                Upload.saveFileAsError(gridFile.name, function () {});
                                                callback1(null, gridFile.name);
                                                console.log(err);
                                            });
                                            remoteWriteStream.on('finish', function () {
                                                callback1(null, {
                                                    fileName: gridFile.name,
                                                    status: "success"
                                                });
                                            });
                                            readstream.pipe(remoteWriteStream);
                                        } else {
                                            console.log('File does not exist');
                                            Upload.saveFileAsError(gridFile.name, function () {});
                                            callback1(null, gridFile.name);
                                            console.log(err);
                                        }
                                    });
                                } else {
                                    callback1();
                                }
                            })
                        } else {
                            callback1(null);
                        }
                    }, callback);
                } else {
                    fileFound = false;
                    callback();
                }

            },
            function (saveSkip, callback) {
                if (fileFound == true) {
                    skipData.skip = skip + limit;
                    skipData.limit = limit;
                } else if (fileFound == false) {
                    skipData.skip = skip + limit;
                    skipData.limit = limit;
                }
                skipData.isCronRunning = false;
                UploadSkipLimit.saveData(skipData, callback);
            }
        ], res.callback)
    },

    getNameOfFiles: function (data, callback) {
        Upload.find().skip(data.skip).limit(data.limit).exec(callback);
    },

    saveFileAsError: function (filename, callback) {
        ErrorFiles.saveData({
            name: filename
        }, callback);
    },

    reverseOrderMongoToCloud: function (req, callback) {

        var skip = 0;
        var limit = 500;
        var skipData = {};
        var fileFound = true;

        async.waterfall([
            function (callback) {
                UploadFileReverseInfo.find().exec(function (error, infoFound) {
                    if (error || infoFound == undefined) {
                        console.log("reverseOrderMongoToCloud >>> UploadSkipLimit >>> error", error);
                        cb(error, null);
                    } else {
                        console.log("infoFound", infoFound);
                        if (!_.isEmpty(infoFound)) {
                            skipData = infoFound[0];
                            skip = infoFound[0].skip;
                            limit = infoFound[0].limit;
                            callback(null, {
                                skip: skip,
                                limit: limit
                            });
                        } else {
                            callback(null, {
                                skip: skip,
                                limit: limit
                            });
                        }


                    }
                });
            },
            function (data, callback) {
                gfs.files.find().sort({
                    uploadDate: -1
                }).skip(data.skip).limit(data.limit).toArray(callback);
                // gfs.files.find().sort({ uploadDate: -1 }).skip(2).limit(1).toArray(callback);
            },
            function (gridFs, callback) {
                if (!_.isEmpty(gridFs)) {
                    fileFound = true;
                    console.log("gridFs length", gridFs.length);
                    async.concatLimit(gridFs, 5, function (gridFile, callback1) {

                        var myBucket = global.storage.bucket(storageBucket)
                        var file = myBucket.file(gridFile.filename);

                        file.exists().then((data) => {
                            // console.log("is ", gridFile.storageName, " exits ", data[0]);
                            if (data[0] === false) {
                                console.log(gridFile.filename, " uploading to server", data[0]);
                                var readstream = gfs.createReadStream({
                                    filename: gridFile.filename
                                });
                                var remoteWriteStream = myBucket.file(gridFile.filename).createWriteStream();
                                remoteWriteStream.on('error', function (err) {
                                    Upload.saveFileAsError(gridFile.filename, function () {});
                                    callback1(null, gridFile.filename);
                                    console.log(err);
                                });
                                remoteWriteStream.on('finish', function (data) {
                                    // console.log("data", data);
                                    // callback1(null, {
                                    //     fileName: gridFile.filename,
                                    //     status: "success"
                                    // });
                                    var obj = {
                                        name: gridFile.filename,
                                        storageName: gridFile.filename
                                    }
                                    Upload.findOne({
                                        name: gridFile.filename
                                    }).exec(function (err, data) {
                                        if (err || _.isEmpty(data)) {
                                            callback1(err);
                                        } else {
                                            if (_.isEmpty(data)) {
                                                Upload.saveData(obj, function (err, data) {
                                                    if (err || _.isEmpty(data)) {
                                                        callback1(err);
                                                    } else {
                                                        callback1(err, data._id);
                                                    }
                                                });
                                            } else {
                                                callback1(null, {
                                                    message: "already uploaded in upload table",
                                                    status: "success"
                                                });
                                            }
                                        }
                                    })

                                });
                                readstream.pipe(remoteWriteStream);
                            } else {
                                callback1();
                            }
                        })
                    }, callback);
                } else {
                    fileFound = false;
                    callback();
                }

            },
            function (saveSkip, callback) {
                if (fileFound == true) {
                    skipData.skip = skip + limit;
                    skipData.limit = limit;
                } else if (fileFound == false) {
                    skipData.skip = 0;
                    skipData.limit = limit;
                }
                skipData.isCronRunning = false;
                UploadFileReverseInfo.saveData(skipData, callback);
            }
        ], callback)
    },

    gridFsToUploadsTransfer: function (data, callback) {
        var skip = 0;
        var limit = 25;
        var skipData = {};
        var fileFound = true;

        async.waterfall([
            function (callback) {
                UploadSkipLimit.find().exec(function (error, infoFound) {
                    if (error || infoFound == undefined) {
                        console.log("gridFsToMongoImageTransfer >>> UploadSkipLimit >>> error", error);
                        cb(error, null);
                    } else {
                        // console.log("infoFound", infoFound);
                        if (!_.isEmpty(infoFound)) {
                            skipData = infoFound[1];
                            // skip = infoFound[1].skip;
                            // limit = infoFound[1].limit;
                            // if (_.isEmpty(infoFound[0].limit)) {
                            //     limit = limit;
                            // } else {
                            //     limit = infoFound[0].limit;
                            // }
                            callback(null, {
                                skip: skip,
                                limit: limit
                            });
                        } else {
                            callback(null, {
                                skip: skip,
                                limit: limit
                            });
                        }
                    }
                });
            },
            function (data, callback) {
                ErrorFiles.find().limit(100).exec(callback);
            },
            function (gridFs, callback) {
                if (!_.isEmpty(gridFs)) {
                    fileFound = true;
                    console.log("gridFs length", gridFs.length);
                    async.concatLimit(gridFs, 5, function (gridFile, callback1) {
                        console.log("is ", gridFile.name, " check name");
                        if (gridFile.name && gridFile.name.search("-") < 0) {
                            var myBucket = global.storage.bucket(storageBucket)
                            var file = myBucket.file(gridFile.name);
                            console.log("is ", gridFile.name, " check name inside if");
                            file.exists().then((data) => {
                                // console.log("is ", gridFile.storageName, " exits ", data[0]);
                                if (data[0] === false) {
                                    console.log("is ", gridFile.name, " exits (before transfer)", data[0]);
                                    var readstream = gfs.createReadStream({
                                        filename: gridFile.name
                                    });
                                    var remoteWriteStream = myBucket.file(gridFile.name).createWriteStream();
                                    remoteWriteStream.on('error', function (err) {
                                        Upload.deleteFileFromSaveFiles(gridFile.name, function () {});
                                        Upload.saveFileAsError(gridFile.name, function () {});
                                        callback1(null, gridFile.name);
                                        console.log(err);
                                    });
                                    remoteWriteStream.on('finish', function () {
                                        Upload.deleteFileFromSaveFiles(gridFile.name, function () {});
                                        callback1(null, {
                                            fileName: gridFile.name,
                                            status: "success"
                                        });
                                    });
                                    readstream.pipe(remoteWriteStream);
                                } else {
                                    Upload.deleteFileFromSaveFiles(gridFile.name, function () {});
                                    callback1();
                                }
                            })
                        } else {
                            Upload.deleteFileFromSaveFiles(gridFile.name, function () {});
                            callback1(null);
                        }
                    }, callback);
                } else {
                    fileFound = false;
                    callback();
                }

            },

            //Function to store skip and limit into data base 
            function (data, callback) {
                skipData.isCronRunning = false;
                skipData.save(callback);
            }
        ], callback)
    },

    //To delete file from save files
    deleteFileFromSaveFiles: function (filename, callback) {
        ErrorFiles.deleteOne({
            name: filename
        }, callback);
    },
};

module.exports = _.assign(module.exports, exports, model);