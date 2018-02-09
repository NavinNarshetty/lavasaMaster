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
            Vimeo.getAllFolderNameCloud(req.body, res.callback);
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
            Vimeo.getFilesPerFolder(req.body, res.callback);
        } else {
            res.json({
                "data": "Insufficient Data",
                "value": false
            });
        }
    },

    authenticateCloud: function (req, res) {
        console.log("vimeo");
        Vimeo.authenticateCloud(req.body, res.callback);
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

};
module.exports = _.assign(module.exports, controller);