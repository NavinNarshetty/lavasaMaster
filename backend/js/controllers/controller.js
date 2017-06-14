var globalfunction = {};
myApp.controller('DashboardCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state) {
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("dashboard");
    $scope.menutitle = NavigationService.makeactive("Dashboard");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();
})

//Age Group
myApp.controller('AgeGroupCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, toastr, $uibModal) {
    //registration filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("tableagegroup");
    $scope.menutitle = NavigationService.makeactive("Age Group");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();
    // $scope.formData = {};
    $scope.formData = {};
    $scope.formData.page = 1;
    $scope.formData.type = '';
    $scope.formData.keyword = '';
    // $scope.selectedStatus = 'All';
    $scope.searchInTable = function (data) {
        $scope.formData.page = 1;
        if (data.length >= 2) {
            $scope.formData.keyword = data;
            $scope.viewTable();
        } else if (data.length == '') {
            $scope.formData.keyword = data;
            $scope.viewTable();
        }
    }
    $scope.viewTable = function () {

        $scope.url = "AgeGroup/search";
        // $scope.search = $scope.formData.keyword;
        $scope.formData.page = $scope.formData.page++;
        NavigationService.apiCall($scope.url, $scope.formData, function (data) {
            console.log("data.value", data);
            $scope.items = data.data.results;
            $scope.totalItems = data.data.total;
            $scope.maxRow = data.data.options.count;
        });
    }
    $scope.viewTable();


    $scope.confDel = function (data) {
        $scope.id = data;
        $scope.modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '/views/modal/delete.html',
            backdrop: 'static',
            keyboard: false,
            size: 'sm',
            scope: $scope
        });
    };


    $scope.noDelete = function () {
        $scope.modalInstance.close();
    }

    $scope.delete = function (data) {
        // console.log(data);
        $scope.url = "AgeGroup/delete";
        $scope.constraints = {};
        $scope.constraints._id = data;
        NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
            // console.log("data.value", data);
            // $scope.items = data.data.results;
            if (data.value) {
                toastr.success('Successfully Deleted', 'Age Group Message');
                $scope.modalInstance.close();
                $scope.viewTable();
            } else {
                toastr.error('Something Went Wrong while Deleting', 'Age Group Message');
            }
        });
    }
})

//detail Age Group

myApp.controller('DetailAgeGroupCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, toastr) {
    //registration filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("detailagegroup");
    $scope.menutitle = NavigationService.makeactive("Deatil Age Group");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();
    //edit
    if ($stateParams.id != '') {
        $scope.title = 'Edit';
        $scope.getOneOldSchoolById = function () {
            $scope.url = "AgeGroup/getOne";
            $scope.constraints = {};
            $scope.constraints._id = $stateParams.id;
            NavigationService.getOneOldSchoolById($scope.url, $scope.constraints, function (data) {
                $scope.formData = data.data;
            });
        };
        $scope.getOneOldSchoolById();
        $scope.saveData = function (data) {
            if (data) {
                $scope.url = "AgeGroup/save";
                NavigationService.apiCall($scope.url, data, function (data) {
                    console.log("data.value", data);
                    if (data.data.nModified == '1') {
                        toastr.success("Updated Successfully", "Age Group Message");
                        $state.go('agegroup')
                    }
                });
            } else {
                toastr.error("Invalid Data", "Age Group Message");
            }
        };
    } else {
        $scope.title = 'Create';
        $scope.saveData = function (data) {
            if (data) {
                $scope.url = "AgeGroup/save";
                NavigationService.apiCall($scope.url, data, function (data) {
                    console.log("data.value", data);
                    if (data.value === true) {
                        toastr.success(" Saved Successfully", "Age Group Message");
                        $state.go('agegroup')
                    }
                });
            } else {
                toastr.error("Invalid Data", "Age Group Message");
            }
        };
    }

    //end edit
    //cancel
    $scope.onCancel = function (sendTo) {

        $state.go(sendTo);
    };
    //end cancel
    //create

    //end create
})



//Rules

myApp.controller('RulesCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, toastr, $uibModal) {
    //registration filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("tablerules");
    $scope.menutitle = NavigationService.makeactive("Rules");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();
    $scope.formData = {};
    $scope.formData.page = 1;
    $scope.formData.type = '';
    $scope.formData.keyword = '';
    // $scope.selectedStatus = 'All';
    $scope.searchInTable = function (data) {
        $scope.formData.page = 1;
        if (data.length >= 2) {
            $scope.formData.keyword = data;
            $scope.viewTable();
        } else if (data.length == '') {
            $scope.formData.keyword = data;
            $scope.viewTable();
        }
    }
    $scope.viewTable = function () {
        $scope.url = "Rules/search";
        $scope.formData.page = $scope.formData.page++;
        NavigationService.apiCall($scope.url, $scope.formData, function (data) {
            console.log("data.value", data);
            $scope.items = data.data.results;
            $scope.totalItems = data.data.total;
            $scope.maxRow = data.data.options.count;

        });

    }
    $scope.viewTable();
    $scope.confDel = function (data) {
        $scope.id = data;
        $scope.modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'views/modal/delete.html',
            backdrop: 'static',
            keyboard: false,
            size: 'sm',
            scope: $scope

        });
    };

    $scope.noDelete = function () {
        $scope.modalInstance.close();
    }
    $scope.delete = function (data) {
        console.log(data);
        $scope.url = "Rules/delete";
        $scope.constraints = {};
        $scope.constraints._id = data;
        NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
            console.log("data.value", data);
            if (data.value) {
                toastr.success('Successfully Deleted', 'Rules Meaasge');
                $scope.modalInstance.close();
                $scope.viewTable();
            } else {
                toastr.error('Something went wrong while Deleting', 'Rules Meaasge');
            }

        });
    }

})
//Detail Rules
myApp.controller('DetailRulesCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, toastr) {
    //registration filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("detailrules");
    $scope.menutitle = NavigationService.makeactive("Deatil Rules");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();


    if ($stateParams.id != '') {
        //edit
        $scope.title = 'Edit';
        $scope.getOneOldSchoolById = function () {
            $scope.url = "Rules/getOne";
            $scope.constraints = {};
            $scope.constraints._id = $stateParams.id;
            NavigationService.getOneOldSchoolById($scope.url, $scope.constraints, function (data) {
                $scope.formData = data.data;
            });

        };
        $scope.getOneOldSchoolById();
        $scope.saveData = function (data) {
            if (data) {
                $scope.url = "Rules/save";
                NavigationService.apiCall($scope.url, data, function (data) {
                    console.log("data.value", data);
                    if (data.data.nModified == '1') {
                        toastr.success(" Updated Successfully", "Rules Message");
                        $state.go('rules');

                    }

                });
            } else {
                toastr.error("invalid data", "Rules Message");
            }
        };
        //edit
    } else {
        $scope.title = "Create";
        $scope.saveData = function (data) {
            if (data) {
                $scope.url = "Rules/save";
                NavigationService.apiCall($scope.url, data, function (data) {
                    console.log("data.value", data);
                    if (data.value === true) {
                        toastr.success(" Saved Successfully", "Rules Message");
                        $state.go('rules');

                    }

                });
            } else {
                toastr.error("invalid data", "Rules Message");
            }
        };

    }

    //cancel
    $scope.onCancel = function (sendTo) {

        $state.go(sendTo);
    };
    //end cancel


})
//First Category
myApp.controller('FirstCategoryCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, $uibModal, toastr) {
    //registration filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("tablefirst");
    $scope.menutitle = NavigationService.makeactive("Weight");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();
    $scope.formData = {};
    $scope.formData.page = 1;
    $scope.formData.type = '';
    $scope.formData.keyword = '';
    // $scope.selectedStatus = 'All';
    $scope.searchInTable = function (data) {
        $scope.formData.page = 1;
        if (data.length >= 2) {
            $scope.formData.keyword = data;
            $scope.viewTable();
        } else if (data.length == '') {
            $scope.formData.keyword = data;
            $scope.viewTable();
        }
    }

    $scope.viewTable = function () {
        $scope.url = "Weight/search";
        $scope.formData.page = $scope.formData.page++;
        NavigationService.apiCall($scope.url, $scope.formData, function (data) {
            console.log("data.value", data);
            $scope.items = data.data.results;
            $scope.totalItems = data.data.total;
            $scope.maxRow = data.data.options.count;

        });
    }
    $scope.viewTable();

    $scope.confDel = function (data) {
        $scope.id = data;
        $scope.modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '/views/modal/delete.html',
            backdrop: 'static',
            keyboard: false,
            size: 'sm',
            scope: $scope
        });
    }


    $scope.noDelete = function (data) {
        $scope.modalInstance.close();
    }

    $scope.delete = function (data) {
        // console.log(data);
        $scope.url = "Weight/delete";
        $scope.constraints = {};
        $scope.constraints._id = data;
        NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
            // console.log("data.value", data);
            // $scope.items = data.data.results;
            if (data.value) {
                toastr.success('Successfully Deleted', 'Weight Message');
                $scope.modalInstance.close();
                $scope.viewTable();
            } else {
                toastr.error('Something Went Wrong while Deleting', 'Weight Message');
            }
        });
    }
})

