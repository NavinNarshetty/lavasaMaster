var uploadurl = adminurl + "upload/";
myApp.factory('NavigationService', function ($http) {
    var navigation = [{
            name: "Home",
            classis: "active",
            anchor: "home",
            subnav: [{
                name: "Subnav1",
                classis: "active",
                anchor: "home"
            }]
        }, {
            name: "Form",
            classis: "active",
            anchor: "form",
            subnav: []
        },
        {
            name: "Grid",
            classis: "active",
            anchor: "grid",
            subnav: []
        }
    ];

    return {
        getNavigation: function () {
            return navigation;
        },
        getOneMatch: function(formData, callback){
          $http({
              url: adminurl + "match/getOne",
              method: "POST",
              data: formData
          }).success(function (data) {
            console.log(data,"nav");
              callback(data)
          });
        },
        saveMatch: function(formData, callback){
          // console.log(formData, 'saveMatch');
          $http({
              url: adminurl + "match/updateResult",
              method: "POST",
              data: formData
          }).success(function (data) {
              callback(data)
          });
        }
    };
});
