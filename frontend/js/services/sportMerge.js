myApp.service('sportMergeService', function ($http, TemplateService, $state, toastr, $uibModal, NavigationService) {

  this.sportMerge = function (sportArr) {
    console.log("sportArr", sportArr);
    _.each(sportArr, function (key) {
      if (key) {
        var keyNameArr = _.split(key.name, ' ');
        if (keyNameArr.length > 2) {
          key.removeSport = true;
        } else if (keyNameArr.length == 2) {
          if (keyNameArr[1] === 'Doubles') {
            key.removeSport = true;
          }
        }
      }
    });
    sportArr = _.filter(sportArr, function (n) {
      return !n.removeSport;
    });
    // console.log(sportArr, "in service")
    return sportArr;



  }

});