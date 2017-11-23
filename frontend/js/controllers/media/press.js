myApp.controller('MediaPressCtrl', function ($scope, TemplateService, NavigationService, $timeout, configService, $stateParams) {
    //Used to name the .html file

    $scope.template = TemplateService.getHTML("content/media-press.html");
    TemplateService.title = "Media Press"; //This is the Title of the Website
    $scope.navigation = NavigationService.getNavigation();
    $scope.flags = {};
    $scope.flags.openGallery = false;
    $scope.flag = {};
    $scope.classes = {};
    $scope.filter = {};
    $scope.folders = [];
    $scope.flag.openGallerys = false;
    $scope.tabs = 'press-photo';
    $scope.classp = 'active-list';
    $scope.classv = '';

    $scope.tabchanges = function (tabs, a) {
        $scope.tabs = tabs;
        console.log(tabs);
        if (tabs === 'photo') {

            $scope.classes.classp = "active-list";
            $scope.classes.classv = '';
            $scope.classes.classpc = '';

        } else if (tabs == 'video') {

            $scope.classes.classp = '';
            $scope.classes.classv = "active-list";
            $scope.classes.classpc = '';
        } else if (tabs == 'press-photo') {
            $scope.classes.classp = "";
            $scope.classes.classv = '';
            $scope.classes.classpc = 'active-list';
            $scope.classes.classpcp = 'active-list';

        } else if (tabs == 'press-video') {
            $scope.classes.classp = "";
            $scope.classes.classv = '';
            $scope.classes.classpc = 'active-list';
            $scope.classes.classpcv = 'active-list';
        }

    };
    // $scope.getMediaFolders = function () {
    //     $scope.folders = undefined;
    //     NavigationService.getFolders($scope.filter, function (response) {
    //         if (response) {
    //             console.log(response);
    //             $scope.folders = response.data;
    //         } else {
    //             // console.log("No data found");
    //             $scope.folders = [];
    //         }
    //     });
    // };
    $scope.loadMedia = function (year) {
        if (year == '2015' || year == '2016') {
            window.open("https://mumbai.sfanow.in/media-press", '_self');
        }
        $scope.mediaArr = undefined;
        NavigationService.getLimitedMedia($scope.filter, function (response) {
            if (response) {
                console.log("get limited media : ", response);
                $scope.mediaArr = response.data;
                $scope.totalCount = response.data.options.count;
                if ($scope.filter.mediatype == 'press-video') {
                    _.each($scope.mediaArr.results, function (n) {
                        n.thumbnail = "../img/media-video-thumb.jpg";
                    });
                    NavigationService.getVideoThumbnail($scope.mediaArr.results);
                }
            } else {
                console.log("No data found");
                $scope.mediaArr.results = [];
            }
        });
    };
    //console.log($stateParams);
    if (!$stateParams.type && !$stateParams.folder) {
        $scope.filter.mediatype = "press-photo";
        $scope.flags.openGallery = true;
        $scope.filter.year = "2017";
        $scope.filter.folder = "press-coverage";
        $scope.filter.page = 1;
        $scope.loadMedia();
        $scope.tabchanges('press-photo', 1);
    } else {
        if ($stateParams.type && $stateParams.folder) {
            $scope.filter.mediatype = $stateParams.type;
            $scope.filter.folder = $stateParams.folder;
            $scope.filter.year = "2017";
            $scope.filter.page = 1;
            $scope.loadMedia();
            $scope.tabchanges($scope.filter.mediatype, 1);
            $scope.flags.openGallery = true;
        } else if ($stateParams.type) {
            $scope.filter.mediatype = $stateParams.type;
            $scope.flags.openGallery = false;
            $scope.tabchanges($stateParams.type, 1);
            console.log($scope.filter);
            $scope.getMediaFolders();
        }
    }

    //configService
    configService.getDetail(function (data) {
        $scope.state = data.state;
        $scope.year = data.year;
        $scope.eventYear = data.eventYear;
        $scope.sfaCity = data.sfaCity;
        $scope.isCollege = data.isCollege;
        $scope.type = data.type;
    });
});