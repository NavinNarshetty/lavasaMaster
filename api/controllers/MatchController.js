module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    getOneMatch: function (req, res) {
        if (req.body) {
            Match.getOneMatch(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    getAll: function (req, res) {
        Match.getAll(req.body, res.callback);
    },

    getOne: function (req, res) {
        if (req.body) {
            Match.getOne(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    saveMatch: function (req, res) {
        if (req.body) {
            Match.saveMatch(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    search: function (req, res) {
        if (req.body) {
            Match.search(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    uploadExcelMatch: function (req, res) {
        if (req.body.resultType && req.body.playerType && req.body.matchId || req.body.thirdPlace || req.body.range) {
            Match.uploadExcelMatch(req.body, res.callback);
        } else {
            var data = [{
                error: "All Fields Required !"
            }];
            res.callback(null, data);
        }
    },

    getSportId: function (req, res) {
        if (req.body) {
            Match.getSportId(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    updateResult: function (req, res) {
        if (req.body) {
            Match.updateResult(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    generateExcel: function (req, res) {
        console.log("req", req.body);
        if (req.body.resultType == "knockout" && req.body.playerType == "individual") {
            Match.generateExcelKnockoutIndividual(req.body, res);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },


};
module.exports = _.assign(module.exports, controller);