/**
 * UploadController
 *
 * @description :: Server-side logic for managing uploads
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    index: function (req, res) {
        function callback2(err) {
            res.callback(err, fileNames);
        }
        var fileNames = [];
        req.file("file").upload({
            maxBytes: 10000000 // 10 MB Storage 1 MB = 10^6
        }, function (err, uploadedFile) {
            if (uploadedFile && uploadedFile.length > 0) {
                async.each(uploadedFile, function (n, callback) {
                    Config.uploadFile(n.fd, function (err, value) {
                        if (err) {
                            callback(err);
                        } else {
                            fileNames.push(value.name);
                            callback(null);
                        }
                    });
                }, callback2);
            } else {
                callback2(null, {
                    value: false,
                    data: "No files selected"
                });
            }
        });
    },
    readFile: function (req, res) {
        if (req.query.file) {
            var width;
            var height;
            if (req.query.width) {
                width = parseInt(req.query.width);
                if (_.isNaN(width)) {
                    width = undefined;
                }
            }
            if (req.query.height) {
                height = parseInt(req.query.height);
                if (_.isNaN(height)) {
                    height = undefined;
                }
            }
            Config.readUploaded(req.query.file, width, height, req.query.style, res);
        } else {
            res.callback("No Such File Found");
        }

    },
    wallpaper: function (req, res) {
        Config.readUploaded(req.query.file, req.query.width, req.query.height, req.query.style, res);
    },
    rotateImage: function (req, res) {
        if (req.body) {
            console.log("file", req.body);
            Config.rotateImage(req.body.file, req.body.angle, res.callback);
        } else {
            console.log("file not found");
        }
    },
    tempTransferPing: function (req,res){
        UploadSkipLimit.find().exec(function (error, data) {
            if (error || data === undefined) {
                console.log("error in cron call", error);
            } else {
                if (!_.isEmpty(data)) {
                    if (data[0].isCronRunning === false) {
                        UploadSkipLimit.update({
                            _id: data[0]._id
                        }, {
                                isCronRunning: true
                            }, function (err, updatedRecord) {
                                Upload.gridFsToMongoImageTransfer({}, function (error, gridFsToMongoImageTransferRes) {
                                    console.log("Cron is already running gridFsToMongoImageTransfer", error, gridFsToMongoImageTransferRes);
                                });
                            });
                    } else {
                        console.log("Cron is already running");
                    }
                } else {
                    Upload.gridFsToMongoImageTransfer({}, function (error, gridFsToMongoImageTransferRes) {
                        console.log("Cron is already running gridFsToMongoImageTransfer 2", error, gridFsToMongoImageTransferRes);
                    });
                    console.log("No record found");
                }
            }          
        });
    },
    gfsToUpload: function (req,res){
        gfs.files.find().toArray(function (err, files) {
                if (err) {
                    res.callback(err, null);
                } else if (_.isEmpty(files)) {
                    res.callback(null, []);
                } else {
                    _.each(files,function(n){
                        var fileObj = {};
                        fileObj.name = n.filename;
                        fileObj.storageName = n.filename;
                        Upload.saveData(fileObj,function(err,file){
                            if (err) {
                                res.callback(err, null);
                            } else if (_.isEmpty(file)) {
                                res.callback(null, []);
                                // console.log('Empty');
                            } else {
                                console.log('success');
                                //res.callback(null, file);
                            }
                        });
                    });
                res.callback(null,'Successfully Uploaded');
            }
        });
    }
};
