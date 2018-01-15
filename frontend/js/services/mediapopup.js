myApp.service('MediaPopupService', function ($http, $uibModal, TemplateService, $state, NavigationService, $timeout) {
  // SERVICE START
  // VARIABLE INITIATIALISATION
  var modalInstance;
  var page = this;

  // VARIABLE INITIATIALISATION END
  // FUNCTIONS
  // NEXT SLIDE FUNCTION
  this.nextSlide = function (currentIndex, sliderArr, pageScope) {
    pageScope.currentIndex = currentIndex + 1;
    pageScope.currentPic = sliderArr[currentIndex + 1];
    this.checkSlide(pageScope.currentIndex, sliderArr, pageScope);

  };
  // NEXT SLIDE FUNCTION END
  // PREVIOUS SLIDE FUNCTION
  this.prevSlide = function (currentIndex, sliderArr, pageScope) {
    pageScope.currentIndex = currentIndex - 1;
    pageScope.currentPic = sliderArr[currentIndex - 1];
    this.checkSlide(pageScope.currentIndex, sliderArr, pageScope);
  };
  // PREVIOUS SLIDE FUNCTION END
  // CHECK SLIDE FOR ARROW
  this.checkSlide = function (index, sliderArr, pageScope) {
    console.log(sliderArr);
    if (index == 0) {
      pageScope.firstSlide = true;
    } else {
      pageScope.firstSlide = false;
    }
    if (index == sliderArr.length - 1) {
      pageScope.lastSlide = true;
    } else {
      pageScope.lastSlide = false;
    }
    console.log("First", pageScope.firstSlide);
    console.log("Last", pageScope.lastSlide);
  }
  // CHECK SLIDE FOR ARROW END
  // OPEN POPUP
  this.openMediaPopup = function (index, slideArr, pageScope) {
    pageScope.currentPic = slideArr[index];
    pageScope.currentIndex = index;
    pageScope.firstSlide = false;
    pageScope.lastSlide = false;
    console.log(pageScope.currentPic);
    this.checkSlide(pageScope.currentIndex, slideArr, pageScope);
    modalInstance = $uibModal.open({
      animation: true,
      scope: pageScope,
      backdrop: true,
      keyboard: true,
      size: 'lg',
      templateUrl: 'views/modal/photovideo-popup.html',
      windowClass: 'photovideo-modal'
    }).closed.then(function () {
      console.log("chahc");
      page.onkeydown = function (e) {
        $(page).off(e);
      };
    });
    // INITIALISE KEY NEXT PREV
    $timeout(function () {
      document.keydown = function (e) {
        switch (e.keyCode) {
          case 37:
          case 38:
            page.prevSlide();
            // e.preventDefault();
            break;
          case 39:
          case 40:
            page.nextSlide();
            // e.preventDefault();
            break;
        }
      };
    }, 300);
  };
  // OPEN POPUP END
  // FUNCTIONS END
  // SERVICE END
});