//Detail First Category
myApp.controller('DetailFirstCategoryCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, toastr) {
    //registration filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("detailfirst");
    $scope.menutitle = NavigationService.makeactive("Detail First Category");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();

    if ($stateParams.id != '') {
        //edit
        $scope.title = "Edit";
        $scope.getOneOldSchoolById = function () {
            $scope.url = "Weight/getOne";
            $scope.constraints = {};
            $scope.constraints._id = $stateParams.id;
            NavigationService.getOneOldSchoolById($scope.url, $scope.constraints, function (data) {
                $scope.formData = data.data;
            });
        };
        $scope.getOneOldSchoolById();
        //end edit
        $scope.saveData = function (data) {
            if (data) {

                $scope.url = "Weight/save";
                NavigationService.apiCall($scope.url, data, function (data) {
                    console.log("data.value", data);
                    if (data.data.nModified == '1') {
                        toastr.success(" Updated Successfully", "Weight Message");
                        $state.go('firstcategory');

                    }

                });
            } else {
                toastr.error("Inavalid Data", "Weight Message");
            }
        };

    } else {
        $scope.title = "Create";
        $scope.saveData = function (data) {
            if (data) {

                $scope.url = "Weight/save";
                NavigationService.apiCall($scope.url, data, function (data) {
                    console.log("data.value", data);
                    if (data.value) {
                        toastr.success(" Saved Successfully", "Weight Message");
                        $state.go('firstcategory');

                    }

                });
            } else {
                toastr.error("Inavalid Data", "Weight Message");
            }
        };
    }


    //start cancel
    $scope.onCancel = function (sendTo) {

        $state.go(sendTo);
    };
    //end cancel



})


//Draw format

myApp.controller('DrawFormatCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, $uibModal, toastr) {
    //registration filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("tabledraw");
    $scope.menutitle = NavigationService.makeactive("Draw Format");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();
    $scope.formData = {};
    $scope.formData.page = 1;
    $scope.formData.type = '';
    $scope.formData.keyword = '';
    // $scope.selectedStatus = 'All';
    $scope.searchInTable = function (data) {
        $scope.formData.page = 1;
        if (data.length >= 2) {
            $scope.formData.keyword = data;
            $scope.viewTable();
        } else if (data.length == '') {
            $scope.formData.keyword = data;
            $scope.viewTable();
        }
    }
    $scope.viewTable = function () {
        $scope.url = "DrawFormat/search";
        $scope.formData.page = $scope.formData.page++;
        NavigationService.apiCall($scope.url, $scope.formData, function (data) {
            console.log("data.value", data);
            $scope.items = data.data.results;
            $scope.totalItems = data.data.total;
            $scope.maxRow = data.data.options.count;

        });

    }
    $scope.viewTable();

    $scope.confDel = function (data) {
        $scope.id = data;
        $scope.modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: "/views/modal/delete.html",
            backdrop: 'static',
            keyboard: false,
            size: 'sm',
            scope: $scope
        });

    };

    $scope.noDelete = function () {
        $scope.modalInstance.close();
    }

    $scope.delete = function (data) {
        $scope.url = "DrawFormat/delete";
        $scope.constraints = {};
        $scope.constraints._id = data;
        NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
            console.log(data.value);
            if (data.value) {
                toastr.success('Successfully Deleted', 'DrawFormat Meaasge');
                $scope.modalInstance.close();
                $scope.viewTable();
            } else {
                toastr.error('Something went wrong', 'DrawFormat Message');
            }
        });
    }

})

//Detail Draw
myApp.controller('DetailDrawCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, toastr) {
    //registration filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("detaildraw");
    $scope.menutitle = NavigationService.makeactive("Deatil Draw");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();

    if ($stateParams.id != '') {
        $scope.title = "Edit";
        $scope.getOneOldSchoolById = function () {
            $scope.url = "DrawFormat/getOne";
            $scope.constraints = {};
            $scope.constraints._id = $stateParams.id;
            NavigationService.getOneOldSchoolById($scope.url, $scope.constraints, function (data) {
                $scope.formData = data.data;
            });
        };
        $scope.getOneOldSchoolById();
        $scope.saveData = function (data) {
            $scope.title = "Create";
            if (data) {

                $scope.url = "DrawFormat/save";
                NavigationService.apiCall($scope.url, data, function (data) {
                    console.log("data.value", data);
                    if (data.data.nModified == '1') {
                        toastr.success(" Updated Successfully", "DrawFormat Message");
                        $state.go('drawformat');

                    }

                });
            } else {
                toastr.error("Invalid Data", "DrawFormat Message");
            }
        };


    } else {
        $scope.title = "Create";
        $scope.saveData = function (data) {

            if (data) {

                $scope.url = "DrawFormat/save";
                NavigationService.apiCall($scope.url, data, function (data) {
                    console.log("data.value", data);
                    if (data.value === true) {
                        toastr.success(" Saved Successfully", "DrawFormat Message");
                        $state.go('drawformat');

                    }

                });
            } else {
                toastr.error("Invalid Data", "DrawFormat Message");
            }
        };

    }



    $scope.onCancel = function (sendTo) {
        $state.go(sendTo);
    }


})

//Sports list sub Category
myApp.controller('SportsListSubCategoryCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, $uibModal, toastr) {
    //registration filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("tablesportslistsubcat");
    $scope.menutitle = NavigationService.makeactive("Sub Category");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();
    $scope.formData = {};
    $scope.formData.page = 1;
    $scope.formData.type = '';
    $scope.formData.keyword = '';
    // $scope.selectedStatus = 'All';
    $scope.searchInTable = function (data) {
        $scope.formData.page = 1;
        if (data.length >= 2) {
            $scope.formData.keyword = data;
            $scope.viewTable();
        } else if (data.length == '') {
            $scope.formData.keyword = data;
            $scope.viewTable();
        }
    }
    $scope.viewTable = function () {
        $scope.url = "SportsListSubCategory/search";
        $scope.formData.page = $scope.formData.page++;
        NavigationService.apiCall($scope.url, $scope.formData, function (data) {
            console.log("data.value", data);
            $scope.items = data.data.results;
            $scope.totalItems = data.data.total;
            $scope.maxRow = data.data.options.count;

        });

    }
    $scope.viewTable();

    $scope.confDel = function (data) {
        $scope.id = data;
        $scope.modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '/views/modal/delete.html',
            backdrop: 'static',
            keyboard: false,
            size: 'sm',
            scope: $scope
        });
    };

    $scope.noDelete = function (data) {
        $scope.modalInstance.close();
    }
    $scope.delete = function (data) {
        $scope.url = "SportsLisSubCategoryt/delete";
        $scope.constraints = {};
        $scope.constraints._id = data;
        NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
            if (data.value) {
                toastr.success('Successfully Deleted', 'SportList message');
                $scope.modalInstance.close();
                $scope.viewTable();
            } else {
                toastr.error('Something went wrong while Deleting', 'SportList Message');
            }
        });

    }
})

//Detail Sports list sub Category

myApp.controller('DetailSportsListSubCategoryCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, toastr) {
    //registration filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("detailsportslistsubcat");
    $scope.menutitle = NavigationService.makeactive(" Detail Sub Category");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();

    if ($stateParams.id != '') {
        $scope.title = "Edit";
        $scope.getOneOldSchoolById = function () {
            $scope.url = "SportsListSubCategory/getOne";
            $scope.constraints = {};
            $scope.constraints._id = $stateParams.id;
            NavigationService.getOneOldSchoolById($scope.url, $scope.constraints, function (data) {
                $scope.formData = data.data;
            });
        };
        $scope.getOneOldSchoolById();
        $scope.saveData = function (data) {
            if (data) {

                $scope.url = "SportsListSubCategory/save";
                NavigationService.apiCall($scope.url, data, function (data) {
                    console.log("data.value", data);
                    if (data.data.nModified == '1') {
                        toastr.success(" Updated Successfully", "SportList Message");
                        $state.go('sportslistsubcat');

                    }

                });
            } else {
                toastr.error("Invalid Data", "Error");
            }
        };

    } else {
        $scope.title = "Create";
        $scope.saveData = function (data) {
            if (data) {

                $scope.url = "SportsListSubCategory/save";
                NavigationService.apiCall($scope.url, data, function (data) {
                    console.log("data.value", data);
                    if (data.value === true) {
                        toastr.success(" Saved Successfully", "SportList Message");
                        $state.go('sportslistsubcat');

                    }

                });
            } else {
                toastr.error("Invalid Data", "SportList Message");
            }
        };

    }
    $scope.sporttypeList = [];
    $scope.sporttypeList = [{
        name: 'Team Sports'
    }, {
        name: 'Racquet Sports'
    }, {
        name: 'Combat Sports'
    }]
    $scope.filterList = [];
    $scope.filterList = [{
        name: 'Gender'
    }, {
        name: 'AgeGroup'
    }, {
        name: 'Weight'
    }]
    $scope.rulesList = [];
    $scope.rulesList = [{
        name: 'football'
    }, {
        name: 'hockey'
    }]
    $scope.teamStatus = [];
    $scope.teamStatus = [{
        name: 'True'
    }, {
        name: 'False'
    }]

    $scope.onCancel = function (sendTo) {
        $state.go(sendTo);
    }

})
//sports list Category

