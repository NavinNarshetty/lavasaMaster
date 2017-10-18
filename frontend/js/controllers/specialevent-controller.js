myApp.controller('SpecialEventCtrl', function ($scope, TemplateService, $state, NavigationService, $stateParams, toastr, $rootScope, $uibModal, $timeout) {
    $scope.template = TemplateService.getHTML("content/special-events.html");
    TemplateService.title = "Special Events"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();

    // VARIABLE INITITALISE
    $scope.weekDays = ["","Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    // VARIABLE INITITALISE END

    // FUNCTIONS
    // INITIALSE EVENT COLOR CLASS
    $scope.initialiseColor = function(){
      _.each($scope.events, function(n){
        _.each(n.info, function(m){
          m.eventDate.weekDay = $scope.weekDays[m.eventDate.dayOfWeek];
          m.colorClass = "";
          color = m.color.toLowerCase();
          switch (color) {
            case "yellow":
              m.colorClass = "eventcard-yellow";
            break;
            case "blue":
              m.colorClass = "eventcard-blue";
            break;
            case "green":
              m.colorClass = "eventcard-green";
            break;
          }
        });
      });
    }
    // INITIALSE EVENT COLOR CLASS END
    // FUNCTIONS END
    // API CALLS
    // GET ALL EVENT
    $scope.getEventCalender = function(){
      console.log('getAllEventsByMonth');
      NavigationService.getAllEventsByMonth( function(data){
        console.log(data, 'data');
        if (data.data.value == true) {
          $scope.events = data.data.data;
          $scope.initialiseColor();
        } else {
          toastr.error('Try Again');
        }
        console.log($scope.events, 'Event List');
      })
    }
    $scope.getEventCalender();
    // GET ALL EVENT END
    // API CALLS END

    // JSONS
    $scope.events12 = [{
      name: 'December 2017',
      dates: [{
        eventDate: ' 6',
        day: 'Wednesday',
        color: 'yellow',
        colorClass: "eventcard-blue",
        format: 'card2',
        section1: {
          type: 'text',
          text:{
            header: 'welcome to sfa mumbai 2017',
            content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
          }
        }
      },{
        eventDate: ' 6',
        day: 'Wednesday',
        color: 'yellow',
        colorClass: "eventcard-green",
        format: 'card3',
        section1: {
          type: 'image',
          image:{
            header: 'welcome to sfa mumbai 2017',
            name: 'img/sl1.jpg'
          }
        },
        section2: {
          type: 'text',
          text:{
            header: 'welcome to sfa mumbai 2017',
            content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
          }
        }
      },{
        eventDate: ' 6',
        day: 'Wednesday',
        color: 'yellow',
        colorClass: "eventcard-yellow",
        format: 'card4',
        section1: {
          type: 'image',
          image:{
            header: 'welcome to sfa mumbai 2017',
            name: 'img/dishapatani1.jpg'
          }
        },
        section2: {
          type: 'text',
          text:{
            header: 'welcome to sfa mumbai 2017',
            content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
          }
        },
        section3: {
          type: 'image',
          image:{
            header: 'welcome to sfa mumbai 2017',
            name: 'img/dishapatani1.jpg'
          }
        }
      }]
    }];
    // JSONS END

  //
})
