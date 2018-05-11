module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    getAllPhoto: function (req, res) {
        if (req.body) {
            OldMedia.getAllPhoto(req.body, res.callback);
        } else {
            res.json({
                data: "Insufficient Data",
                value: false
            });
        }
    },

    getAllGallery: function (req, res) {
        if (req.body) {
            OldMedia.getAllGallery(req.body, res.callback);
        } else {
            res.json({
                data: "Insufficient Data",
                value: false
            });
        }
    },

    getAllPressPhoto: function (req, res) {
        if (req.body) {
            OldMedia.getAllPressPhoto(req.body, res.callback);
        } else {
            res.json({
                data: "Insufficient Data",
                value: false
            });
        }
    },


};
module.exports = _.assign(module.exports, controller);