myApp.controller('SportsListCategoryCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, $uibModal, toastr) {
    //registration filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("tablesportslistcat");
    $scope.menutitle = NavigationService.makeactive("Category");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();
    $scope.formData = {};
    $scope.formData.page = 1;
    $scope.formData.type = '';
    $scope.formData.keyword = '';
    // $scope.selectedStatus = 'All';
    $scope.searchInTable = function (data) {
        $scope.formData.page = 1;
        if (data.length >= 2) {
            $scope.formData.keyword = data;
            $scope.viewTable();
        } else if (data.length == '') {
            $scope.formData.keyword = data;
            $scope.viewTable();
        }
    }
    $scope.viewTable = function () {
        $scope.url = "SportsListCategory/search";
        $scope.formData.page = $scope.formData.page++;
        NavigationService.apiCall($scope.url, $scope.formData, function (data) {
            console.log("data.value", data);
            $scope.items = data.data.results;
            $scope.totalItems = data.data.total;
            $scope.maxRow = data.data.options.count;


        });

    }
    $scope.viewTable();

    $scope.confDel = function (data) {
        $scope.id = data;
        $scope.modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '/views/modal/delete.html',
            size: 'sm',
            scope: $scope
        });
    };

    $scope.noDelete = function () {
        $scope.modalInstance.close();
    }

    $scope.delete = function (data) {
        // console.log(data);
        $scope.url = "SportsListCategory/delete";
        $scope.constraints = {};
        $scope.constraints._id = data;
        NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
            // console.log("data.value", data);
            // $scope.items = data.data.results;
            if (data.value) {
                toastr.success('Successfully Deleted', 'SportList Message');
                $scope.modalInstance.close();
                $scope.viewTable();
            } else {
                toastr.error('Something Went Wrong while Deleting', 'SportList Message');
            }
        });
    }
})

//Detail Sports list Category
myApp.controller('DetailSportsListCategoryCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, toastr) {
    //registration filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("detailsportslistcat");
    $scope.menutitle = NavigationService.makeactive("Detail Category");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();
    if ($stateParams.id != '') {
        $scope.title = "Edit";
        $scope.getOneOldSchoolById = function () {
            $scope.url = "SportsListCategory/getOne";
            $scope.constraints = {};
            $scope.constraints._id = $stateParams.id;
            NavigationService.getOneOldSchoolById($scope.url, $scope.constraints, function (data) {
                $scope.formData = data.data;
            });
        };
        $scope.getOneOldSchoolById();
        $scope.saveData = function (data) {
            if (data) {

                $scope.url = "SportsListCategory/save";
                NavigationService.apiCall($scope.url, data, function (data) {
                    console.log("data.value", data);
                    if (data.data.nModified == '1') {
                        toastr.success(" Updated Successfully", "SportList Message");
                        $state.go('sportslistcat');

                    }

                });
            } else {
                toastr.error("Invalid Data", "SportList Message");
            }
        };
    } else {
        $scope.title = "Create";
        $scope.saveData = function (data) {
            if (data) {

                $scope.url = "SportsListCategory/save";
                NavigationService.apiCall($scope.url, data, function (data) {
                    console.log("data.value", data);
                    if (data.value === true) {
                        toastr.success(" Saved Successfully", "SportList Message");
                        $state.go('sportslistcat');

                    }

                });
            } else {
                toastr.error("Invalid Data", "SportList Message");
            }
        };

    }




    $scope.onCancel = function (sendTo) {
        $state.go(sendTo);
    }


})
//sports list
myApp.controller('SportsListCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, $uibModal, toastr) {
    //registration filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("tablesportslist");
    $scope.menutitle = NavigationService.makeactive("Sports List");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();
    $scope.formData = {};
    $scope.formData.page = 1;
    $scope.formData.type = '';
    $scope.formData.keyword = '';
    // $scope.selectedStatus = 'All';
    $scope.searchInTable = function (data) {
        $scope.formData.page = 1;
        if (data.length >= 2) {
            $scope.formData.keyword = data;
            $scope.viewTable();
        } else if (data.length == '') {
            $scope.formData.keyword = data;
            $scope.viewTable();
        }
    }
    $scope.viewTable = function () {
        $scope.url = "SportsList/search";
        NavigationService.apiCall($scope.url, $scope.formData, function (data) {
            console.log("data.value", data);
            $scope.items = data.data.results;
            $scope.totalItems = data.data.total;
            $scope.maxRow = data.data.options.count;

        });

    }
    $scope.viewTable();

    $scope.confDel = function (data) {
        $scope.id = data;
        $scope.modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '/views/modal/delete.html',
            keyboard: false,
            backdrop: 'static',
            size: 'sm',
            scope: $scope
        });
    };

    $scope.noDelete = function () {
        $scope.modalInstance.close();
    }

    $scope.delete = function (data) {
        // console.log(data);
        $scope.url = "SportsList/delete";
        $scope.constraints = {};
        $scope.constraints._id = data;
        NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
            // console.log("data.value", data);
            // $scope.items = data.data.results;
            if (data.value) {
                toastr.success('Successfully Deleted', 'SportList Message');
                $scope.modalInstance.close();
                $scope.viewTable();
            } else {
                toastr.error('Something Went Wrong while Deleting', 'SportList Message');
            }
        });
    }
})

//detail sports list

myApp.controller('DetailSportsListCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, toastr) {
    //registration filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("detailsportslist");
    $scope.menutitle = NavigationService.makeactive("Detail Sports List");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();

    if ($stateParams.id != '') {
        $scope.title = "Edit";
        $scope.getOneOldSchoolById = function () {
            $scope.url = "SportsList/getOne";
            $scope.constraints = {};
            $scope.constraints._id = $stateParams.id;
            NavigationService.getOneOldSchoolById($scope.url, $scope.constraints, function (data) {
                $scope.formData = data.data;
            });
        };
        $scope.getOneOldSchoolById();
        $scope.saveData = function (data) {
            if (data) {

                $scope.url = "SportsList/save";
                NavigationService.apiCall($scope.url, data, function (data) {
                    console.log("data.value", data);
                    if (data.data.nModified == '1') {
                        toastr.success(" Updated Successfully", "SportList Message");
                        $state.go('sportslist');

                    }

                });
            } else {
                toastr.error("Invalid Data", "SportList Message");
            }
        };
    } else {
        $scope.title = 'Create';
        $scope.saveData = function (data) {
            if (data) {

                $scope.url = "SportsList/save";
                NavigationService.apiCall($scope.url, data, function (data) {
                    console.log("data.value", data);
                    if (data.value === true) {
                        toastr.success(" Saved Successfully", "SportList Message");
                        $state.go('sportslist');

                    }

                });
            } else {
                toastr.error("Invalid Data", "SportList Message");
            }
        };

    }



    $scope.sporttypeList = [];
    $scope.sporttypeList = [{
        name: 'Team Sports'
    }, {
        name: 'Racquet Sports'
    }, {
        name: 'Combat Sports'
    }]
    $scope.drawList = [];
    $scope.drawList = [{
        name: 'water polo'
    }, {
        name: 'fencing'
    }]
    $scope.onCancel = function (sendTo) {
        $state.go(sendTo);
    }

})

//sports
myApp.controller('SportsCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams) {
    //registration filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("tablesports");
    $scope.menutitle = NavigationService.makeactive("Sports");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();
    $scope.formData = {};
    $scope.formData.page = 1;
    $scope.formData.type = '';
    $scope.formData.keyword = '';
    // $scope.selectedStatus = 'All';
    $scope.searchInTable = function (data) {
        $scope.formData.page = 1;
        if (data.length >= 2) {
            $scope.formData.keyword = data;
            $scope.viewTable();
        } else if (data.length == '') {
            $scope.formData.keyword = data;
            $scope.viewTable();
        }
    }
    $scope.viewTable = function () {
        $scope.url = "Sport/search";
        $scope.formData.page = $scope.formData.page++;
        NavigationService.apiCall($scope.url, $scope.formData, function (data) {
            console.log("data.value", data);
            $scope.items = data.data.results;
            $scope.totalItems = data.data.total;
            $scope.maxRow = data.data.options.count;

        });

    }
    $scope.viewTable();

    $scope.confDel = function (data) {
        $scope.id = data;
        $scope.modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '/views/modal/delete.html',
            size: 'sm',
            scope: $scope
        });
    };

    $scope.noDelete = function () {
        $scope.modalInstance.close();
    }

    $scope.delete = function (data) {
        // console.log(data);
        $scope.url = "Sport/delete";
        $scope.constraints = {};
        $scope.constraints._id = data;
        NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
            // console.log("data.value", data);
            // $scope.items = data.data.results;
            if (data.value) {
                toastr.success('Successfully Deleted', 'Age Group Message');
                $scope.modalInstance.close();
                $scope.viewTable();
            } else {
                toastr.error('Something Went Wrong while Deleting', 'Age Group Message');
            }
        });
    }
})


//Detail sports

myApp.controller('DetailSportsCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, toastr) {
    //registration filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("detailsports");
    $scope.menutitle = NavigationService.makeactive("Detail Sports");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();
    if ($stateParams.id != '') {
        $scope.title = "Edit";
        $scope.getOneOldSchoolById = function () {
            $scope.url = "Sport/getOne";
            $scope.constraints = {};
            $scope.constraints._id = $stateParams.id;
            NavigationService.getOneOldSchoolById($scope.url, $scope.constraints, function (data) {
                $scope.formData = data.data;
            });
        };
        $scope.getOneOldSchoolById();
        $scope.saveData = function (data) {
            if (data) {

                $scope.url = "Sport/save";
                NavigationService.apiCall($scope.url, data, function (data) {
                    console.log("data.value", data);
                    if (data.data.nModified == '1') {
                        toastr.success(" Saved Successfully", "Sport Message");
                        $state.go('sports');

                    }

                });
            } else {
                toastr.error("Invalid Data", "Sport Message");
            }
        };
    } else {
        $scope.title = "Create";
        $scope.saveData = function (data) {
            if (data) {

                $scope.url = "Sport/save";
                NavigationService.apiCall($scope.url, data, function (data) {
                    console.log("data.value", data);
                    if (data.value === true) {
                        toastr.success(" Saved Successfully", "Sport Message");
                        $state.go('sports');

                    }

                });
            } else {
                toastr.error("Invalid Data", "Sport Message");
            }
        };
    }


    $scope.genderList = [];
    $scope.genderList = [{
        name: 'Male'
    }, {
        name: 'Female'
    }]
    $scope.sporttypeList = [];
    $scope.sporttypeList = [{
        name: 'Team Sports'
    }, {
        name: 'Racquet Sports'
    }, {
        name: 'Combat Sports'
    }]
    $scope.ageList = [];
    $scope.ageList = [{
        name: 'u-8'
    }, {
        name: 'u-10'
    }, {
        name: 'u-12'
    }]

    $scope.weightList = [];
    $scope.weightList = [{
        name: '50 kg'
    }, {
        name: '60 kg'
    }, {
        name: '70 kg'
    }]
    $scope.onCancel = function (sendTo) {
        $state.go(sendTo);
    }

})

