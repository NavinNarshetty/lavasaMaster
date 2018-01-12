myApp.service('MediaPopupService', function($http, $uibModal, TemplateService, $state, NavigationService, $timeout){
  // SERVICE START
  // VARIABLE INITIATIALISATION
  var modalInstance;
  var firstSlide = false;
  var lastSlide = false;
  var page = this;
  var currentIndex, sliderArr;
  // VARIABLE INITIATIALISATION END
  // FUNCTIONS
  // NEXT SLIDE FUNCTION
  this.nextSlide = function(){
    console.log("Next Slide");
  }
  // NEXT SLIDE FUNCTION END
  // PREVIOUS SLIDE FUNCTION
  this.prevSlide = function(){
    console.log("Prevous Slide");
  }
  // PREVIOUS SLIDE FUNCTION END
  // CHECK SLIDE FOR ARROW
  this.checkSlide = function(index, sliderArr){
    console.log(sliderArr);
    if (index == 0) {
      firstSlide = true;
    }
    if(index == sliderArr.length-1){
      lastSlide = true;
    }
    console.log("First", firstSlide);
    console.log("Last", lastSlide);
  }
  // CHECK SLIDE FOR ARROW END
  // OPEN POPUP
  this.openMediaPopup = function(index, slideArr, pageScope){
    // console.log("openMediaPopup");

        modalInstance = $uibModal.open({
          animation: true,
          scope: pageScope,
          backdrop: true,
          keyboard: true,
          size: 'lg',
          templateUrl: 'views/modal/photovideo-popup.html',
          windowClass: 'photovideo-modal'
        }).closed.then(function(){
          console.log("chahc");
          page.onkeydown = function(e) {
            $(page).off(e);
          };
        })
        // INITIALISE KEY NEXT PREV
        $timeout(function () {
          page.onkeydown = function(e) {
            switch (e.keyCode) {
              case 37:
              case 38:
                page.prevSlide();
                e.preventDefault();
              break;
              case 39:
              case 40:
                page.nextSlide();
                e.preventDefault();
              break;
            }
          };
        }, 50);
        // INITIALISE KEY NEXT PREV END
        console.log(index, slideArr);
        currentIndex = index;
        sliderArr = slideArr;
        // page.checkSlide(currentIndex, sliderArr);
  }
  // OPEN POPUP END
  // FUNCTIONS END
  // SERVICE END
});
