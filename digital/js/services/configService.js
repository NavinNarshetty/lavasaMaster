  myApp.service('configService', function ($http, TemplateService, $state, toastr, NavigationService, errorService) {
    this.getDetail = function (callback) {
        $http({
            url: adminurl + 'ConfigProperty/getDetail',
            method: 'POST',
        }).then(function (data) {
            var all = {};
            errorService.errorCode(data, function (allData, callback) {
                if (!allData.message) {
                    if (allData.value === true) {
                        all.city = allData.data.city;
                        all.district = allData.data.district;
                        all.state = allData.data.state;
                        all.year = allData.data.year;
                        all.eventYear = allData.data.eventYear;
                        all.sfaCity = allData.data.sfaCity;
                        all.venue = allData.data.venue;
                        all.infoId = allData.data.infoId;
                        all.infoNo = allData.data.infoNo;
                        all.infoNoArr = allData.data.infoNoArr;
                        all.date = allData.data.date;
                        all.sports = allData.data.sports;
                        all.eventName = allData.data.eventName;
                        if (allData.data.type == 'school') {
                            all.isCollege = false;
                            all.type = allData.data.type;
                            // set Jstorage:IsColg
                            NavigationService.setIsColg(all.type);
                        } else {
                            all.isCollege = true;
                            all.type = allData.data.type;
                            // set Jstorage:IsColg
                            NavigationService.setIsColg(all.type);
                        }
                    }
                } else {
                    toastr.error(allData.message, 'Error Message');
                }
            });
            callback(all);
        });
    };
});