myApp.controller('SchoolCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams) {
    //registration filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("tableschool");
    $scope.menutitle = NavigationService.makeactive("School");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();

    // if ($stateParams.page && !isNaN(parseInt($stateParams.page))) {
    //     $scope.currentPage = $stateParams.page;
    // } else {
    //     $scope.currentPage = 1;
    // }
    // $scope.formData = {};

    // $scope.search = {
    //     keyword: ""
    // };

    // if ($stateParams.keyword) {
    //     $scope.search.keyword = $stateParams.keyword;
    // }

    $scope.formData = {};
    $scope.formData.page = 1;
    $scope.formData.type = '';
    $scope.formData.keyword = '';
    $scope.changeInput = function () {
        if ($scope.formData.input != '') {
            $scope.formData.input = '';
        } else {
            $scope.formData.input = $scope.formData.input;
        }
    };
    $scope.changeAll = function () {
        $scope.formData = {};
        $scope.formData.page = 1;
        $scope.formData.type = '';
        $scope.formData.keyword = '';
        $scope.filterSchool();
    };
    $scope.searchInSchool = function (data) {
        $scope.formData.page = 1;
        if (data.length >= 2) {
            $scope.formData.keyword = data;
            $scope.filterSchool();
        } else if (data.length == '') {
            $scope.formData.keyword = data;
            $scope.filterSchool();
        }
    }


    $scope.filterSchool = function () {
        $scope.url = "Registration/filterSchool";
        $scope.search = $scope.formData.keyword;
        $scope.formData.page = $scope.formData.page++;


        NavigationService.apiCall($scope.url, $scope.formData, function (data) {
            $scope.items = data.data.results;
            $scope.totalItems = data.data.total;
            $scope.maxRow = data.data.options.count;
        });
    };
    $scope.filterSchool();

    $scope.generateExcel = function () {
        NavigationService.generateSchoolExcel(function (data) {
            window.location.href = adminurl + 'Registration/generateExcel';
        });
    }


})

myApp.controller('AthleteCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state) {
    //athlete filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("tableathlete");
    $scope.menutitle = NavigationService.makeactive("Athlete");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();
    $scope.changeInput = function () {
        if ($scope.formData.input != '') {
            $scope.formData.input = '';
        } else {
            $scope.formData.input = $scope.formData.input;
        }
    };
    $scope.changeAll = function () {
        $scope.formData = {};
        $scope.formData.page = 1;
        $scope.formData.type = '';
        $scope.formData.keyword = '';
        $scope.filterAthlete();
    };
    $scope.formData = {};
    $scope.formData.page = 1;
    $scope.formData.type = '';
    $scope.formData.keyword = '';
    // $scope.selectedStatus = 'All';
    $scope.searchInAthlete = function (data) {
        $scope.formData.page = 1;
        if (data.length >= 2) {
            $scope.formData.keyword = data;
            $scope.filterAthlete();
        } else if (data.length == '') {
            $scope.formData.keyword = data;
            $scope.filterAthlete();
        }
    }
    // $scope.filterDelivery = function (data) {
    //     $scope.oConstraints.pagenumber = 1;
    //     $scope.oConstraints.pagesize = 10;
    //     $scope.oConstraints.deliveryStatus = data;
    //     $scope.selectedStatus = data;
    //     $scope.getMyOrders();
    // }
    $scope.filterAthlete = function () {

        // $stateParams.filter = $scope.formData;

        $scope.url = "Athelete/filterAthlete";
        $scope.search = $scope.formData.keyword;
        $scope.formData.page = $scope.formData.page++;


        NavigationService.apiCall($scope.url, $scope.formData, function (data) {
            $scope.items = data.data.results;
            $scope.totalItems = data.data.total;
            $scope.maxRow = data.data.options.count;
        });

    };
    $scope.filterAthlete();
    //     $scope.generateExcel = function (formdata) {
    //         formdata.page = $scope.formData.page;
    //         console.log(formdata);
    //         NavigationService.generateAthleteExcelWithExcel(formdata, function (data) {
    //                 // console.log('controller', data);
    //                 // // $scope.zipCreate = function (data) {
    //                 console.log('All', data);
    //                 console.log('excel', data.data);
    //                 console.log('info', data.config);
    //                 $scope.zConstraint = {};
    //                 // $scope.zConstraint.userName = data.firstName + '_' + data.lastName;
    //                 // $scope.zConstraint.userStringId = data.userStringId;

    //                 $scope.excelData = data.data;


    //                 console.log($scope.zConstraint);  
    //                 var zip = new JSZip();  
    //                 var files = [];

    //                 files.push($scope.panImage);  
    //                 files.push($scope.importImage);  
    //                 files.push($scope.vatImage);  
    //                 files.push($scope.cstImage);  
    //                 files.push($scope.registerImage);  
    //                 files.push($scope.chequeImage);
    //                 // console.log("inside zip", $scope.zConstraint);
    //                 var img = zip.folder($scope.zConstraint.userName + "-" + $scope.zConstraint.userStringId);  

    //                 async.each(files, function (values, callback) {   

    //                     if (values.Image) {
    //                         var value = values.Image;
    //                         var extension = value.split(".").pop();
    //                         extension = extension.toLowerCase();   
    //                         if (extension == "jpeg") {    
    //                             extension = "jpg";   
    //                         }   
    //                         var i = value.indexOf(".");   
    //                         i--;   
    //                         var name = values.Name;

    //                         getBase64FromImageUrl(adminURL + "upload/readFile?file=" + value, function (imageData) {
    //                             img.file(name + "." + extension, imageData, {
    //                                 createFolders: false,
    //                                 base64: true
    //                             });  
    //                             callback();
    //                         }); 
    //                     } else {
    //                         callback();
    //                     }
    //                 }, function (err, data) {
    //                     zip.generateAsync({    
    //                         type: "blob",
    //                     }).then(function (content) {     // see FileSaver.js
    //                         saveAs(content, $scope.zConstraint.userName + "-" + $scope.zConstraint.userStringId + ".zip");
    //                     });
    //                 }); 
    //             }
    //             // window.location.href = adminurl + 'Athelete/generateExcel';
    //         });
    // }
    $scope.generateExcel = function () {
        NavigationService.generateAthleteExcel(function (data) {
            window.location.href = adminurl + 'Athelete/generateExcel';
        });
    }
})

myApp.controller('OldSchoolCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state) {
    //old school filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("tableoldschool");
    $scope.menutitle = NavigationService.makeactive("Old School");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();
    $scope.formData = {};
    $scope.formData.page = 1;
    var i = 0;
    // $scope.selectedStatus = 'All';
    $scope.searchInOldSchool = function (data) {
        $scope.formData.page = 1;
        if (data.length >= 2) {
            $scope.formData.keyword = data;
            $scope.getAllItems();
        } else if (data.length == '') {
            $scope.formData.keyword = data;
            $scope.getAllItems();
        }
    }
    // $scope.filterDelivery = function (data) {
    //     $scope.oConstraints.pagenumber = 1;
    //     $scope.oConstraints.pagesize = 10;
    //     $scope.oConstraints.deliveryStatus = data;
    //     $scope.selectedStatus = data;
    //     $scope.getMyOrders();
    // }

    $scope.getAllItems = function (keywordChange) {
        $scope.search = $scope.formData.keyword;
        $scope.formData.page = $scope.formData.page++;
        // $scope.totalItems = undefined;
        // if (keywordChange) {
        //     $scope.currentPage = 1;
        // }
        NavigationService.search('School/search', {
                page: $scope.formData.page,
                keyword: $scope.formData.keyword
            }, ++i,
            function (data, ini) {
                if (ini == i) {
                    $scope.items = data.data.results;
                    $scope.totalItems = data.data.total;
                    $scope.maxRow = data.data.options.count;
                }
            });
    };

    // JsonService.refreshView = $scope.getAllItems;
    $scope.getAllItems();
    $scope.generateExcel = function () {
        NavigationService.generateOldSchoolExcel(function (data) {
            window.location.href = adminurl + 'School/generateExcel';
        });
    }
})

myApp.controller('ViewAthleteCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams) {
    //old school filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("viewathlete");
    $scope.menutitle = NavigationService.makeactive("View Athlete");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();
    $scope.getOneAthleteById = function () {
        $scope.url = 'Athelete/getOne';
        $scope.constraints = {};
        $scope.constraints._id = $stateParams.id;
        NavigationService.getOneOldSchoolById($scope.url, $scope.constraints, function (data) {
            $scope.athlete = data.data;
            console.log($scope.athlete);
            if ($scope.athlete.school) {
                $scope.url1 = 'School/getOne';
                $scope.constraints = {};
                $scope.constraints._id = $scope.athlete.school;
                NavigationService.getOneOldSchoolById($scope.url1, $scope.constraints, function (data) {
                    $scope.athlete.school = data.data.name;
                });
            }
        });
    };
    $scope.getOneAthleteById();
})

