var vimeo = require('../../vimeoLibrary/vimeo').Vimeo;
var request = require('request');
var schema = new Schema({
    clientId: String,
    clientSecret: String,
    accessToken: String
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Vimeo', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {


    setVimeo: function (data, callback) {
        async.waterfall([
                function (callback) {
                    Vimeo.findOne().lean().exec(function (err, client) {
                        if (err || _.isEmpty(client)) {
                            callback(null, {
                                error: "No Data"
                            });
                        } else {
                            callback(null, client);
                        }
                    });
                },
                function (client, callback) {
                    if (client.error) {
                        callback(null, client);
                    } else {
                        CLIENT_ID = client.clientId;
                        CLIENT_SECRET = client.clientSecret;
                        console.log('1');
                        var lib = new vimeo(CLIENT_ID, CLIENT_SECRET);
                        console.log('2');
                        if (client.accessToken) {
                            lib.access_token = client.accessToken;
                            lib.streamingUpload(data,
                                function (err, body, status, headers) {
                                    if (err) {
                                        return console.log(err);
                                    }
                                    callback(null, status);
                                }
                            );
                        } else {
                            callback(null, "Access Token Not Found");
                        }
                    }
                },
            ],
            function (err, data2) {

                if (err) {
                    callback(null, []);
                } else if (data2) {
                    if (_.isEmpty(data2)) {
                        callback(null, data2);
                    } else {
                        callback(null, data2);
                    }
                }
            });

    },

    generateToken: function (data, callback) {
        async.waterfall([
                function (callback) {
                    Vimeo.findOne().lean().exec(function (err, client) {
                        if (err || _.isEmpty(client)) {
                            callback(null, {
                                error: "No Data"
                            });
                        } else {
                            callback(null, client);
                        }
                    });
                },
                function (client, callback) {
                    if (client.error) {
                        callback(null, client);
                    } else {
                        CLIENT_ID = client.clientId;
                        CLIENT_SECRET = client.clientSecret;
                        var lib = new vimeo(CLIENT_ID, CLIENT_SECRET, client.accessToken);
                        var formData = {
                            method: 'get',
                            // body: data, // Javascript object
                            // json: true, // Use,If you are sending JSON data
                            url: "https://api.vimeo.com/me",
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Authorization', 'bearer[' + client.accessToken + ']');
                                xhr.setRequestHeader('consumer_key', '[' + CLIENT_ID + ']');
                                xhr.setRequestHeader('consumer_secret', '[' + CLIENT_SECRET + ']');
                                xhr.setRequestHeader('Accept', 'application/vnd.vimeo.*+json;version=3.0');
                                xhr.setRequestHeader('client_id', '[69338819]');
                            },
                            // header: {
                            //     // "Authorization": "Basic" + base64.encode(CLIENT_ID + ":" + CLIENT_SECRET),
                            //     "WWW-Authenticate": "Basic" + base64.encode(CLIENT_ID + ":" + CLIENT_SECRET)
                            // }
                        }
                        request(formData, function (err, res) {
                            if (err) {
                                console.log('Error :', err)
                                return
                            }
                            // console.log(' Body :', body)
                            callback(null, res);
                        });
                    }
                }
            ],
            function (err, data2) {

                if (err) {
                    callback(null, []);
                } else if (data2) {
                    if (_.isEmpty(data2)) {
                        callback(null, data2);
                    } else {
                        callback(null, data2);

                    }
                }
            });
    },

    authenticateCloud: function (data, callback) {
        var final = [];
        console.log("inside");
        const Storage = require('@google-cloud/storage');
        const projectId = 'future-oasis-145313';
        GoogleCredencials.findOne().lean().exec(function (err, keys) {
            if (err || _.isEmpty(keys)) {
                callback(null, {
                    error: "No Data"
                });
            } else {
                const storage = new Storage({
                    projectId: projectId,
                    keyFilename: '/home/wohlig/Documents/htdocs/lavasaBackend/config/googleKey/client_secret.json'
                });
                const bucketName = 'sportsforall';
                const bucketName1 = 'media&gallery/';
                storage
                    .bucket(bucketName)
                    .getFiles()
                    .then(results => {
                        var files = results[0];
                        console.log('Files:');
                        files.forEach(file => {
                            var temp = {};
                            temp.fileName = file.name;
                            final.push(temp);
                        });
                        callback(null, final);
                    })
                    .catch(err => {
                        console.error('ERROR:', err);
                        callback(err, null);
                    });
            }
        });
    },


};
module.exports = _.assign(module.exports, exports, model);