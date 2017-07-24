 var fs = require('fs');
 var schema = new Schema({
     institutionType: String,
     deleteStatus: Boolean,
     timestamp: Date,
     sfaid: String,
     name: String,
     board: String,
     status: Boolean,
     address: String,
     location: String,
     email: String,
     contact: String,
     department: [{
         email: String,
         contact: String,
         designation: String,
         name: String,
         year: String,
     }],
     image: [{
         type: String
     }],
     video: [{
         type: String
     }],
     contingentLeader: [{
         type: String
     }],
     sports: [{
         year: String,
         sporttype: String,
         name: String,
     }],
     principal: String,
     paymentType: String,
     numberOfSports: String,
     representative: String,
     notpaidfor: String,
     year: [{
         type: String
     }],
     totalPoints: Number,
     totalPoints2015: Number,
     totalPoints2016: Number,
     totalPoints2017: Number,
     isRegistered: {
         type: Boolean,
         default: false
     }
 });

 schema.plugin(deepPopulate, {});
 schema.plugin(uniqueValidator);
 schema.plugin(timestamps);
 module.exports = mongoose.model('School', schema);

 var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
 var model = {

     search: function (data, callback) {

         var Model = this;
         var Const = this(data);
         var maxRow = Config.maxRow;

         var page = 1;
         if (data.page) {
             page = data.page;
         }
         var field = data.field;
         var options = {
             field: data.field,
             filters: {
                 keyword: {
                     fields: ['sfaid', 'name', 'institutionType'],
                     term: data.keyword
                 }
             },
             sort: {
                 asc: 'createdAt'
             },
             start: (page - 1) * maxRow,
             count: maxRow
         };
         async.waterfall([
                 function (callback) {
                     ConfigProperty.find().lean().exec(function (err, property) {
                         if (err) {
                             callback(err, null);
                         } else {
                             if (_.isEmpty(property)) {
                                 callback(null, []);
                             } else {
                                 callback(null, property);
                             }
                         }
                     });
                 },
                 function (property, callback) {
                     console.log("property", property[0].institutionType);
                     console.log("keyword", data.keyword);
                     var type = property[0].institutionType;
                     if (data.keyword == undefined) {
                         var matchObj = {
                             $or: [{
                                 institutionType: type
                             }]
                         };
                     } else {
                         var matchObj = {
                             institutionType: type,
                             $or: [{
                                 sfaid: {
                                     $regex: data.keyword,
                                     $options: "i"
                                 },
                             }, {
                                 name: {
                                     $regex: data.keyword,
                                     $options: "i"
                                 },
                             }]
                         };

                     }
                     var Search = Model.find(matchObj)

                         .order(options)
                         .keyword(options)
                         .page(options, callback);

                 }
             ],
             function (err, data2) {
                 if (err) {
                     console.log(err);
                     callback(err, null);
                 } else {
                     callback(null, data2);
                 }

             });



     },

     updateSFAID: function (data, callback) {
         var result = {};
         result.msg = "Updated";
         School.find().exec(function (err, found) {
             if (err) {
                 callback(err, null);
             } else if (_.isEmpty(found)) {
                 callback(null, "Data is empty");
             } else {
                 var count = 0;
                 async.eachSeries(found, function (value, callback) {

                     console.log("sfa:", value.timestamp);
                     // var year = value.timestamp.getFullYear().toString().substr(2, 2);
                     // console.log("index", year);
                     count++;
                     var sfa = "M" + "S" + "16" + value.sfaid;
                     School.update({
                         _id: value._id,
                     }, {
                         sfaid: sfa,
                     }).exec(function (err, updated) {
                         if (err) {
                             console.log("error :", err);
                             callback(null, err);
                         } else {

                             callback(null, updated);
                         }
                     });

                 }, function (err) {
                     if (err) {
                         console.log(err);
                         callback(err, null);
                     } else {
                         result.count = count;
                         console.log("count", count);
                         callback(null, result);
                     }
                 });

                 //callback(null, found);
             }
         });


     },

     updateType: function (data, callback) {
         var result = {};
         result.msg = "Updated";
         School.find().exec(function (err, found) {
             if (err) {
                 callback(err, null);
             } else if (_.isEmpty(found)) {
                 callback(null, "Data is empty");
             } else {
                 var count = 0;
                 async.eachSeries(found, function (value, callback) {
                     count++;
                     var institutionType = "School";
                     School.update({
                         _id: value._id,
                     }, {
                         institutionType: institutionType,
                     }).exec(function (err, updated) {
                         if (err) {
                             console.log("error :", err);
                             callback(null, err);
                         } else {

                             callback(null, updated);
                         }
                     });

                 }, function (err) {
                     if (err) {
                         console.log(err);
                         callback(err, null);
                     } else {
                         result.count = count;
                         console.log("count", count);
                         callback(null, result);
                     }
                 });

                 //callback(null, found);
             }
         });


     },

     getAllSchoolDetails: function (data, callback) {
         School.find().exec(function (err, found) {
             if (err) {
                 callback(err, null);
             } else if (_.isEmpty(found)) {
                 callback(null, "Data is empty");
             } else {
                 callback(null, found);
             }
         });

     },

     generateExcel: function (res) {
         console.log("dataIN");
         async.waterfall([
                 function (callback) {
                     ConfigProperty.find().lean().exec(function (err, property) {
                         if (err) {
                             callback(err, null);
                         } else {
                             if (_.isEmpty(property)) {
                                 callback(null, []);
                             } else {
                                 callback(null, property);
                             }
                         }
                     });
                 },
                 function (property, callback) {
                     var type = property[0].institutionType;
                     School.find({
                         institutionType: type
                     }).lean().exec(function (err, data) {
                         var excelData = [];
                         _.each(data, function (n) {
                             var obj = {};
                             obj.sfaId = n.sfaid;
                             obj.name = n.name;
                             var dateTime = moment.utc(n.createdAt).utcOffset("+05:30").format('YYYY-MM-DD HH:mm');
                             obj.date = dateTime;
                             excelData.push(obj);
                         });

                         Config.generateExcel("oldSchool", excelData, res);
                     });
                 }
             ],
             function (err, data2) {
                 if (err) {
                     console.log(err);
                     callback(null, []);
                 } else if (data2) {
                     if (_.isEmpty(data2)) {
                         callback(null, []);
                     } else {
                         callback(null, data2);
                     }
                 }
             });

     },
 };
 module.exports = _.assign(module.exports, exports, model);