myApp.controller('ViewSchoolCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams) {
    //old school filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("viewschool");
    $scope.menutitle = NavigationService.makeactive("View School");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();
    $scope.getOneSchoolById = function () {
        $scope.url = 'Registration/getOne';
        $scope.constraints = {};
        $scope.constraints._id = $stateParams.id;
        NavigationService.getOneOldSchoolById($scope.url, $scope.constraints, function (data) {
            $scope.school = data.data;
        });
    };
    $scope.getOneSchoolById();
})


myApp.controller('ViewOldSchoolCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams) {
        //old school filter view
        //Used to name the .html file
        $scope.template = TemplateService.changecontent("viewoldschool");
        $scope.menutitle = NavigationService.makeactive("View Old School");
        TemplateService.title = $scope.menutitle;
        $scope.navigation = NavigationService.getnav();
        $scope.getOneOldSchoolById = function () {
            $scope.url = 'School/getOne';
            $scope.constraints = {};
            $scope.constraints._id = $stateParams.id;
            NavigationService.getOneOldSchoolById($scope.url, $scope.constraints, function (data) {
                $scope.oldschool = data.data;
            });
        };
        $scope.getOneOldSchoolById();
    })


    .controller('AccessController', function ($scope, TemplateService, NavigationService, $timeout, $state) {
        if ($.jStorage.get("accessToken")) {

        } else {
            // $state.go("login");
        }
    })

    .controller('JagzCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $interval) {

        function toColor(num, red) {
            num >>>= 0;
            var b = num & 0xFF,
                g = (num & 0xFF00) >>> 8,
                r = (num & 0xFF0000) >>> 16,
                a = ((num & 0xFF000000) >>> 24) / 255;
            if (red == "red") {
                r = 255;
                b = 0;
                g = 0;
            }
            return "rgba(" + [r, g, b, a].join(",") + ")";
        }

        $scope.circles = _.times(360, function (n) {

            var radius = _.random(0, 10);
            return {
                width: radius,
                height: radius,
                background: toColor(_.random(-12525360, 12525360)),
                top: _.random(0, $(window).height()),
                left: _.random(0, $(window).width())
            };
        });

        function generateCircle() {
            _.each($scope.circles, function (n, index) {
                var radius = _.random(0, 10);
                n.width = radius;
                n.height = radius;
                n.background = toColor(_.random(-12525360, 12525360));
                if (count % 7 === 0 || count % 7 === 5 || count % 7 === 6) {
                    if (count % 7 === 6) {
                        n.background = toColor(_.random(-12525360, 12525360), "red");
                        // n.width = 3;
                        // n.height = 3;
                    }
                    var t = index * Math.PI / 180;
                    var x = (4.0 * Math.pow(Math.sin(t), 3));
                    var y = ((3.0 * Math.cos(t)) - (1.3 * Math.cos(2 * t)) - (0.6 * Math.cos(3 * t)) - (0.2 * Math.cos(4 * t)));
                    n.top = -50 * y + 300;
                    n.left = 50 * x + $(window).width() / 2;
                } else {
                    n.top = _.random(0, $(window).height());
                    n.left = _.random(0, $(window).width());
                }
            });
        }

        var count = 0;

        $interval(function () {
            count++;
            console.log("Version 1.1");
            generateCircle();
        }, 5000);

    })

    .controller('MultipleSelectCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, $filter, toastr) {
        var i = 0;
        $scope.getValues = function (filter, insertFirst) {
            var dataSend = {
                keyword: $scope.search.modelData,
                filter: filter,
                page: 1
            };
            if (dataSend.keyword === null || dataSend.keyword === undefined) {
                dataSend.keyword = "";
            }
            NavigationService[$scope.api]($scope.url, dataSend, ++i, function (data) {
                if (data.value) {
                    $scope.list = data.data.results;
                    if ($scope.search.modelData) {
                        $scope.showCreate = true;
                        _.each($scope.list, function (n) {
                            // if (n.name) {
                            if (_.lowerCase(n.name) == _.lowerCase($scope.search.modelData)) {
                                $scope.showCreate = false;
                                return 0;
                            }
                            // }else{
                            //     if (_.lowerCase(n.officeCode) == _.lowerCase($scope.search.modelData)) {
                            //       $scope.showCreate = false;
                            //       return 0;
                            //   }
                            // }

                        });
                    } else {
                        $scope.showCreate = false;

                    }
                    if (insertFirst) {
                        if ($scope.list[0] && $scope.list[0]._id) {
                            // if ($scope.list[0].name) {
                            $scope.sendData($scope.list[0]._id, $scope.list[0].name);
                            // }else{
                            //   $scope.sendData($scope.list[0]._id, $scope.list[0].officeCode);
                            // }
                        } else {
                            console.log("Making this happen");
                            // $scope.sendData(null, null);
                        }
                    }
                } else {
                    console.log("Making this happen2");
                    $scope.sendData(null, null);
                }


            });
        };

        $scope.$watch('model', function (newVal, oldVal) {
            if (newVal && oldVal === undefined) {
                $scope.getValues({
                    _id: $scope.model
                }, true);
            }
        });


        $scope.$watch('filter', function (newVal, oldVal) {
            var filter = {};
            if ($scope.filter) {
                filter = JSON.parse($scope.filter);
            }
            var dataSend = {
                keyword: $scope.search.modelData,
                filter: filter,
                page: 1
            };

            NavigationService[$scope.api]($scope.url, dataSend, ++i, function (data) {
                if (data.value) {
                    $scope.list = data.data.results;
                    $scope.showCreate = false;

                }
            });
        });


        $scope.search = {
            modelData: ""
        };
        if ($scope.model) {
            $scope.getValues({
                _id: $scope.model
            }, true);
        } else {
            $scope.getValues();
        }





        $scope.listview = false;
        $scope.showCreate = false;
        $scope.typeselect = "";
        $scope.showList = function () {
            $scope.listview = true;
            $scope.searchNew(true);
        };
        $scope.closeList = function () {
            $scope.listview = false;
        };
        $scope.closeListSlow = function () {
            $timeout(function () {
                $scope.closeList();
            }, 500);
        };
        $scope.searchNew = function (dontFlush) {
            if (!dontFlush) {
                $scope.model = "";
            }
            var filter = {};
            if ($scope.filter) {
                filter = JSON.parse($scope.filter);
            }
            $scope.getValues(filter);
        };
        $scope.createNew = function (create) {
            var newCreate = $filter("capitalize")(create);
            var data = {
                name: newCreate
            };
            if ($scope.filter) {
                data = _.assign(data, JSON.parse($scope.filter));
            }
            console.log(data);
            NavigationService[$scope.create](data, function (data) {
                if (data.value) {
                    toastr.success($scope.name + " Created Successfully", "Creation Success");
                    $scope.model = data.data._id;
                    $scope.ngName = data.data.name;
                } else {
                    toastr.error("Error while creating " + $scope.name, "Error");
                }
            });
            $scope.listview = false;
        };
        $scope.sendData = function (val, name) {
            $scope.search.modelData = name;
            $scope.ngName = name;
            $scope.model = val;
            $scope.listview = false;
        };
    })

    .controller('PageJsonCtrl', function ($scope, TemplateService, NavigationService, JsonService, $timeout, $state, $stateParams, $uibModal) {
        $scope.json = JsonService;
        $scope.template = TemplateService.changecontent("none");
        $scope.menutitle = NavigationService.makeactive("Country List");
        TemplateService.title = $scope.menutitle;
        $scope.navigation = NavigationService.getnav();


        JsonService.getJson($stateParams.id, function () {});

        globalfunction.confDel = function (callback) {
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: '/views/modal/conf-delete.html',
                size: 'sm',
                scope: $scope
            });
            $scope.close = function (value) {
                callback(value);
                modalInstance.close("cancel");
            };
        };

        globalfunction.openModal = function (callback) {
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: '/backend/views/modal/modal.html',
                size: 'lg',
                scope: $scope
            });
            $scope.close = function (value) {
                callback(value);
                modalInstance.close("cancel");
            };
        };

        // globalfunction.confDel(function (value) {
        //     console.log(value);
        //     if (value) {
        //         NavigationService.apiCall(id, function (data) {
        //             if (data.value) {
        //                 $scope.showAllCountries();
        //                 toastr.success("Country deleted successfully.", "Country deleted");
        //             } else {
        //                 toastr.error("There was an error while deleting country", "Country deleting error");
        //             }
        //         });
        //     }
        // });

    })

    .controller('ViewCtrl', function ($scope, TemplateService, NavigationService, JsonService, $timeout, $state, $stateParams) {
        $scope.json = JsonService;
        $scope.template = TemplateService;
        var i = 0;
        console.log($stateParams);
        if ($stateParams.page && !isNaN(parseInt($stateParams.page))) {
            $scope.currentPage = $stateParams.page;
        } else {
            $scope.currentPage = 1;
        }
        $scope.formData = {};

        $scope.search = {
            keyword: ""
        };

        if ($stateParams.keyword) {
            $scope.search.keyword = $stateParams.keyword;
        }
        // if ($stateParams.filter) {
        //     $scope.formData = JSON.parse($stateParams.filter);
        //     // $scope.formData = $stateParams.filter;
        // }
        $scope.changePage = function (page) {
            var goTo = "page";
            if ($scope.search.keyword) {
                goTo = "page";
            }
            console.log(page);
            $state.go(goTo, {
                id: $stateParams.id,
                page: page,
                keyword: $scope.search.keyword,
                // filter: JSON.stringify($scope.formData)
            });

        };

        // $scope.getFilterType = function (data) {
        //     $scope.type = data;
        //     if ($scope.type == "Date") {
        //         $scope.show = 1;
        //     } else {
        //         $scope.show = 2;
        //     }

        // };
        $scope.formData.type = "";
        $scope.search.keyword = "";
        $scope.search = "";
        console.log($stateParams.keyword);
        console.log($scope.search);
        console.log($scope.search.keyword);


        $scope.searchInOldSchool = function (data) {
            $scope.formData.page = 1;
            if (data.length >= 2) {
                $scope.formData.keyword = data;
                $scope.getAllItems();
            } else if (data.length == '') {
                $scope.formData.keyword = data;
                $scope.getAllItems();
            }
        }

        $scope.getAllItems = function (keywordChange) {
            $scope.search = $scope.formData.keyword;
            $scope.formData.page = $scope.formData.page++;
            // $scope.totalItems = undefined;
            // if (keywordChange) {
            //     $scope.currentPage = 1;
            // }
            NavigationService.search('School/search', {
                    page: $scope.formData.page,
                    keyword: $scope.formData.keyword
                }, ++i,
                function (data, ini) {
                    if (ini == i) {
                        $scope.items = data.data.results;
                        $scope.totalItems = data.data.total;
                        $scope.maxRow = data.data.options.count;
                    }
                });
        };



        $scope.searchInSchool = function (data) {
            $scope.formData.page = 1;
            if (data.length >= 2) {
                $scope.formData.keyword = data;
                $scope.filterSchool();
            } else if (data.length == '') {
                $scope.formData.keyword = data;
                $scope.filterSchool();
            }
        }


        $scope.filterSchool = function () {
            $scope.url = "Registration/filterSchool";
            $scope.search = $scope.formData.keyword;
            $scope.formData.page = $scope.formData.page++;


            NavigationService.apiCall($scope.url, $scope.formData, function (data) {
                $scope.items = data.data.results;
                $scope.totalItems = data.data.total;
                $scope.maxRow = data.data.options.count;
            });
        };

        // $scope.filterAthlete = function () {

        //     // $stateParams.filter = $scope.formData;

        //     $scope.url = "Athelete/filterAthlete";

        //     NavigationService.apiCall($scope.url, $stateParams, function (data) {
        //         $scope.items = data.data.results;
        //         $scope.totalItems = data.data.total;
        //         $scope.maxRow = data.data.options.count;
        //     });

        // };

        // $scope.getAllItems = function (keywordChange) {
        //     $scope.totalItems = undefined;
        //     if (keywordChange) {
        //         $scope.currentPage = 1;
        //     }
        //     NavigationService.search($scope.json.json.apiCall.url, {
        //             page: $scope.currentPage,
        //             keyword: $scope.search.keyword
        //         }, ++i,
        //         function (data, ini) {
        //             if (ini == i) {
        //                 $scope.items = data.data.results;
        //                 $scope.totalItems = data.data.total;
        //                 $scope.maxRow = data.data.options.count;
        //             }
        //         });
        // };

        $scope.searchInAthlete = function (data) {
            $scope.formData.page = 1;
            if (data.length >= 2) {
                $scope.formData.keyword = data;
                $scope.filterAthlete();
            } else if (data.length == '') {
                $scope.formData.keyword = data;
                $scope.filterAthlete();
            }
        }
        // $scope.filterDelivery = function (data) {
        //     $scope.oConstraints.pagenumber = 1;
        //     $scope.oConstraints.pagesize = 10;
        //     $scope.oConstraints.deliveryStatus = data;
        //     $scope.selectedStatus = data;
        //     $scope.getMyOrders();
        // }
        $scope.filterAthlete = function () {

            // $stateParams.filter = $scope.formData;

            $scope.url = "Athelete/filterAthlete";
            $scope.search = $scope.formData.keyword;
            $scope.formData.page = $scope.formData.page++;


            NavigationService.apiCall($scope.url, $scope.formData, function (data) {
                $scope.items = data.data.results;
                $scope.totalItems = data.data.total;
                $scope.maxRow = data.data.options.count;
            });

        };




        JsonService.refreshView = $scope.getAllItems;
        $scope.getAllItems();
        // if ($stateParams.id == "viewRegistration") {
        //     $scope.filterSchool();
        // } else if ($stateParams.id == "viewAthelete") {
        //     $scope.filterAthlete();
        // } else {
        //     $scope.getAllItems();
        // }


    })


    .controller('DetailCtrl', function ($scope, TemplateService, NavigationService, JsonService, $timeout, $state, $stateParams, toastr) {
        $scope.json = JsonService;
        JsonService.setKeyword($stateParams.keyword);
        $scope.template = TemplateService;
        $scope.data = {};
        console.log("detail controller");
        console.log($scope.json);

        //  START FOR EDIT
        if ($scope.json.json.preApi) {
            var obj = {};
            obj[$scope.json.json.preApi.params] = $scope.json.keyword._id;
            NavigationService.apiCall($scope.json.json.preApi.url, obj, function (data) {
                $scope.data = data.data;
                $scope.generateField = true;

            });
        } else {
            $scope.generateField = true;
        }
        //  END FOR EDIT

        $scope.onCancel = function (sendTo) {
            $scope.json.json.action[1].stateName.json.keyword = "";
            $scope.json.json.action[1].stateName.json.page = "";
            $state.go($scope.json.json.action[1].stateName.page, $scope.json.json.action[1].stateName.json);
        };

        $scope.saveData = function (formData) {
            NavigationService.apiCall($scope.json.json.apiCall.url, formData, function (data) {
                if (data.value === true) {
                    $scope.json.json.action[0].stateName.json.keyword = "";
                    $scope.json.json.action[0].stateName.json.page = "";
                    $state.go($scope.json.json.action[0].stateName.page, $scope.json.json.action[0].stateName.json);
                    var messText = "created";
                    if ($scope.json.keyword._id) {
                        messText = "edited";
                    }
                    toastr.success($scope.json.json.name + " " + formData.name + " " + messText + " successfully.");
                } else {
                    var messText = "creating";
                    if ($scope.json.keyword._id) {
                        messText = "editing";
                    }
                    toastr.error("Failed " + messText + " " + $scope.json.json.name);
                }
            });
        };
    })

    .controller('DetailFieldCtrl', function ($scope, TemplateService, NavigationService, JsonService, $timeout, $state, $stateParams, $uibModal, toastr) {
        if (!$scope.type.type) {
            $scope.type.type = "text";
        }
        $scope.json = JsonService;
        $scope.tags = {};
        $scope.model = [];
        $scope.tagNgModel = {};
        // $scope.boxModel
        if ($scope.type.validation) {
            var isRequired = _.findIndex($scope.type.validation, function (n) {
                return n == "required";
            });
            if (isRequired >= 0) {
                $scope.type.required = true;
            }
        }
        $scope.form = {};
        if ($scope.value && $scope.value[$scope.type.tableRef]) {
            $scope.form.model = $scope.value[$scope.type.tableRef];
        }

        $scope.template = "views/field/" + $scope.type.type + ".html";

        // BOX
        if ($scope.type.type == "date") {
            $scope.formData[$scope.type.tableRef] = moment($scope.formData[$scope.type.tableRef]).toDate();
            console.log("$scope.formData[$scope.type.tableRef]", $scope.formData[$scope.type.tableRef]);
        }
        if ($scope.type.type == "password") {
            $scope.formData[$scope.type.tableRef] = "";
        }
        if ($scope.type.type == "youtube") {
            $scope.youtube = {};

            function getJsonFromUrl(string) {
                var obj = _.split(string, '?');
                var returnval = {};
                if (obj.length >= 2) {
                    obj = _.split(obj[1], '&');
                    _.each(obj, function (n) {
                        var newn = _.split(n, "=");
                        returnval[newn[0]] = newn[1];
                        return;
                    });
                    return returnval;
                }

            }
            $scope.changeYoutubeUrl = function (string) {
                if (string) {
                    $scope.formData[$scope.type.tableRef] = "";
                    var result = getJsonFromUrl(string);
                    console.log(result);
                    if (result && result.v) {
                        $scope.formData[$scope.type.tableRef] = result.v;
                    }
                }

            };
        }
        // if ($scope.type.type == "box") {

        //     if (!_.isArray($scope.formData[$scope.type.tableRef]) && $scope.formData[$scope.type.tableRef] === '') {
        //         $scope.formData[$scope.type.tableRef] = [];
        //         $scope.model = [];
        //     } else {
        //         if ($scope.formData[$scope.type.tableRef]) {
        //             $scope.model = $scope.formData[$scope.type.tableRef];
        //         }
        //     }
        //     $scope.search = {
        //         text: ""
        //     };
        // }
        // $scope.state = "";
        // $scope.createBox = function (state) {
        //     $scope.state = state;
        //     $scope.model.push({});
        //     $scope.editBox("Create", $scope.model[$scope.model.length - 1]);
        // };
        // $scope.editBox = function (state, data) {
        //     $scope.state = state;
        //     $scope.data = data;
        //     var modalInstance = $uibModal.open({
        //         animation: $scope.animationsEnabled,
        //         templateUrl: '/backend/views/modal/modal.html',
        //         size: 'lg',
        //         scope: $scope
        //     });
        //     $scope.close = function (value) {
        //         callback(value);
        //         modalInstance.close("cancel");
        //     };
        // };
        // $scope.deleteBox = function (index, data) {
        //     console.log(data);
        //     data.splice(index, 1);
        // };

        if ($scope.type.type == "box") {
            console.log("In Box", $scope.formData);

            if (!_.isArray($scope.formData[$scope.type.tableRef]) && $scope.formData[$scope.type.tableRef] === '') {
                $scope.formData[$scope.type.tableRef] = [];
                $scope.model = [];
            } else {
                if ($scope.formData[$scope.type.tableRef]) {
                    if ($scope.type.tableValue) {
                        console.log($scope.formData[$scope.type.tableRef][$scope.type.tableValue]);
                        $scope.model = $scope.formData[$scope.type.tableRef][$scope.type.tableValue];
                    } else {
                        $scope.model = $scope.formData[$scope.type.tableRef];
                        console.log($scope.model);
                    }
                }
            }
            $scope.search = {
                text: ""
            };
        }
        $scope.state = "";
        $scope.createBox = function (state) {
            $scope.state = state;
            $scope.model.push({});
            $scope.editBox("Create", $scope.model[$scope.model.length - 1]);
        };
        $scope.editBox = function (state, data) {
            console.log("insise edit", state, data);
            $scope.state = state;
            $scope.data = data;
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'views/modal/modal.html',
                size: 'lg',
                scope: $scope
            });
            $scope.close = function (value) {
                callback(value);
                modalInstance.close("cancel");
            };
        };
        $scope.deleteBox = function (index, data) {
            console.log(data);
            data.splice(index, 1);
        };


        //  TAGS STATIC AND FROM TABLE
        $scope.refreshTags = function (search) {
            if ($scope.type.url !== "") {
                NavigationService.searchCall($scope.type.url, {
                    keyword: search
                }, 1, function (data1) {
                    $scope.tags[$scope.type.tableRef] = data1.data.results;
                });
            } else {
                $scope.tags[$scope.type.tableRef] = $scope.type.dropDown;
            }
        };
        if ($scope.type.type == "tags") {
            $scope.refreshTags();
        }

        $scope.tagClicked = function (select, index) {
            if ($scope.type.fieldType === "array") {
                $scope.formData[$scope.type.tableRef] = [];
                _.each(select, function (n) {
                    $scope.formData[$scope.type.tableRef].push(n._id);
                });
            } else {
                $scope.formData[$scope.type.tableRef] = select;
            }
        };
    })

    .controller('LoginCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
        //Used to name the .html file
        $scope.menutitle = NavigationService.makeactive("Login");
        TemplateService.title = $scope.menutitle;
        $scope.currentHost = window.location.origin;
        if ($stateParams.id) {
            if ($stateParams.id === "AccessNotAvailable") {
                toastr.error("You do not have access for the Backend.");
            } else {
                NavigationService.parseAccessToken($stateParams.id, function () {
                    NavigationService.profile(function () {
                        $state.go("dashboard");
                    }, function () {
                        $state.go("login");
                    });
                });
            }
        } else {
            NavigationService.removeAccessToken();
        }

    })

    .controller('CountryCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, toastr) {
        //Used to name the .html file
        $scope.template = TemplateService.changecontent("country-list");
        $scope.menutitle = NavigationService.makeactive("Country List");
        TemplateService.title = $scope.menutitle;
        $scope.navigation = NavigationService.getnav();
        $scope.currentPage = $stateParams.page;
        var i = 0;
        $scope.search = {
            keyword: ""
        };
        if ($stateParams.keyword) {
            $scope.search.keyword = $stateParams.keyword;
        }
        $scope.showAllCountries = function (keywordChange) {
            $scope.totalItems = undefined;
            if (keywordChange) {
                $scope.currentPage = 1;
            }
            NavigationService.searchCountry({
                page: $scope.currentPage,
                keyword: $scope.search.keyword
            }, ++i, function (data, ini) {
                if (ini == i) {
                    $scope.countries = data.data.results;
                    $scope.totalItems = data.data.total;
                    $scope.maxRow = data.data.options.count;
                }
            });
        };

        $scope.changePage = function (page) {
            var goTo = "country-list";
            if ($scope.search.keyword) {
                goTo = "country-list";
            }
            $state.go(goTo, {
                page: page,
                keyword: $scope.search.keyword
            });
        };
        $scope.showAllCountries();
        $scope.deleteCountry = function (id) {
            globalfunction.confDel(function (value) {
                console.log(value);
                if (value) {
                    NavigationService.deleteCountry(id, function (data) {
                        if (data.value) {
                            $scope.showAllCountries();
                            toastr.success("Country deleted successfully.", "Country deleted");
                        } else {
                            toastr.error("There was an error while deleting country", "Country deleting error");
                        }
                    });
                }
            });
        };
    })

    .controller('CreateCountryCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, toastr) {
        //Used to name the .html file

        $scope.template = TemplateService.changecontent("country-detail");
        $scope.menutitle = NavigationService.makeactive("Country");
        TemplateService.title = $scope.menutitle;
        $scope.navigation = NavigationService.getnav();

        $scope.header = {
            "name": "Create Country"
        };
        $scope.formData = {};
        $scope.saveCountry = function (formData) {
            console.log($scope.formData);
            NavigationService.countrySave($scope.formData, function (data) {
                if (data.value === true) {
                    $state.go('country-list');
                    toastr.success("Country " + formData.name + " created successfully.", "Country Created");
                } else {
                    toastr.error("Country creation failed.", "Country creation error");
                }
            });
        };

    })

    .controller('CreateAssignmentCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, toastr, $stateParams, $uibModal) {
        //Used to name the .html file

        $scope.template = TemplateService.changecontent("assignment-detail");
        $scope.menutitle = NavigationService.makeactive("Assignment");
        TemplateService.title = $scope.menutitle;
        $scope.navigation = NavigationService.getnav();

        $scope.header = {
            "name": "Create Assignment"
        };
        $scope.formData = {};
        $scope.formData.status = true;
        $scope.formData.invoice = [];
        $scope.formData.products = [];
        $scope.formData.LRs = [];
        $scope.formData.vehicleNumber = [];
        $scope.formData.others = [];
        $scope.formData.shareWith = [];
        $scope.modalData = {};
        $scope.modalIndex = "";
        $scope.wholeObj = [];
        $scope.addModels = function (dataArray, data) {
            dataArray.push(data);
        };

        // NavigationService.searchNatureLoss(function(data) {
        //     $scope.natureLoss = data.data.results;
        // });

        $scope.refreshShareWith = function (data, office) {
            var formdata = {};
            formdata.search = data;
            formdata.filter = {
                "postedAt": office
            };
            NavigationService.searchEmployee(formdata, 1, function (data) {
                $scope.shareWith = data.data.results;
            });
        };
        $scope.refreshNature = function (data, causeloss) {
            var formdata = {};
            formdata.search = data;
            formdata.filter = {
                "_id": causeloss
            };
            NavigationService.getNatureLoss(formdata, 1, function (data) {
                $scope.natureLoss = data.data.results;
            });
        };

        $scope.addModal = function (filename, index, holdobj, data, current, wholeObj) {
            if (index !== "") {
                $scope.modalData = data;
                $scope.modalIndex = index;
            } else {
                $scope.modalData = {};
                $scope.modalIndex = "";
            }
            $scope.wholeObj = wholeObj;
            $scope.current = current;
            $scope.holdObject = holdobj;
            var modalInstance = $uibModal.open({
                scope: $scope,
                templateUrl: 'views/modal/' + filename + '.html',
                size: 'lg'
            });
        };

        $scope.addElements = function (moddata) {
            if ($scope.modalIndex !== "") {
                $scope.wholeObj[$scope.modalIndex] = moddata;
            } else {
                $scope.newjson = moddata;
                var a = moddata;
                switch ($scope.holdObject) {
                    case "invoice":
                        {
                            var newmod = a.invoiceNumber.split(',');
                            _.each(newmod, function (n) {
                                $scope.newjson.invoiceNumber = n;
                                $scope.wholeObj.push($scope.newjson);
                            });
                        }
                        break;
                    case "products":
                        {
                            var newmod1 = a.item.split(',');
                            _.each(newmod1, function (n) {
                                $scope.newjson.item = n;
                                $scope.wholeObj.push($scope.newjson);
                            });
                        }
                        break;
                    case "LRs":
                        var newmod2 = a.lrNumber.split(',');
                        _.each(newmod2, function (n) {
                            $scope.newjson.lrNumber = n;
                            $scope.wholeObj.push($scope.newjson);
                        });
                        break;
                    case "Vehicle":
                        var newmod3 = a.vehicleNumber.split(',');
                        _.each(newmod3, function (n) {
                            $scope.newjson.vehicleNumber = n;
                            $scope.wholeObj.push($scope.newjson);
                        });
                        break;

                    default:
                        {
                            $scope.wholeObj.push($scope.newjson);
                        }

                }

            }
        };

        $scope.deleteElements = function (index, data) {
            data.splice(index, 1);
        };


        $scope.submit = function (formData) {
            console.log($scope.formData);
            NavigationService.assignmentSave($scope.formData, function (data) {
                if (data.value === true) {
                    $state.go('assignment-list');
                    toastr.success("Assignment " + formData.name + " created successfully.", "Assignment Created");
                } else {
                    toastr.error("Assignment creation failed.", "Assignment creation error");
                }
            });
        };

    })

    .controller('EditAssignmentCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, toastr, $stateParams, $uibModal) {
        //Used to name the .html file

        $scope.template = TemplateService.changecontent("assignment-detail");
        $scope.menutitle = NavigationService.makeactive("Assignment");
        TemplateService.title = $scope.menutitle;
        $scope.navigation = NavigationService.getnav();

        $scope.header = {
            "name": "Edit Assignment"
        };
        $scope.formData = {};
        $scope.formData.status = true;
        $scope.formData.invoice = [];
        $scope.formData.products = [];
        $scope.formData.LRs = [];
        $scope.formData.vehicleNumber = [];
        $scope.formData.others = [];
        $scope.formData.shareWith = [];
        $scope.modalData = {};
        $scope.modalIndex = "";
        $scope.wholeObj = [];
        $scope.addModels = function (dataArray, data) {
            dataArray.push(data);
        };

        NavigationService.getOneModel("Assignment", $stateParams.id, function (data) {
            $scope.formData = data.data;
            $scope.formData.dateOfIntimation = new Date(data.data.dateOfIntimation);
            $scope.formData.dateOfAppointment = new Date(data.data.dateOfAppointment);
            $scope.formData.country = data.data.city.district.state.zone.country._id;
            $scope.formData.zone = data.data.city.district.state.zone._id;
            $scope.formData.state = data.data.city.district.state._id;
            $scope.formData.district = data.data.city.district._id;
            $scope.formData.city = data.data.city._id;
            $scope.formData.insuredOfficer = data.data.insuredOfficer._id;
            console.log($scope.formData.policyDoc);
            console.log($scope.formData);
        });


        $scope.refreshShareWith = function (data, office) {
            var formdata = {};
            formdata.search = data;
            formdata.filter = {
                "postedAt": office
            };
            NavigationService.searchEmployee(formdata, 1, function (data) {
                $scope.shareWith = data.data.results;
            });
        };
        $scope.refreshNature = function (data, causeloss) {
            var formdata = {};
            formdata.search = data;
            formdata.filter = {
                "_id": causeloss
            };
            NavigationService.getNatureLoss(formdata, 1, function (data) {
                $scope.natureLoss = data.data.results;
            });
        };

        $scope.addModal = function (filename, index, holdobj, data, current, wholeObj) {
            if (index !== "") {
                $scope.modalData = data;
                $scope.modalIndex = index;
            } else {
                $scope.modalData = {};
                $scope.modalIndex = "";
            }
            $scope.wholeObj = wholeObj;
            $scope.current = current;
            $scope.holdObject = holdobj;
            var modalInstance = $uibModal.open({
                scope: $scope,
                templateUrl: 'views/modal/' + filename + '.html',
                size: 'lg'
            });
        };

        $scope.addElements = function (moddata) {
            if ($scope.modalIndex !== "") {
                $scope.wholeObj[$scope.modalIndex] = moddata;
            } else {
                $scope.newjson = moddata;
                var a = moddata;
                switch ($scope.holdObject) {
                    case "invoice":
                        {
                            var newmod = a.invoiceNumber.split(',');
                            _.each(newmod, function (n) {
                                $scope.newjson.invoiceNumber = n;
                                $scope.wholeObj.push($scope.newjson);
                            });
                        }
                        break;
                    case "products":
                        {
                            var newmod1 = a.item.split(',');
                            _.each(newmod1, function (n) {
                                $scope.newjson.item = n;
                                $scope.wholeObj.push($scope.newjson);
                            });
                        }
                        break;
                    case "LRs":
                        var newmod2 = a.lrNumber.split(',');
                        _.each(newmod2, function (n) {
                            $scope.newjson.lrNumber = n;
                            $scope.wholeObj.push($scope.newjson);
                        });
                        break;
                    case "Vehicle":
                        var newmod3 = a.vehicleNumber.split(',');
                        _.each(newmod3, function (n) {
                            $scope.newjson.vehicleNumber = n;
                            $scope.wholeObj.push($scope.newjson);
                        });
                        break;

                    default:
                        {
                            $scope.wholeObj.push($scope.newjson);
                        }

                }

            }
        };

        $scope.deleteElements = function (index, data) {
            data.splice(index, 1);
        };


        $scope.submit = function (formData) {
            console.log($scope.formData);
            NavigationService.assignmentSave($scope.formData, function (data) {
                if (data.value === true) {
                    $state.go('assignment-list');
                    toastr.success("Assignment " + formData.name + " created successfully.", "Assignment Created");
                } else {
                    toastr.error("Assignment creation failed.", "Assignment creation error");
                }
            });
        };

    })

    .controller('EditCountryCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
        //Used to name the .html file

        $scope.template = TemplateService.changecontent("country-detail");
        $scope.menutitle = NavigationService.makeactive("Country");
        TemplateService.title = $scope.menutitle;
        $scope.navigation = NavigationService.getnav();

        $scope.header = {
            "name": "Edit Country"
        };

        NavigationService.getOneCountry($stateParams.id, function (data) {
            $scope.formData = data.data;
            console.log('$scope.oneCountry', $scope.oneCountry);

        });

        $scope.saveCountry = function (formValid) {
            NavigationService.countryEditSave($scope.formData, function (data) {
                if (data.value === true) {
                    $state.go('country-list');
                    console.log("Check this one");
                    toastr.success("Country " + $scope.formData.name + " edited successfully.", "Country Edited");
                } else {
                    toastr.error("Country edition failed.", "Country editing error");
                }
            });
        };

    })

    .controller('SchemaCreatorCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
        //Used to name the .html file
        $scope.template = TemplateService.changecontent("schema-creator");
        $scope.menutitle = NavigationService.makeactive("Schema Creator");
        TemplateService.title = $scope.menutitle;
        $scope.navigation = NavigationService.getnav();
        $scope.collectionTypes = ["Table View", "Table View Drag and Drop", "Grid View", "Grid View Drag and Drop"];
        $scope.schema = [{
            "schemaType": "Boolean",
            "Input1": "",
            "Input2": ""
        }, {
            "schemaType": "Color",
            "Input1": "",
            "Input2": ""
        }, {
            "schemaType": "Date",
            "Input1": "",
            "Input2": ""
        }, {
            "schemaType": "Email",
            "Input1": "",
            "Input2": ""
        }, {
            "schemaType": "File",
            "Input1": "MB Limit",
            "Input2": ""
        }, {
            "schemaType": "Image",
            "Input1": "pixel x",
            "Input2": "pixel y "
        }, {
            "schemaType": "Location",
            "Input1": "",
            "Input2": ""
        }, {
            "schemaType": "Mobile",
            "Input1": "",
            "Input2": ""
        }, {
            "schemaType": "Multiple Select",
            "Input1": "Enum",
            "Input2": ""
        }, {
            "schemaType": "Multiple Select From Table",
            "Input1": "Collection",
            "Input2": "Field"
        }, {
            "schemaType": "Number",
            "Input1": "min ",
            "Input2": "max"
        }, {
            "schemaType": "Single Select ",
            "Input1": "Enum",
            "Input2": ""
        }, {
            "schemaType": "Single Select From Table",
            "Input1": "Collection",
            "Input2": "Field"
        }, {
            "schemaType": "Telephone",
            "Input1": "",
            "Input2": ""
        }, {
            "schemaType": "Text",
            "Input1": "min length",
            "Input2": "max length"
        }, {
            "schemaType": "TextArea",
            "Input1": "min length",
            "Input2": "max length"
        }, {
            "schemaType": "URL",
            "Input1": "",
            "Input2": ""
        }, {
            "schemaType": "WYSIWYG",
            "Input1": "",
            "Input2": ""
        }, {
            "schemaType": "Youtube",
            "Input1": "",
            "Input2": ""
        }];


        $scope.inputTypes = [{
            value: '',
            name: 'Select type of input'
        }, {
            value: 'Text',
            name: 'Text'
        }, {
            value: 'Date',
            name: 'Date'
        }, {
            value: 'Textarea',
            name: 'Textarea'
        }];

        $scope.formData = {};
        $scope.formData.status = true;

        $scope.formData.forms = [{
            head: '',
            items: [{}, {}]
        }];

        $scope.addHead = function () {
            $scope.formData.forms.push({
                head: $scope.formData.forms.length + 1,
                items: [{}]
            });
        };
        $scope.removeHead = function (index) {
            if ($scope.formData.forms.length > 1) {
                $scope.formData.forms.splice(index, 1);
            } else {
                $scope.formData.forms = [{
                    head: '',
                    items: [{}, {}]
                }];
            }
        };

        $scope.addItem = function (obj) {
            var index = $scope.formData.forms.indexOf(obj);
            $scope.formData.forms[index].items.push({});
        };

        $scope.removeItem = function (obj, indexItem) {
            var indexHead = $scope.formData.forms.indexOf(obj);
            if ($scope.formData.forms[indexHead].items.length > 1) {
                $scope.formData.forms[indexHead].items.splice(indexItem, 1);
            } else {
                $scope.formData.forms[indexHead].items = [{}];
            }
        };

    })

    .controller('ExcelUploadCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
        //Used to name the .html file
        $scope.template = TemplateService.changecontent("excel-upload");
        $scope.menutitle = NavigationService.makeactive("Excel Upload");
        TemplateService.title = $scope.menutitle;
        $scope.navigation = NavigationService.getnav();
        $scope.form = {
            file: null,
            model: $stateParams.model
        };

        $scope.excelUploaded = function () {
            console.log("Excel is uploaded with name " + $scope.form.file);
            NavigationService.uploadExcel($scope.form, function (data) {
                $scope.data = data.data;
            });
        };
    })

    .controller('headerctrl', function ($scope, TemplateService, $uibModal) {
        $scope.template = TemplateService;
        $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $(window).scrollTop(0);
        });

    })

    .controller('languageCtrl', function ($scope, TemplateService, $translate, $rootScope) {

        $scope.changeLanguage = function () {
            console.log("Language CLicked");

            if (!$.jStorage.get("language")) {
                $translate.use("hi");
                $.jStorage.set("language", "hi");
            } else {
                if ($.jStorage.get("language") == "en") {
                    $translate.use("hi");
                    $.jStorage.set("language", "hi");
                } else {
                    $translate.use("en");
                    $.jStorage.set("language", "en");
                }
            }
            //  $rootScope.$apply();
        };
    });