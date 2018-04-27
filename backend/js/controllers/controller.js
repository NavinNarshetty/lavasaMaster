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
                console.log(data);
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

});
//Detail Rules
myApp.controller('DetailRulesCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, toastr, $uibModal) {
    //registration filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("detailrules");
    $scope.menutitle = NavigationService.makeactive("Deatil Rules");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();
    $scope.formData = {};
    $scope.deleteVal = "";
    console.log('enter');

    if ($stateParams.id !== '') {
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
                console.log(data);
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
    $scope.addCont = function (crdv) {
        console.log('enter', crdv)
        if (!crdv.eligibilityTable) {
            crdv.eligibilityTable = [{
                "agegroup": "",
                "date": ""
            }];
        } else {
            crdv.eligibilityTable.push({
                "agegroup": "",
                "date": ""
            });
        }
    };
    $scope.addAge = function (crdv) {
        if (!crdv.ageGroupTable) {
            crdv.ageGroupTable = [{
                "agegroup": "",
                "weight": ""
            }];
        } else {
            crdv.ageGroupTable.push({
                "agegroup": "",
                "weight": ""
            });
        }
    };

    $scope.confDelete = function (val) {
        if ($scope.deleteVal === 1) {
            $scope.formData.eligibilityTable.splice($.jStorage.get("deleteEligibilityTable"), 1);
        }
        // else if ($scope.deleteVal === 2) {
        //     $scope.formData.winnerTable.splice($.jStorage.get("deleteWinnerTable"), 1);
        // } else if ($scope.deleteVal === 3) {
        //     $scope.formData.teamTable.splice($.jStorage.get("deleteTeamTable"), 1);
        // }
        else if ($scope.deleteVal === 4) {
            $scope.formData.ageGroupTable.splice($.jStorage.get("deleteAgeGroupTable"), 1);
        }
    };

    $scope.deleteFunc = function (id, value) {
        if (value === 1) {
            $scope.deleteVal = 1;
            $.jStorage.set("deleteEligibilityTable", id);
            // $scope.confDel($.jStorage.set("deleteEligibilityTable", id));
        }
        //  else if (value === 2) {
        //     $scope.deleteVal = 2;
        //     $.jStorage.set("deleteWinnerTable", id);
        // } else if (value === 3) {
        //     $scope.deleteVal = 3;
        //     $.jStorage.set("deleteTeamTable", id);
        // }
        else if (value === 4) {
            $scope.deleteVal = 4;
            $.jStorage.set("deleteAgeGroupTable", id);
        }
        $scope.modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'views/modal/deleterule.html',
            backdrop: 'static',
            keyboard: false,
            size: 'sm',
            scope: $scope

        });
    };
    // $scope.confDel = function (data) {
    //     console.log(data);
    //     $scope.id = data;
    //     $scope.modalInstance = $uibModal.open({
    //         animation: $scope.animationsEnabled,
    //         templateUrl: 'views/modal/delete.html',
    //         backdrop: 'static',
    //         keyboard: false,
    //         size: 'sm',
    //         scope: $scope

    //     });
    // };
    $scope.noDelete = function () {
        $scope.modalInstance.close();
    };
    //end cancel


});

//FaqCtrl

myApp.controller('FaqCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, toastr, $uibModal) {
    //registration filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("other/faq/tablefaq");
    $scope.menutitle = NavigationService.makeactive("Faq");
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
        $scope.url = "Faq/search";
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
    };
    $scope.delete = function (data) {
        console.log(data);
        $scope.url = "Faq/delete";
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
    };

});
//DetailFaqCtrl
myApp.controller('DetailFaqCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, toastr, $uibModal) {
    //registration filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("other/faq/faqdetail");
    $scope.menutitle = NavigationService.makeactive("Deatil Faq");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();
    $scope.formData = {};
    $scope.deleteVal = "";

    if ($stateParams.id !== '') {
        //edit
        $scope.title = 'Edit';
        $scope.getOneOldSchoolById = function () {
            $scope.url = "Faq/getOne";
            $scope.constraints = {};
            $scope.constraints._id = $stateParams.id;
            NavigationService.getOneOldSchoolById($scope.url, $scope.constraints, function (data) {
                console.log(data.data, "data.data");
                $scope.formData = data.data;
            });

        };
        $scope.getOneOldSchoolById();
        $scope.saveData = function (data) {
            if (data) {
                $scope.url = "Faq/save";
                NavigationService.apiCall($scope.url, data, function (data) {
                    console.log("data.value", data);
                    if (data.data.nModified == '1') {
                        toastr.success(" Updated Successfully", "Rules Message");
                        $state.go('faq');

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
                console.log(data);
                $scope.url = "Faq/save";
                NavigationService.apiCall($scope.url, data, function (data) {
                    console.log("data.value", data);
                    if (data.value === true) {
                        toastr.success(" Saved Successfully", "Faq Message");
                        $state.go('faq');
                    }
                });
            } else {
                toastr.error("invalid data", "Faq Message");
            }
        };
    }
    //cancel
    $scope.onCancel = function (sendTo) {
        $state.go(sendTo);
    };
    $scope.addCont = function (crdv, tableContent) {
        console.log(tableContent, "tableContent");
        switch (tableContent) {
            case 'tableContent1':
                if (!crdv.tableContent1) {
                    crdv.tableContent1 = [{
                        "agegroup": "",
                        "date": ""
                    }];
                } else {
                    crdv.tableContent1.push({
                        "agegroup": "",
                        "date": ""
                    });
                }

                break;
            case 'tableContent2':
                if (!crdv.tableContent2) {
                    crdv.tableContent2 = [{
                        "agegroup": "",
                        "date": ""
                    }];
                } else {
                    crdv.tableContent2.push({
                        "agegroup": "",
                        "date": ""
                    });
                }

                break;
            case 'tableContent3':
                if (!crdv.tableContent3) {
                    crdv.tableContent3 = [{
                        "agegroup": "",
                        "date": ""
                    }];
                } else {
                    crdv.tableContent3.push({
                        "agegroup": "",
                        "date": ""
                    });
                }

                break;
            case 'tableContent4':
                if (!crdv.tableContent4) {
                    crdv.tableContent4 = [{
                        "agegroup": "",
                        "date": ""
                    }];
                } else {
                    crdv.tableContent4.push({
                        "agegroup": "",
                        "date": ""
                    });
                }

                break;
            case 'tableContent5':
                if (!crdv.tableContent5) {
                    crdv.tableContent5 = [{
                        "agegroup": "",
                        "date": ""
                    }];
                } else {
                    crdv.tableContent5.push({
                        "agegroup": "",
                        "date": ""
                    });
                }

                break;
            case 'tableContent6':
                if (!crdv.tableContent6) {
                    crdv.tableContent6 = [{
                        "agegroup": "",
                        "date": ""
                    }];
                } else {
                    crdv.tableContent6.push({
                        "agegroup": "",
                        "date": ""
                    });
                }

                break;
            case 'tableContent7':
                if (!crdv.tableContent7) {
                    crdv.tableContent7 = [{
                        "agegroup": "",
                        "date": ""
                    }];
                } else {
                    crdv.tableContent7.push({
                        "agegroup": "",
                        "date": ""
                    });
                }

                break;
            case 'tableContent8':
                if (!crdv.tableContent8) {
                    crdv.tableContent8 = [{
                        "agegroup": "",
                        "date": ""
                    }];
                } else {
                    crdv.tableContent8.push({
                        "agegroup": "",
                        "date": ""
                    });
                }

                break;
            case 'tableContent9':
                if (!crdv.tableContent9) {
                    crdv.tableContent9 = [{
                        "agegroup": "",
                        "date": ""
                    }];
                } else {
                    crdv.tableContent9.push({
                        "agegroup": "",
                        "date": ""
                    });
                }

                break;
            case 'tableContent10':
                if (!crdv.tableContent10) {
                    crdv.tableContent10 = [{
                        "agegroup": "",
                        "date": ""
                    }];
                } else {
                    crdv.tableContent10.push({
                        "agegroup": "",
                        "date": ""
                    });
                }

                break;

        }

    };

    $scope.confDelete = function (val) {
        if ($scope.deleteVal === 1) {
            $scope.formData.tableContent1.splice($.jStorage.get("deleteSpecificIndex"), 1);
        } else if ($scope.deleteVal === 2) {
            $scope.formData.tableContent2.splice($.jStorage.get("deleteSpecificIndex"), 1);
        } else if ($scope.deleteVal === 3) {
            $scope.formData.tableContent3.splice($.jStorage.get("deleteSpecificIndex"), 1);
        } else if ($scope.deleteVal === 4) {
            $scope.formData.tableContent4.splice($.jStorage.get("deleteSpecificIndex"), 1);
        } else if ($scope.deleteVal === 5) {
            $scope.formData.tableContent5.splice($.jStorage.get("deleteSpecificIndex"), 1);
        } else if ($scope.deleteVal === 6) {
            $scope.formData.tableContent6.splice($.jStorage.get("deleteSpecificIndex"), 1);
        } else if ($scope.deleteVal === 7) {
            $scope.formData.tableContent7.splice($.jStorage.get("deleteSpecificIndex"), 1);
        } else if ($scope.deleteVal === 8) {
            $scope.formData.tableContent8.splice($.jStorage.get("deleteSpecificIndex"), 1);
        } else if ($scope.deleteVal === 9) {
            $scope.formData.tableContent9.splice($.jStorage.get("deleteSpecificIndex"), 1);
        } else if ($scope.deleteVal === 10) {
            $scope.formData.tableContent10.splice($.jStorage.get("deleteSpecificIndex"), 1);
        }
    };

    $scope.deleteFunc = function (id, value) {
        if (value === 1) {
            $scope.deleteVal = 1;
            $.jStorage.set("deleteSpecificIndex", id);
        } else if (value === 2) {
            $scope.deleteVal = 2;
            $.jStorage.set("deleteSpecificIndex", id);
        } else if (value === 3) {
            $scope.deleteVal = 3;
            $.jStorage.set("deleteSpecificIndex", id);
        } else if (value === 4) {
            $scope.deleteVal = 4;
            $.jStorage.set("deleteSpecificIndex", id);
        } else if (value === 5) {
            $scope.deleteVal = 5;
            $.jStorage.set("deleteSpecificIndex", id);
        } else if (value === 6) {
            $scope.deleteVal = 6;
            $.jStorage.set("deleteSpecificIndex", id);
        } else if (value === 7) {
            $scope.deleteVal = 7;
            $.jStorage.set("deleteSpecificIndex", id);
        } else if (value === 8) {
            $scope.deleteVal = 8;
            $.jStorage.set("deleteSpecificIndex", id);
        } else if (value === 9) {
            $scope.deleteVal = 9;
            $.jStorage.set("deleteSpecificIndex", id);
        } else if (value === 10) {
            $scope.deleteVal = 10;
            $.jStorage.set("deleteSpecificIndex", id);
        }
        $scope.modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'views/modal/deleterule.html',
            backdrop: 'static',
            keyboard: false,
            size: 'sm',
            scope: $scope

        });
    };



    $scope.noDelete = function () {
        $scope.modalInstance.close();
    };
    //end cancel


});
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
            templateUrl: 'views/modal/delete.html',
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
});

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



});


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
            templateUrl: "views/modal/delete.html",
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

});

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


});

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
            templateUrl: 'views/modal/delete.html',
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
        $scope.url = "SportsListSubCategory/delete";
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
});

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
        $scope.formData = {};
        $scope.formData.filter = [];
        $scope.saveData = function (data, formvalid) {

            if (data) {
                if (formvalid.$valid) {
                    data.rules = $scope.rules;
                    data.sportsListCategory = $scope.sportlistcat;
                    console.log(data);
                    // console.log("item filter", $scope.item.filter);
                    // data.filter = $scope.item.filter;
                    $scope.url = "SportsListSubCategory/save";
                    NavigationService.apiCall($scope.url, data, function (data) {
                        console.log("data.value", data);
                        if (data.value === true) {
                            toastr.success(" Saved Successfully", "SportList Message");
                            $state.go('sportslistsubcat');

                        }

                    });
                } else {
                    toastr.error('Please enter all fields', 'SportList Message')
                }

            } else {
                toastr.error("Invalid Data", "SportList Message");
            }
        };


    }

    $scope.getAllSportListCategory = function (data) {
        console.log(data);
        $scope.url = "SportsListCategory/search";
        $scope.constraints = {};
        $scope.constraints.keyword = data;
        NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
            console.log(data);
            $scope.sportlistcatitems = data.data.results;
        });
    }

    $scope.searchsSportListCategory = function (data) {
        $scope.sportlistcat = data;
    }



    $scope.getAllRules = function (data) {
        console.log(data);
        $scope.url = "Rules/search";
        $scope.constraints = {};
        $scope.constraints.keyword = data;
        NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
            console.log(data);
            $scope.rulesitems = data.data.results;
        });
    }

    $scope.searchRules = function (data) {
        $scope.rules = data;
    }
    $scope.sporttypeList = [];
    $scope.sporttypeList = [{
        name: 'Team Sports'
    }, {
        name: 'Racquet Sports'
    }, {
        name: 'Combat Sports'
    }];
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

});
//s;ports list Category

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
            templateUrl: 'views/modal/delete.html',
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
});
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
            templateUrl: 'views/modal/delete.html',
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

    $scope.generateExcel = function () {
        $scope.url = "sportslist/generateExcel";
        NavigationService.generateExcel($scope.url, function (data) {
            window.location.href = adminurl + $scope.url;
        });
    }
});

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
        $scope.saveData = function (data, formvalid) {
            if (data) {
                if (formvalid.$valid) {
                    // data.sportsListSubCategory = $scope.sportlistsubcategory;
                    $scope.url = "SportsList/save";
                    console.log(data);
                    NavigationService.apiCall($scope.url, data, function (data) {
                        console.log("data.value", data);
                        if (data.value === true) {
                            toastr.success(" Saved Successfully", "SportList Message");
                            $state.go('sportslist');

                        } else {
                            toastr.error("Please enter all fields", 'SportList Message')
                        }

                    });
                } else {
                    toastr.error("Please enter all fields", 'SportList Message')
                }
            } else {
                toastr.error("Invalid Data", "SportList Message");
            }
        };

    }

    $scope.getAllDrawformat = function (data) {
        $scope.url = "DrawFormat/search";
        console.log(data);
        $scope.constraints = {};
        $scope.constraints.keyword = data;
        NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
            console.log("data.value", data);
            $scope.drawitems = data.data.results;

        });
    }
    $scope.searchDrawFormat = function (data) {
        $scope.draw = data;
    }


    $scope.getAllSportListSubCategory = function (data) {
        console.log(data);
        $scope.url = "SportsListSubCategory/search";
        $scope.constraints = {};
        $scope.constraints.keyword = data;
        NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
            console.log("data.value", data);
            $scope.sportstypeitems = data.data.results;
        });
    }
    $scope.searchSportListSubCategory = function (data) {
        console.log(data);
        $scope.sportlistsubcategory = data._id;
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

});

//sports
myApp.controller('SportsCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, toastr, $uibModal) {
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
            templateUrl: 'views/modal/delete.html',
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

    $scope.generateExcel = function () {
        $scope.url = "sport/generateExcel";
        NavigationService.generateExcel($scope.url, function (data) {
            window.location.href = adminurl + $scope.url;
        });
    }
});

//Detail sports

myApp.controller('DetailSportsCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, toastr, $filter) {
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
                $scope.formData.toDate = new Date($scope.formData.toDate);
                $scope.formData.fromDate = new Date($scope.formData.fromDate);
                // $scope.toDates = new Date($scope.formData.toDate);
                // $scope.fromDates = new Date($scope.formData.fromDate);
                // $scope.formData.toDate = $filter('date')($scope.toDates, 'dd/MM/yyyy');
                // $scope.formData.fromDate = $filter('date')($scope.fromDates, 'dd/MM/yyyy');
            });
        };
        $scope.getOneOldSchoolById();
        $scope.dateOptions = {
            dateFormat: "dd/mm/yy",
            changeYear: true,
            changeMonth: true,
            yearRange: "1900:2050"
        };
        $scope.changeFromDate = function (data) {
            console.log("ChangeDate Called");
            $scope.formData.fromDate = data;
        };
        $scope.changeToDate = function (data) {
            console.log("ChangeDate Called");
            $scope.formData.toDate = data;
        };
        $scope.saveData = function (data) {
            console.log(data);
            if (data) {
                if (_.isEmpty(data.weight) && !data.weight) {
                    data.weight = null;
                }
                if (data.maxTeamPlayers >= data.minTeamPlayers) {
                    if (data.fromDate && data.toDate) {
                        $scope.url = "Sport/saveSport";
                        NavigationService.apiCall($scope.url, data, function (data) {
                            console.log("data.value", data);
                            if (data.data.nModified == '1') {
                                toastr.success(" Saved Successfully", "Sport Message");
                                $state.go('sports');
                            }
                        });
                    } else {
                        toastr.error('Please enter cut off dates', 'Sport Message')
                    }
                } else {
                    toastr.error('Please enter a Max Team player value greater then Min Team Player value', 'Sport Message')
                }
            } else {
                toastr.error("Invalid Data", "Sport Message");
            }
        };
    } else {
        $scope.title = "Create";
        $scope.dateOptions = {
            dateFormat: "dd/mm/yy",
            changeYear: true,
            changeMonth: true,
            yearRange: "1900:2050"
        };
        $scope.changeFromDate = function (data) {
            console.log("ChangeDate Called");
            $scope.formData.fromDate = data;
        };
        $scope.changeToDate = function (data) {
            console.log("ChangeDate Called");
            $scope.formData.toDate = data;
        };
        $scope.saveData = function (data, formvalid) {
            console.log(data);
            if (data) {
                if (_.isEmpty(data.weight) && !data.weight) {
                    data.weight = null;
                }
                if (data.maxTeamPlayers >= data.minTeamPlayers) {

                    if (formvalid.$valid) {

                        $scope.url = "Sport/saveSport";
                        NavigationService.apiCall($scope.url, data, function (data) {
                            console.log("data.value", data);
                            if (data.value === true) {
                                toastr.success(" Saved Successfully", "Sport Message");
                                $state.go('sports');

                            }

                        });
                    } else {
                        toastr.error('Please enter all fields', 'Sport Message')
                    }
                } else {
                    toastr.error('Please enter a Max Team player value greater then Min Team Player value', 'Sport Message')
                }

            } else {
                toastr.error("Invalid Data", "Sport Message");
            }
        };
    }

    $scope.getAllSportList = function (data) {
        $scope.url = "SportsList/search";
        console.log(data);
        $scope.constraints = {};
        $scope.constraints.keyword = data;
        NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
            console.log("data.value", data);
            $scope.sportitems = data.data.results;

        });
    }
    $scope.searchSportList = function (data) {
        $scope.draws = data;
    }

    $scope.getAllAge = function (data) {
        $scope.url = "AgeGroup/search";
        console.log(data);
        $scope.constraints = {};
        $scope.constraints.keyword = data;
        NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
            console.log("data.value", data);
            $scope.ageitems = data.data.results;

        });
    }
    $scope.searchAge = function (data) {
        $scope.draw = data;
    }

    $scope.getAllWeight = function (data) {
        $scope.url = "Weight/search";
        console.log(data);
        $scope.constraints = {};
        $scope.constraints.keyword = data;
        NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
            console.log("data.value", data);
            $scope.weightitems = data.data.results;

        });
    }
    $scope.searchWeight = function (data) {
        $scope.drawing = data;
    }


    $scope.genderList = [];
    $scope.genderList = [{
        name: 'Male'
    }, {
        name: 'Female'
    }];

    $scope.sporttypeList = [];

    $scope.ageList = [];


    $scope.weightList = [];

    $scope.onCancel = function (sendTo) {
        $state.go(sendTo);
    }

});

//team sport
myApp.controller('TeamSportCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, toastr, $uibModal, excelService) {
    //registration filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("tableteamsport");
    $scope.menutitle = NavigationService.makeactive("Team Sport");
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
        $scope.url = "TeamSport/search";
        $scope.formData.page = $scope.formData.page++;
        NavigationService.apiCall($scope.url, $scope.formData, function (data) {
            console.log("data.value", data);
            $scope.items = data.data.results;
            $scope.totalItems = data.data.total;
            $scope.maxRow = data.data.options.count;

        });
    }
    $scope.viewTable();
    $scope.removeTeam = function (teamId) {
        teamId

    }
    $scope.removeTeam = function (data) {
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
        // console.log(data);
        $scope.url = "TeamSport/rejectionTeam";
        $scope.constraints = {};
        $scope.constraints.teamId = data;
        console.log(data, "teamid")
        NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
            if (data.value) {
                toastr.success('Successfully Deleted', 'Team Sport Message');
                $scope.modalInstance.close();
                $scope.viewTable();
            } else {
                toastr.error('Something Went Wrong while Deleting', 'Team Sport Message');
            }
        });
    }

    // $scope.user = $.jStorage.get("user");
    $scope.login = {};
    var navigationUrl;
    var filename = 'Teamsports';

    // INITIALISE VARIABLES END
    $scope.loginPopup = function (commonData, type) {
        if (type === 'excel') {
            navigationUrl = 'teamSport/generateExcel';
        }
        console.log(commonData, "*********************");
        excelService.loginPopup(commonData, $scope, type);
    }
    $scope.loginSubmit = function (login) {
        console.log(login, "check")

        excelService.loginSubmit(login, navigationUrl, filename)

    }

    // OLD FUNCTION
    $scope.generateExcel = function () {
        $scope.url = "teamSport/generateExcel";
        NavigationService.generateExcel($scope.url, function (data) {
            window.location.href = adminurl + $scope.url;
        });
    }
});

//view-team sport

myApp.controller('DetailTeamSportCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, toastr) {
    //registration filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("detailteamsport");
    $scope.menutitle = NavigationService.makeactive("Detail Team Sport");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();
    $scope.athlete = {};
    $scope.formData = {};
    $scope.studentTeam = [];
    $scope.getOneTeamSportById = function () {
        $scope.url = 'TeamSport/getOne';
        $scope.constraints = {};
        $scope.constraints._id = $stateParams.id;
        NavigationService.getOneOldSchoolById($scope.url, $scope.constraints, function (data) {
            $scope.formData = data.data;
            $scope.formData.createdBy = data.data.createdBy;
            if ($scope.formData.school) {
                $scope.url1 = 'Registration/getOne';
                $scope.request = {};
                $scope.request._id = $scope.formData.school;
                NavigationService.getOneOldSchoolById($scope.url1, $scope.request, function (data) {
                    $scope.formData.school = data.data.schoolName;
                });
            }
            if ($scope.formData.sport) {
                $scope.url2 = 'Sport/getOne';
                $scope.request1 = {};
                $scope.request1._id = $scope.formData.sport;
                NavigationService.getOneOldSchoolById($scope.url2, $scope.request1, function (data) {
                    console.log("data sport", data);
                    $scope.formData.sport = data.data.sportslist.name + " " + data.data.gender + " " + data.data.ageGroup.name;
                });
            }
            if ($scope.formData.studentTeam) {
                $scope.i = 0;
                $scope.teamStudent = $scope.formData.studentTeam;
                $scope.formData.studentTeam = [];
                _.each($scope.teamStudent, function (n) {
                    $scope.url2 = 'StudentTeam/getOne';
                    $scope.request1 = {};
                    $scope.request1._id = n;
                    console.log('value', $scope.i);
                    NavigationService.getOneOldSchoolById($scope.url2, $scope.request1, function (data) {
                        console.log("data student", data);
                        console.log('value', $scope.i);
                        if (data.data.studentId) {
                            $scope.url2 = 'Athelete/getOne';
                            $scope.request1 = {};
                            $scope.request1._id = data.data.studentId;
                            NavigationService.getOneOldSchoolById($scope.url2, $scope.request1, function (data) {
                                console.log("data student detaail", data);
                                if (data.data.middleName) {
                                    $scope.athlete = data.data.firstName + " " + data.data.middleName + " " + data.data.surname;
                                    $scope.athleteId = data.data.sfaId;
                                    $scope.city = data.data.city;
                                    $scope.formData.studentTeam.push({
                                        name: $scope.athlete,
                                        sfaId: $scope.athleteId,
                                        city: $scope.city
                                    });
                                } else {
                                    $scope.athlete = data.data.firstName + " " + data.data.surname;
                                    $scope.athleteId = data.data.sfaId;
                                    $scope.city = data.data.city;
                                    $scope.formData.studentTeam.push({
                                        name: $scope.athlete,
                                        sfaId: $scope.athleteId,
                                        city: $scope.city
                                    });
                                }
                            });
                        }
                        if (data.data.isCaptain) {
                            $scope.request1 = {};
                            $scope.url2 = 'Athelete/getOne';
                            $scope.request1._id = data.data.studentId;
                            NavigationService.getOneOldSchoolById($scope.url2, $scope.request1, function (data) {
                                if (data.value) {
                                    if (data.data.middleName) {
                                        $scope.formData.captain = data.data.sfaId + " - " + data.data.firstName + " " + data.data.middleName + " " + data.data.surname;
                                    } else {
                                        $scope.formData.captain = data.data.sfaId + " - " + data.data.firstName + " " + data.data.surname;
                                    }

                                }
                            });

                        }
                        if (data.data.isGoalKeeper) {
                            $scope.request1 = {};
                            $scope.url2 = 'Athelete/getOne';
                            $scope.request1._id = data.data.studentId;
                            NavigationService.getOneOldSchoolById($scope.url2, $scope.request1, function (data) {
                                if (data.value) {
                                    if (data.data.middleName) {
                                        $scope.formData.goalKeeper = data.data.sfaId + " - " + data.data.firstName + " " + data.data.middleName + " " + data.data.surname;
                                    } else {
                                        $scope.formData.goalKeeper = data.data.sfaId + " - " + data.data.firstName + " " + data.data.surname;
                                    }

                                }
                            });
                        }
                        $scope.i++;
                    });
                });
            }
        });
    };
    $scope.getOneTeamSportById();
});

//student team

myApp.controller('StudentTeamCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, toastr) {
    //registration filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("tablestudentteam");
    $scope.menutitle = NavigationService.makeactive("Student Team");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();

    $scope.formData = {};
    $scope.formData.page = 1;
    $scope.formData.type = '';
    $scope.formData.keyword = '';

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
        $scope.url = "StudentTeam/search";
        $scope.formData.page = $scope.formData.page++;
        NavigationService.apiCall($scope.url, $scope.formData, function (data) {
            console.log("data.value", data);
            $scope.items = data.data.results;
            $scope.totalItems = data.data.total;
            $scope.maxRow = data.data.options.count;
        });
    }
    $scope.viewTable();

});

//table-individualteamsport

myApp.controller('IndividualTeamCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, toastr, $uibModal, base64Service, excelService) {
    //registration filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("tableindividualsport");
    $scope.menutitle = NavigationService.makeactive("Individual Sport");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();
    $scope.items = [{
        name: 'Navin',
        sname: 'Football',
    }, {
        name: 'Navin',
        sname: 'Football',
    }, {
        name: 'Navin',
        sname: 'Football',
    }]
    $scope.formData = {};
    $scope.formData.page = 1;
    $scope.formData.type = '';
    $scope.formData.keyword = '';

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
        $scope.url = "individualSport/search";
        $scope.formData.page = $scope.formData.page++;
        NavigationService.apiCall($scope.url, $scope.formData, function (data) {
            console.log("data.value", data);
            $scope.items = data.data.results;
            $scope.totalItems = data.data.total;
            $scope.maxRow = data.data.options.count;
        });
    }
    $scope.viewTable();

    $scope.removeTeam = function (data) {
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
        // console.log(data);
        $scope.url = "individualSport/delete";
        $scope.constraints = {};
        $scope.constraints._id = data;
        NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
            if (data.value) {
                toastr.success('Successfully Deleted', 'Team Sport Message');
                $scope.modalInstance.close();
                $scope.viewTable();
            } else {
                toastr.error('Something Went Wrong while Deleting', 'Team Sport Message');
            }
        });
    }

    // INITIALISE VARIABLES
    // $scope.user = $.jStorage.get("user");
    $scope.login = {};
    var navigationUrl;
    var filename = 'IndividualSport';

    // INITIALISE VARIABLES END
    $scope.loginPopup = function (commonData, type) {
        if (type === 'excel') {
            navigationUrl = 'individualSport/generateExcel';
        }
        console.log(commonData, "*********************");
        excelService.loginPopup(commonData, $scope, type);
    }
    $scope.loginSubmit = function (login) {
        console.log(login, "check")

        excelService.loginSubmit(login, navigationUrl, filename)

    }

    // OLD GENERATE EXCEL
    $scope.generateExcel = function () {
        $scope.url = "individualSport/generateExcel";
        NavigationService.generateExcel($scope.url, function (data) {
            window.location.href = adminurl + $scope.url;
        });
    }

});
//viewindividualteamsport
myApp.controller('ViewIndividualSportCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, toastr, $uibModal) {
    //registration filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("viewindividualsport");
    $scope.menutitle = NavigationService.makeactive("View Individual  Sport");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();
    $scope.athlete = {};
    $scope.eventName = [];

    $scope.getOneOldSchoolById = function () {
        $scope.url = "individualSport/getOne";
        $scope.constraints = {};
        $scope.constraints._id = $stateParams.id;
        $scope.i = 0;
        NavigationService.getOneOldSchoolById($scope.url, $scope.constraints, function (data) {
            console.log("newdata", data);
            // $scope.viewathlete = data;
            $scope.athlete = data.data;
            if (data.data.athleteId.middleName) {

                $scope.athlete.name = data.data.athleteId.firstName + " " + data.data.athleteId.middleName + " " + data.data.athleteId.surname
            } else {
                $scope.athlete.name = data.data.athleteId.firstName + " " + data.data.athleteId.surname
            }
            if (data.data.athleteId.school) {
                $scope.url3 = 'school/getOne';
                $scope.sconstraints = {};
                $scope.sconstraints._id = data.data.athleteId.school;
                NavigationService.getOneOldSchoolById($scope.url3, $scope.sconstraints, function (data) {
                    console.log("data schools", data);
                    $scope.schoolName = data.data.name;
                })
            }
            if (data.data.athleteId.atheleteSchoolName) {
                // $scope.url3 = 'school/getOne';
                // $scope.sconstraints = {};
                // $scope.sconstraints._id = data.data.athleteId.school;
                // NavigationService.getOneOldSchoolById($scope.url3, $scope.sconstraints, function (data) {
                //     console.log("data schools", data);
                //     $scope.schoolName = data.data.name;
                // })
                $scope.schoolName = data.data.athleteId.atheleteSchoolName;
            }

            _.each($scope.athlete.sport, function (n) {
                $scope.url2 = 'sport/getOne';
                $scope.request1 = {};
                $scope.request1._id = n;
                console.log('value', $scope.i);
                NavigationService.getOneOldSchoolById($scope.url2, $scope.request1, function (data) {
                    $scope.vathlete = data.data;
                    console.log("students", $scope.vathlete);
                    $scope.eventNameWithAgeGroup = $scope.vathlete.ageGroup.name + ' - ' + $scope.vathlete.sportslist.name;
                    $scope.eventName.push({
                        name: $scope.eventNameWithAgeGroup
                    });
                });
                $scope.i++;
            });
            // if (data.data.athleteId) {
            //     $scope.url2 = 'Athelete/getOne';
            //     $scope.request1 = {};
            //     $scope.request1._id = data.data.athleteId;
            //     NavigationService.getOneOldSchoolById($scope.url, $scope.request1, function (data) {
            //         console.log("navin", data);
            //     });
            // }
        });
    }
    $scope.getOneOldSchoolById();
});

myApp.controller('SchoolCtrl', function ($scope, TemplateService, NavigationService, $timeout, toastr, $state, $stateParams, base64Service, excelService) {
    //registration filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("tableschool");
    $scope.menutitle = NavigationService.makeactive("View School");
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

    $scope.currentSatateName = $state.current.name;
    $scope.formData = {};
    $scope.formData.page = 1;
    $scope.formData.type = '';
    $scope.formData.keyword = '';
    $scope.changeInput = function () {
        $scope.filterSchool();
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

    $scope.login = {};
    var navigationUrl;
    var filename = 'School';

    // INITIALISE VARIABLES END
    $scope.loginPopup = function (commonData, type) {
        if (type === 'excel') {
            navigationUrl = 'Registration/generateExcel';
        }
        console.log(commonData, "*********************");
        excelService.loginPopup(commonData, $scope, type);
    }
    $scope.loginSubmit = function (login) {
        console.log(login, "check")

        excelService.loginSubmit(login, navigationUrl, filename)

    }

    $scope.generateExcel = function (formData) {
        console.log("formdata", formData);
        NavigationService.generateSchoolExcelWithData(formData, function (data) {});
    }

    $scope.transferToWebsite = function (id) {
        console.log(id);
        $scope.constraints = {};
        $scope.constraints.schoolId = base64Service.encode(id);
        if (window.location.origin == 'http://mumbaischool.sfanow.in') {
            window.location = 'http://mumbaischool.sfanow.in/sports-selection/' + 'school/' + $scope.constraints.schoolId;
        } else if (window.location.origin == 'http://mumbaicollege.sfanow.in') {
            window.location = 'http://mumbaicollege.sfanow.in/sports-selection/' + 'school/' + $scope.constraints.schoolId;
        } else if (window.location.origin == 'http://hyderabadschool.sfanow.in') {
            window.location = 'http://hyderabadschool.sfanow.in/sports-selection/' + 'school/' + $scope.constraints.schoolId;
        } else if (window.location.origin == 'http://ahmedabadschool.sfanow.in') {
            window.location = 'http://ahmedabadschool.sfanow.in/sports-selection/' + 'school/' + $scope.constraints.schoolId;
        } else if (window.location.origin == 'http://hyderabadcollege.sfanow.in') {
            window.location = 'http://hyderabadcollege.sfanow.in/sports-selection/' + 'school/' + $scope.constraints.schoolId;
        } else if (window.location.origin == 'http://ahmedabadcollege.sfanow.in') {
            window.location = 'http://ahmedabadcollege.sfanow.in/sports-selection/' + 'school/' + $scope.constraints.schoolId;
        } else if (window.location.origin == 'http://testmumbaischool.sfanow.in') {
            window.location = 'http://testmumbaischool.sfanow.in/sports-selection/' + 'school/' + $scope.constraints.schoolId;
        } else if (window.location.origin == 'http://testhyderabadschool.sfanow.in') {
            window.location = 'http://testhyderabadschool.sfanow.in/sports-selection/' + 'school/' + $scope.constraints.schoolId;
        } else if (window.location.origin == 'http://testahmedabadschool.sfanow.in') {
            window.location = 'http://testahmedabadschool.sfanow.in/sports-selection/' + 'school/' + $scope.constraints.schoolId;
        } else if (window.location.origin == 'http://testmumbaicollege.sfanow.in') {
            window.location = 'http://testmumbaicollege.sfanow.in/sports-selection/' + 'school/' + $scope.constraints.schoolId;
        } else if (window.location.origin == 'http://testhyderabadcollege.sfanow.in') {
            window.location = 'http://testhyderabadcollege.sfanow.in/sports-selection/' + 'school/' + $scope.constraints.schoolId;
        } else if (window.location.origin == 'http://testahmedabadcollege.sfanow.in') {
            window.location = 'http://testahmedabadcollege.sfanow.in/sports-selection/' + 'school/' + $scope.constraints.schoolId;
        } else if (window.location.origin == 'http://localhost:8081') {
            window.location = 'http://localhost:8082/#/sports-selection/' + 'school/' + $scope.constraints.schoolId;
        }



        //  window.location = 'http://localhost:8080/#/sports-selection/' + 'school/' + $scope.constraints.schoolId;

        // window.location = 'http://localhost:8080/#/sports-selection/' + 'school/' + $scope.constraints.schoolId;


        // console.log($scope.constraints);
        // $scope.url = "Login/editAccess"
        // NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
        //     console.log("dataaaaa", data);
        // });

        // For decode at frontend level
        // console.log(id);
        // console.log($scope.constraints);
        // $scope.constraintis = {};
        // $scope.constraintis._id = base64Service.decode($scope.constraints._id);
        // console.log($scope.constraintis);

    }

    // FOR SPORTOPS START
    if ($state.current.name == "schoolOps") {
        $scope.jSchoolops = $.jStorage.get('schoolOps');
        if (($.jStorage.get("accessLevel") == "Admin") && ($.jStorage.get('schoolOps') == null)) {
            excelService.loginPayuPopup($scope);
        } else if (($.jStorage.get("accessLevel") == "Accounts" || $.jStorage.get("accessLevel") == "Sports Ops") && ($.jStorage.get('schoolOps') == null)) {
            $.jStorage.set('schoolOps', 'school in ops');
        }
    }
    $scope.submit = function (login) {
        excelService.submitPayuPopup(login, 'schoolOps', $state);
    }
    $scope.logout = function () {
        $.jStorage.deleteKey("schoolOps");
        toastr.success("Logout Successfully", 'Success Message');
        $state.reload();
    }
    if ($state.current.name == 'schoolOps') {
        $scope.showAccess = false;
    } else {
        $scope.showAccess = true;
    }

    // FOR SPORTOPS END
})

myApp.controller('AthleteCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, base64Service, $uibModal, toastr, excelService) {
    //athlete filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("tableathlete");
    $scope.menutitle = NavigationService.makeactive("View Athlete");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();
    $scope.currentSatateName = $state.current.name;
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
        // $scope.search = $scope.formData.keyword;
        $scope.formData.page = $scope.formData.page++;
        NavigationService.apiCall($scope.url, $scope.formData, function (data) {
            $scope.items = data.data.results;
            $scope.totalItems = data.data.total;
            $scope.maxRow = data.data.options.count;
        });

    };
    $scope.filterAthlete();
    //raj function
    $scope.generateExcelOLD = function (formdata) {
        formdata.page = $scope.formData.page;
        console.log(formdata);
        NavigationService.generateAthleteExcelWithData(formdata, function (data) {
            // console.log('controller', data);
            // // $scope.zipCreate = function (data) {
            console.log('All', data);
            console.log('excel', data.data);
            console.log('info', data.config);
            $scope.zConstraint = {};
            // $scope.zConstraint.userName = data.firstName + '_' + data.lastName;
            // $scope.zConstraint.userStringId = data.userStringId;

            $scope.excelData = data.data;


            console.log($scope.zConstraint);
            // var zip = new xlsx();  
            var files = [];

            files.push($scope.excelData);
            // console.log("inside files", files);
            // var img = zip.folder(Athlete);  

            async.each(files, function (values, callback) {
                callback();
                // if (values.Image) {
                //     var value = values.Image;
                //     var extension = value.split(".").pop();
                //     extension = extension.toLowerCase();   
                //     if (extension == "jpeg") {    
                //         extension = "jpg";   
                //     }   
                //     var i = value.indexOf(".");   
                //     i--;   
                //     var name = values.Name;

                //     getBase64FromImageUrl(adminURL + "upload/readFile?file=" + value, function (imageData) {
                //         img.file(name + "." + extension, imageData, {
                //             createFolders: false,
                //             base64: true
                //         });  
                //         callback();
                //     }); 
                // } else {
                //     callback();
                // }
            }, function (err, data) {
                zip.generateAsync({
                    type: "blob",
                }).then(function (content) {     // see FileSaver.js
                    saveAs(content, Athlete + ".zip");
                });
            });
            // window.location.href = adminurl + 'Athelete/generateExcel';
        });
    }

    // OLD FUNCTIONS
    $scope.targetAthleteExcel = function () {
        var param = {};
        param.file = "targetAthlete"
        var url = "Athelete/getTargetAthlete"
        NavigationService.generateExcelWithoutData(url, param, function (data) {});
    }
    $scope.generateExcel = function (formdata) {
        if (_.isEmpty(formdata.type)) {
            console.log("else");
            NavigationService.generateAthleteExcelWithData(formdata, function (data) {});
        } else {
            console.log(formdata);
            NavigationService.generateAthleteExcelWithData(formdata, function (data) {});
        }
    }
    // OLD FUNCTIONS
    // INITIALISE VARIABLES
    // $scope.user = $.jStorage.get("user");
    $scope.login = {};
    var navigationUrl;
    var filename = 'Athlete';

    // INITIALISE VARIABLES END
    $scope.loginPopup = function (commonData, type) {
        if (type === 'excel') {
            navigationUrl = 'Athelete/generateExcel';
        } else if (type === 'targetexcel') {
            navigationUrl = "Athelete/getTargetAthlete";
        }
        console.log(commonData, "*********************");
        excelService.loginPopup(commonData, $scope, type);
    }
    $scope.loginSubmit = function (login) {
        console.log(login, "check")

        excelService.loginSubmit(login, navigationUrl, filename)

    }
    $scope.transferToWebsite = function (id) {
        $scope.constraints = {};
        $scope.constraints.athleteId = base64Service.encode(id);

        if (window.location.origin == 'http://mumbaischool.sfanow.in') {
            window.location = 'http://mumbaischool.sfanow.in/sports-selection/' + 'athlete/' + $scope.constraints.athleteId;
        } else if (window.location.origin == 'http://mumbaicollege.sfanow.in') {
            window.location = 'http://mumbaicollege.sfanow.in/sports-selection/' + 'athlete/' + $scope.constraints.athleteId;
        } else if (window.location.origin == 'http://hyderabadschool.sfanow.in') {
            window.location = 'http://hyderabadschool.sfanow.in/sports-selection/' + 'athlete/' + $scope.constraints.athleteId;
        } else if (window.location.origin == 'http://ahmedabadschool.sfanow.in') {
            window.location = 'http://ahmedabadschool.sfanow.in/sports-selection/' + 'athlete/' + $scope.constraints.athleteId;
        } else if (window.location.origin == 'http://hyderabadcollege.sfanow.in') {
            window.location = 'http://hyderabadcollege.sfanow.in/sports-selection/' + 'athlete/' + $scope.constraints.athleteId;
        } else if (window.location.origin == 'http://ahmedabadcollege.sfanow.in') {
            window.location = 'http://ahmedabadcollege.sfanow.in/sports-selection/' + 'athlete/' + $scope.constraints.athleteId;
        } else if (window.location.origin == 'http://testmumbaischool.sfanow.in') {
            window.location = 'http://testmumbaischool.sfanow.in/sports-selection/' + 'athlete/' + $scope.constraints.athleteId;
        } else if (window.location.origin == 'http://testhyderabadschool.sfanow.in') {
            window.location = 'http://testhyderabadschool.sfanow.in/sports-selection/' + 'athlete/' + $scope.constraints.athleteId;
        } else if (window.location.origin == 'http://testahmedabadschool.sfanow.in') {
            window.location = 'http://testahmedabadschool.sfanow.in/sports-selection/' + 'athlete/' + $scope.constraints.athleteId;
        } else if (window.location.origin == 'http://testmumbaicollege.sfanow.in') {
            window.location = 'http://testmumbaicollege.sfanow.in/sports-selection/' + 'athlete/' + $scope.constraints.athleteId;
        } else if (window.location.origin == 'http://testhyderabadcollege.sfanow.in') {
            window.location = 'http://testhyderabadcollege.sfanow.in/sports-selection/' + 'athlete/' + $scope.constraints.athleteId;
        } else if (window.location.origin == 'http://testahmedabadcollege.sfanow.in') {
            window.location = 'http://testahmedabadcollege.sfanow.in/sports-selection/' + 'athlete/' + $scope.constraints.athleteId;
        } else if (window.location.origin == 'http://localhost:8081') {
            window.location = 'http://localhost:8080/#/sports-selection/' + 'athlete/' + $scope.constraints.athleteId;
        }
        // $scope.url = "Login/editAccess"
        // NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
        //     console.log(data);
        // });

        // For decode at frontend level
        // console.log(id);
        // console.log($scope.constraints);
        // $scope.constraintis = {};
        // $scope.constraintis._id =  .decode($scope.constraints._id);
        // console.log($scope.constraintis);

    }
    // for SPORTOPS LOGIN
    $scope.jAtheletOps = $.jStorage.get('athleteOps');
    if ($state.current.name == "athleteOps") {
        if (($.jStorage.get("accessLevel") == "Admin") && ($.jStorage.get('athleteOps') == null)) {
            excelService.loginPayuPopup($scope);
        } else if (($.jStorage.get("accessLevel") == "Accounts" || $.jStorage.get("accessLevel") == "Sports Ops") && ($.jStorage.get('athleteOps') == null)) {
            $.jStorage.set('athleteOps', 'athlete in ops');
        }
    }

    $scope.submit = function (login) {
        excelService.submitPayuPopup(login, 'athleteOps', $state);
    }
    $scope.logout = function () {
        $.jStorage.deleteKey("athleteOps");
        toastr.success("Logout Successfully", 'Success Message');
        $state.reload();
    }

    if ($state.current.name == 'athleteOps') {
        $scope.showAccess = false;
    } else {
        $scope.showAccess = true;
    }
    // for SPORTOPS LOGIN END
})
myApp.controller('AthletepayustatusCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, base64Service, $uibModal, toastr, excelService) {
    //athlete filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("tableathletepayu");
    $scope.menutitle = NavigationService.makeactive("Athlete Payu Status");
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

        $scope.url = "Athelete/getAthletePaymentStatus";
        $scope.search = $scope.formData.keyword;
        $scope.formData.page = $scope.formData.page++;


        NavigationService.apiCall($scope.url, $scope.formData, function (data) {
            $scope.items = data.data.results;
            $scope.totalItems = data.data.total;
            $scope.maxRow = data.data.options.count;
        });

    };
    $scope.filterAthlete();
    //raj function
    $scope.generateExcelOLD = function (formdata) {
        formdata.page = $scope.formData.page;
        console.log(formdata);
        NavigationService.generateAthleteExcelWithData(formdata, function (data) {
            // console.log('controller', data);
            // // $scope.zipCreate = function (data) {
            console.log('All', data);
            console.log('excel', data.data);
            console.log('info', data.config);
            $scope.zConstraint = {};
            // $scope.zConstraint.userName = data.firstName + '_' + data.lastName;
            // $scope.zConstraint.userStringId = data.userStringId;

            $scope.excelData = data.data;


            console.log($scope.zConstraint);
            // var zip = new xlsx();  
            var files = [];

            files.push($scope.excelData);
            // console.log("inside files", files);
            // var img = zip.folder(Athlete);  

            async.each(files, function (values, callback) {
                callback();
                // if (values.Image) {
                //     var value = values.Image;
                //     var extension = value.split(".").pop();
                //     extension = extension.toLowerCase();   
                //     if (extension == "jpeg") {    
                //         extension = "jpg";   
                //     }   
                //     var i = value.indexOf(".");   
                //     i--;   
                //     var name = values.Name;

                //     getBase64FromImageUrl(adminURL + "upload/readFile?file=" + value, function (imageData) {
                //         img.file(name + "." + extension, imageData, {
                //             createFolders: false,
                //             base64: true
                //         });  
                //         callback();
                //     }); 
                // } else {
                //     callback();
                // }
            }, function (err, data) {
                zip.generateAsync({
                    type: "blob",
                }).then(function (content) {     // see FileSaver.js
                    saveAs(content, Athlete + ".zip");
                });
            });
            // window.location.href = adminurl + 'Athelete/generateExcel';
        });
    }

    // OLD FUNCTIONS
    $scope.targetAthleteExcel = function () {
        var param = {};
        param.file = "targetAthlete"
        var url = "Athelete/getTargetAthlete"
        NavigationService.generateExcelWithoutData(url, param, function (data) {});
    }
    $scope.generateExcel = function (formdata) {
        if (_.isEmpty(formdata.type)) {
            console.log("else");
            NavigationService.generateAthleteExcelWithData(formdata, function (data) {});
        } else {
            console.log(formdata);
            NavigationService.generateAthleteExcelWithData(formdata, function (data) {});
        }
    }
    // OLD FUNCTIONS
    // INITIALISE VARIABLES
    // $scope.user = $.jStorage.get("user");
    $scope.login = {};
    var navigationUrl;
    var filename = 'Athlete';

    // INITIALISE VARIABLES END
    $scope.loginPopup = function (commonData, type) {
        if (type === 'excel') {
            navigationUrl = 'Athelete/generateExcel';
        } else if (type === 'targetexcel') {
            navigationUrl = "Athelete/getTargetAthlete";
        }
        console.log(commonData, "*********************");
        excelService.loginPopup(commonData, $scope, type);
    }
    $scope.loginSubmit = function (login) {
        console.log(login, "check")

        excelService.loginSubmit(login, navigationUrl, filename)

    }

    $scope.transferToWebsite = function (id) {
        $scope.constraints = {};
        $scope.constraints.athleteId = base64Service.encode(id);

        if (window.location.origin == 'http://mumbaischool.sfanow.in') {
            window.location = 'http://mumbaischool.sfanow.in/sports-selection/' + 'athlete/' + $scope.constraints.athleteId;
        } else if (window.location.origin == 'http://mumbaicollege.sfanow.in') {
            window.location = 'http://mumbaicollege.sfanow.in/sports-selection/' + 'athlete/' + $scope.constraints.athleteId;
        } else if (window.location.origin == 'http://hyderabadschool.sfanow.in') {
            window.location = 'http://hyderabadschool.sfanow.in/sports-selection/' + 'athlete/' + $scope.constraints.athleteId;
        } else if (window.location.origin == 'http://ahmedabadschool.sfanow.in') {
            window.location = 'http://ahmedabadschool.sfanow.in/sports-selection/' + 'athlete/' + $scope.constraints.athleteId;
        } else if (window.location.origin == 'http://hyderabadcollege.sfanow.in') {
            window.location = 'http://hyderabadcollege.sfanow.in/sports-selection/' + 'athlete/' + $scope.constraints.athleteId;
        } else if (window.location.origin == 'http://ahmedabadcollege.sfanow.in') {
            window.location = 'http://ahmedabadcollege.sfanow.in/sports-selection/' + 'athlete/' + $scope.constraints.athleteId;
        } else if (window.location.origin == 'http://testmumbaischool.sfanow.in') {
            window.location = 'http://testmumbaischool.sfanow.in/sports-selection/' + 'athlete/' + $scope.constraints.athleteId;
        } else if (window.location.origin == 'http://testhyderabadschool.sfanow.in') {
            window.location = 'http://testhyderabadschool.sfanow.in/sports-selection/' + 'athlete/' + $scope.constraints.athleteId;
        } else if (window.location.origin == 'http://testahmedabadschool.sfanow.in') {
            window.location = 'http://testahmedabadschool.sfanow.in/sports-selection/' + 'athlete/' + $scope.constraints.athleteId;
        } else if (window.location.origin == 'http://testmumbaicollege.sfanow.in') {
            window.location = 'http://testmumbaicollege.sfanow.in/sports-selection/' + 'athlete/' + $scope.constraints.athleteId;
        } else if (window.location.origin == 'http://testhyderabadcollege.sfanow.in') {
            window.location = 'http://testhyderabadcollege.sfanow.in/sports-selection/' + 'athlete/' + $scope.constraints.athleteId;
        } else if (window.location.origin == 'http://testahmedabadcollege.sfanow.in') {
            window.location = 'http://testahmedabadcollege.sfanow.in/sports-selection/' + 'athlete/' + $scope.constraints.athleteId;
        } else if (window.location.origin == 'http://localhost:8081') {
            window.location = 'http://localhost:8080/#/sports-selection/' + 'athlete/' + $scope.constraints.athleteId;
        }
        // $scope.url = "Login/editAccess"
        // NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
        //     console.log(data);
        // });

        // For decode at frontend level
        // console.log(id);
        // console.log($scope.constraints);
        // $scope.constraintis = {};
        // $scope.constraintis._id =  .decode($scope.constraints._id);
        // console.log($scope.constraintis);

    }
    //LOGIN POPUP FOR ATHELETE PAYU

    // if ($.jStorage.get("isAtheletePayu") == null) {
    //     excelService.loginPayuPopup($scope);
    // }

    $scope.submit = function (login) {
        console.log("immin");
        if (login) {
            console.log("login", login);
            excelService.submitPayuPopup(login, 'Athelete');
        }

    }

    $scope.jAtheletePayu = $.jStorage.get("isAtheletePayu");
    if ($.jStorage.get("isAtheletePayu") == null) {
        excelService.loginPayuPopup($scope);
    }
    $scope.submit = function (login) {
        if (login) {
            console.log("login", login);
            excelService.submitPayuPopup(login, 'Athelete', $state);
        }
    }

    $scope.logout = function () {
        $.jStorage.deleteKey("isAtheletePayu");
        toastr.success("Logout Successfully", 'Success Message');
        $state.reload();
    }
    //LOGIN POPUP FOR ATHELETE PAYU END
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
});

myApp.controller('ViewAthleteCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams) {
    //old school filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("viewathlete");
    $scope.menutitle = NavigationService.makeactive("View Athlete");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();
    if ($.jStorage.get("accessLevel")) {
        var accesslevel = $.jStorage.get("accessLevel");
    }
    if ($.jStorage.get('athleteOps')) {
        $scope.jAtheletOps = $.jStorage.get('athleteOps');
    }

    $scope.getOneAthleteById = function () {
        // $scope.url = 'Athelete/getOne';
        $scope.url = 'Athelete/getOneAthlete';
        $scope.constraints = {};
        $scope.constraints._id = $stateParams.id;
        NavigationService.getOneOldSchoolById($scope.url, $scope.constraints, function (data) {
            $scope.athlete = data.data.athlete;
            $scope.displayData = data.data.display;
            console.log("$scope.display", $scope.displayData);
            console.log($scope.athlete);
            if ($scope.athlete.Photo_ID === true) {
                $scope.athlete.Photo_ID = 'Yes'
            } else {
                $scope.athlete.Photo_ID = 'No'
            }
            if ($scope.athlete.School_Id === true) {
                $scope.athlete.School_Id = 'Yes'
            } else {
                $scope.athlete.School_Id = 'No'
            }
            if ($scope.athlete.Age_Proof === true) {
                $scope.athlete.Age_Proof = 'Yes'
            } else {
                $scope.athlete.Age_Proof = 'No'
            }
            // if($scope.athelete.)
            if ($scope.athlete.school) {
                1
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
});

myApp.controller('EditAthleteCtrl', function ($scope, TemplateService, NavigationService, $timeout, toastr, $state, $stateParams) {
    //old school filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("editathlete");
    $scope.menutitle = NavigationService.makeactive("Edit Athlete");
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
    $scope.saveData = function (data) {
        console.log(" $scope.school", data);
        if (data) {
            $scope.url = "Athelete/save";
            console.log(data);
            NavigationService.apiCall($scope.url, data, function (data) {
                console.log("data.value", data);
                if (data.value) {
                    toastr.success('Saved Successfully', 'Success Message');
                    $state.go('athletepayustatus');
                } else {

                }

            });
        } else {
            toastr.error("Invalid Data", "Error Message");
        }
    };
});

myApp.controller('ViewSchoolCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams) {
    //old school filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("viewschool");
    $scope.menutitle = NavigationService.makeactive("View School");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();

    if ($.jStorage.get("accessLevel")) {
        var accesslevel = $.jStorage.get("accessLevel");
    }

    if ($.jStorage.get('schoolOps')) {
        $scope.jSchoolops = $.jStorage.get('schoolOps');
    }

    $scope.getOneSchoolById = function () {
        $scope.url = 'Registration/getOne';
        $scope.constraints = {};
        $scope.constraints._id = $stateParams.id;
        NavigationService.getOneOldSchoolById($scope.url, $scope.constraints, function (data) {
            $scope.school = data.data;
        });
    };
    $scope.getOneSchoolById();
});
myApp.controller('EditSchoolCtrl', function ($scope, TemplateService, NavigationService, $timeout, toastr, $state, $stateParams) {
    //old school filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("editschool");
    $scope.menutitle = NavigationService.makeactive("Edit School");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();
    $scope.school = {};
    $scope.getOneSchoolById = function () {
        $scope.url = 'Registration/getOne';
        $scope.constraints = {};
        $scope.constraints._id = $stateParams.id;
        NavigationService.getOneOldSchoolById($scope.url, $scope.constraints, function (data) {
            $scope.school = data.data;
        });
    };
    $scope.getOneSchoolById();

    $scope.saveData = function (data) {
        console.log(" $scope.school", data);
        if (data) {
            $scope.url = "Registration/save";
            console.log(data);
            NavigationService.apiCall($scope.url, data, function (data) {
                console.log("data.value", data);
                if (data.value) {
                    toastr.success('Saved Successfully', 'Success Message');
                    $state.go('schoolpayustatus');
                } else {

                }

            });
        } else {
            toastr.error("Invalid Data", "Registration Details Message");
        }
    };
});
myApp.controller('SchoolpayustatuslCtrl', function ($scope, TemplateService, NavigationService, toastr, $timeout, $uibModal, excelService, $state, $stateParams) {
    //old school filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("tableschoolpayu");
    $scope.menutitle = NavigationService.makeactive("School PAYU Status");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();
    $scope.formData = {};
    $scope.formData.page = 1;
    $scope.formData.type = '';
    $scope.formData.keyword = '';
    $scope.changeInput = function () {
        $scope.filterSchool();
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
        $scope.url = "Registration/getSchoolPayuStatus";
        $scope.search = $scope.formData.keyword;
        $scope.formData.page = $scope.formData.page++;

        NavigationService.apiCall($scope.url, $scope.formData, function (data) {
            $scope.items = data.data.results;
            $scope.totalItems = data.data.total;
            $scope.maxRow = data.data.options.count;
        });
    };
    $scope.filterSchool();

    $scope.login = {};
    var navigationUrl;
    var filename = 'School';

    // LOGIN POPUP FOR PAYU
    $scope.jSchoolPayu = $.jStorage.get("isSchoolPayu");
    if ($.jStorage.get("isSchoolPayu") == null) {
        excelService.loginPayuPopup($scope);
    }


    $scope.submit = function (login) {
        console.log("immin");
        if (login) {
            excelService.submitPayuPopup(login, 'School', $state);
        }

    }

    $scope.logout = function () {
        $.jStorage.deleteKey("isSchoolPayu");
        toastr.success("Logout Successfully", 'Success Message');
        $state.reload();
    }
    //LOGIN POPUP FOR  PAYU END

    // INITIALISE VARIABLES END
    $scope.loginPopup = function (commonData, type) {
        if (type === 'excel') {
            navigationUrl = 'Registration/generateExcel';
        }
        console.log(commonData, "*********************");
        excelService.loginPopup(commonData, $scope, type);
    }
    $scope.loginSubmit = function (login) {
        console.log(login, "check")

        excelService.loginSubmit(login, navigationUrl, filename)

    }

    $scope.generateExcel = function (formData) {
        console.log("formdata", formData);
        NavigationService.generateSchoolExcelWithData(formData, function (data) {});
    }

    $scope.transferToWebsite = function (id) {
        console.log(id);
        $scope.constraints = {};
        $scope.constraints.schoolId = base64Service.encode(id);
        if (window.location.origin == 'http://mumbaischool.sfanow.in') {
            window.location = 'http://mumbaischool.sfanow.in/sports-selection/' + 'school/' + $scope.constraints.schoolId;
        } else if (window.location.origin == 'http://mumbaicollege.sfanow.in') {
            window.location = 'http://mumbaicollege.sfanow.in/sports-selection/' + 'school/' + $scope.constraints.schoolId;
        } else if (window.location.origin == 'http://hyderabadschool.sfanow.in') {
            window.location = 'http://hyderabadschool.sfanow.in/sports-selection/' + 'school/' + $scope.constraints.schoolId;
        } else if (window.location.origin == 'http://ahmedabadschool.sfanow.in') {
            window.location = 'http://ahmedabadschool.sfanow.in/sports-selection/' + 'school/' + $scope.constraints.schoolId;
        } else if (window.location.origin == 'http://hyderabadcollege.sfanow.in') {
            window.location = 'http://hyderabadcollege.sfanow.in/sports-selection/' + 'school/' + $scope.constraints.schoolId;
        } else if (window.location.origin == 'http://ahmedabadcollege.sfanow.in') {
            window.location = 'http://ahmedabadcollege.sfanow.in/sports-selection/' + 'school/' + $scope.constraints.schoolId;
        } else if (window.location.origin == 'http://testmumbaischool.sfanow.in') {
            window.location = 'http://testmumbaischool.sfanow.in/sports-selection/' + 'school/' + $scope.constraints.schoolId;
        } else if (window.location.origin == 'http://testhyderabadschool.sfanow.in') {
            window.location = 'http://testhyderabadschool.sfanow.in/sports-selection/' + 'school/' + $scope.constraints.schoolId;
        } else if (window.location.origin == 'http://testahmedabadschool.sfanow.in') {
            window.location = 'http://testahmedabadschool.sfanow.in/sports-selection/' + 'school/' + $scope.constraints.schoolId;
        } else if (window.location.origin == 'http://testmumbaicollege.sfanow.in') {
            window.location = 'http://testmumbaicollege.sfanow.in/sports-selection/' + 'school/' + $scope.constraints.schoolId;
        } else if (window.location.origin == 'http://testhyderabadcollege.sfanow.in') {
            window.location = 'http://testhyderabadcollege.sfanow.in/sports-selection/' + 'school/' + $scope.constraints.schoolId;
        } else if (window.location.origin == 'http://testahmedabadcollege.sfanow.in') {
            window.location = 'http://testahmedabadcollege.sfanow.in/sports-selection/' + 'school/' + $scope.constraints.schoolId;
        } else if (window.location.origin == 'http://localhost:8081') {
            window.location = 'http://localhost:8082/#/sports-selection/' + 'school/' + $scope.constraints.schoolId;
        }
    }



});

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
            $state.go("login");
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

    .controller('MultipleSelectCtrl', function ($scope, $window, TemplateService, NavigationService, $timeout, $state, $stateParams, $filter, toastr) {
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
            NavigationService[$scope.api]([$scope.url], dataSend, ++i, function (data) {
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


        $scope.search = {
            modelData: ""
        };

        $scope.listview = false;
        $scope.showCreate = false;
        $scope.typeselect = "";
        $scope.showList = function () {
            var areFiltersThere = true;
            var filter = {};
            if ($scope.filter) {
                filter = JSON.parse($scope.filter);
            }
            var filterName = {};
            if ($scope.filterName) {
                filterName = JSON.parse($scope.filterName);
            }

            function getName(word) {
                var name = filterName[word];
                if (_.isEmpty(name)) {
                    name = word;
                }
                return name;
            }

            if (filter) {
                _.each(filter, function (n, key) {
                    if (_.isEmpty(n)) {
                        areFiltersThere = false;
                        toastr.warning("Please enter " + getName(key));
                    }
                });
            }
            if (areFiltersThere) {
                $scope.listview = true;
                $scope.searchNew(true);
            }
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
        $scope.$watch('model', function (newVal, oldVal) {
            if ($scope.model) {
                if (_.isObject($scope.model)) {
                    $scope.sendData($scope.model._id, $scope.model.name);
                }
            }
        });
    })

    .controller('PageJsonCtrl', function ($scope, TemplateService, NavigationService, JsonService, $timeout, $state, $stateParams, $uibModal) {
        $scope.json = JsonService;
        $scope.template = TemplateService.changecontent("none");
        $scope.menutitle = NavigationService.makeactive("Country List");
        TemplateService.title = $scope.menutitle;
        $scope.navigation = NavigationService.getnav();


        JsonService.getJson($stateParams.id, function () {});
        globalfunction.confDel = function (callback) {
            // console.log($scope.json.json.action, "check this")
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'views/modal/conf-delete.html',
                size: 'md',
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
                templateUrl: 'views/modal/modal.html',
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
                $scope.getAllItems1();
            } else if (data.length == '') {
                $scope.formData.keyword = data;
                $scope.getAllItems1();
            }
        }

        $scope.getAllItems1 = function (keywordChange) {
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

        $scope.getAllItems = function (keywordChange) {
            $scope.totalItems = undefined;
            if (keywordChange) {
                $scope.currentPage = 1;
            }
            NavigationService.search($scope.json.json.apiCall.url, {
                    page: $scope.currentPage,
                    keyword: $scope.search.keyword,
                    input: ''
                }, ++i,
                function (data, ini) {
                    if (ini == i) {
                        $scope.items = data.data.results;
                        $scope.totalItems = data.data.total;
                        $scope.maxRow = data.data.options.count;
                    }
                });
        };

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
            // console.log('outside', formData);
            // if (formData.atheleteSchoolName) {
            //     delete formData.school;
            //     formData.school = undefined;
            // }
            // console.log('after change', formData);
            NavigationService.apiCall($scope.json.json.apiCall.url, formData, function (data) {
                // console.log('inside', data);
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
        //         templateUrl: '/views/modal/modal.html',
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

    .controller('LoginCtrl', function ($scope, TemplateService, LoginService, $http, $timeout, $stateParams, $state, toastr) {
        //Used to name the .html file

        TemplateService.title = $scope.menutitle;
        $scope.template = TemplateService;
        $scope.currentHost = window.location.origin;
        console.log("stateParams", $stateParams);
        if ($stateParams.id) {
            if ($stateParams.id === "AccessNotAvailable") {
                $state.go("noaccess");
            } else {
                console.log("Demo 1234");
                LoginService.parseAccessToken($stateParams.id, $stateParams.accessLevel, function () {
                    console.log("reached Herre");
                    LoginService.profile(function () {
                        $state.go("dashboard");
                    }, function () {
                        $state.go("login");
                    });
                });
            }
        } else {
            LoginService.removeAccessToken();
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

    .controller('RoundCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal) {
        //Used to name the .html file
        $scope.template = TemplateService.changecontent("tableround");
        $scope.menutitle = NavigationService.makeactive("Round List");
        TemplateService.title = $scope.menutitle;
        $scope.navigation = NavigationService.getnav();
        $scope.formData = {};
        $scope.formData.page = 1;
        $scope.formData.type = '';
        $scope.formData.keyword = '';

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

            $scope.url = "Round/search";
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
            // console.log(data);
            $scope.url = "Round/delete";
            $scope.constraints = {};
            $scope.constraints._id = data;
            NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
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

    .controller('DetailRoundCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
        //Used to name the .html file
        $scope.template = TemplateService.changecontent("detailround");
        $scope.menutitle = NavigationService.makeactive("Detail Round");
        TemplateService.title = $scope.menutitle;
        $scope.navigation = NavigationService.getnav();

        if ($stateParams.id) {
            $scope.getOneOldSchoolById = function () {
                $scope.url = 'Round/getOne';
                $scope.constraints = {};
                $scope.constraints._id = $stateParams.id;
                NavigationService.getOneOldSchoolById($scope.url, $scope.constraints, function (data) {
                    $scope.formData = data.data;
                });
            };
            $scope.getOneOldSchoolById();
        }

        $scope.saveData = function (data) {
            console.log("data", data);
            if (data) {
                $scope.url = "Round/save";
                NavigationService.apiCall($scope.url, data, function (data) {
                    console.log("data.value", data);
                    if (data.value) {
                        toastr.success(" Updated Successfully", "SportList Message");
                        $state.go('rounds');
                    }
                });
            } else {
                toastr.error("Invalid Data", "SportList Message");
            }
        };


    })

    .controller('ExcelUploadCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
        //Used to name the .html file
        $scope.template = TemplateService.changecontent("excel-upload");
        $scope.menutitle = NavigationService.makeactive("Excel Upload");
        TemplateService.title = $scope.menutitle;
        $scope.navigation = NavigationService.getnav();
        $scope.view = "views/excelImportView/" + $stateParams.view + ".html";
        // $scope.referenceFile = adminurl + "../importFormat/" + $stateParams.referenceFile + ".xlsx";
        $scope.form = {};
        $scope.url = $stateParams.controller + "/" + $stateParams.funcName;

        $scope.excelUploaded = function () {
            NavigationService.uploadExcel($scope.url, $scope.form, function (data) {
                $scope.data = data.data;
            });
        };
    })

    .controller('MatchesCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal) {
        //Used to name the .html file
        $scope.template = TemplateService.changecontent("tablematch");
        $scope.menutitle = NavigationService.makeactive("Matches");
        TemplateService.title = $scope.menutitle;
        $scope.navigation = NavigationService.getnav();
        $scope.formData = {};
        $scope.formData.page = 1;
        $scope.formData.type = '';
        $scope.formData.keyword = '';
        $scope.form = {};
        $scope.form.page = 1;
        $scope.form.type = '';
        $scope.form.keyword = '';
        $scope.form.graphics = "no";

        $scope.searchInTable = function (data) {
            $scope.form.page = 1;
            if (data.length >= 2) {
                $scope.form.keyword = data;
                $scope.viewTable();
            } else if (data.length == '') {
                $scope.form.keyword = data;
                $scope.viewTable();
            }
        }
        $scope.viewTable = function () {
            // console.log("data in table", formValue);
            $scope.url = "Match/getPerSport"
            // $scope.formData = formValue;
            $scope.form.page = $scope.form.page++;
            console.log("form......", $scope.form);
            NavigationService.apiCall($scope.url, $scope.form, function (data) {
                console.log("data.value search", data);
                $scope.items = data.data.results;
                $scope.totalItems = data.data.total;
                $scope.maxRow = data.data.options.count;
            });
        }
        // $scope.viewTable();


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
            // console.log(data);
            $scope.url = "Match/delete";
            $scope.constraints = {};
            $scope.constraints._id = data;
            NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
                if (data.value) {
                    toastr.success('Successfully Deleted', 'Age Group Message');
                    $scope.modalInstance.close();
                    $scope.viewTable();
                } else {
                    toastr.error('Something Went Wrong while Deleting', 'Age Group Message');
                }
            });
        }

        var modal;
        $scope.openExportExcel = function () {
            modal = $uibModal.open({
                animation: true,
                scope: $scope,
                backdrop: 'static',
                keyboard: false,
                templateUrl: 'views/modal/uploadMatches.html',
                size: 'lg',
                windowClass: 'backmodal'
            })
        }
        var modal;
        $scope.createExcel = function () {
            modal = $uibModal.open({
                animation: true,
                scope: $scope,
                backdrop: 'static',
                keyboard: false,
                templateUrl: 'views/modal/createexcel.html',
                size: 'lg',
                windowClass: 'backmodal'
            })
        }

        $scope.uploadExcelMatch = function (data) {
            $scope.url = "Match/uploadExcelMatch";
            $scope.constraints = {};
            $scope.constraints = data;
            console.log("form", $scope.constraints);
            NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
                console.log("data upload", data);
            });
        }

        $scope.updateExcelMatch = function (data) {
            $scope.url = "Match/updateExcelMatch";
            $scope.constraints = {};
            $scope.constraints = data;
            console.log("form", $scope.constraints);
            NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
                console.log("data upload", data);
            });
        }


        $scope.generateExcel = function (data) {
            $scope.qwerty = data;
            console.log("data..................", data);
            if (data.graphics == "yes") {
                $scope.url = "match/generateGraphicsExcel";
            } else {
                $scope.url = "match/generateExcel";
            }
            NavigationService.generateExcelWithData($scope.url, $scope.qwerty, function (data) {
                // console.log("............data", data);
                // $window.scrollTop(0);
                $state.reload();
            });
        }

        $scope.blankExcel = function (data) {
            $scope.blank = data;
            console.log("data..................", data);
            $scope.url = "match/generateBlankExcel";

            NavigationService.generateBlankExcelWithData($scope.url, $scope.blank, function (data) {
                $state.reload();
            });
        }

        $scope.weightUpload = function (data) {
            $scope.url = "Match/weightUpload";
            $scope.constraints = {};
            $scope.constraints = data;
            console.log("form", $scope.constraints);
            NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
                console.log("data upload", data);
            });
        }

        $scope.getAllSportList = function (data) {
            $scope.url = "SportsList/search";
            console.log(data);
            $scope.constraints = {};
            $scope.constraints.keyword = data;
            NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
                console.log("data.value sportlist", data);
                $scope.sportitems = data.data.results;

            });
        }

        $scope.searchSportList = function (data) {
            $scope.draws = data;
        }

        $scope.getAllAge = function (data) {
            $scope.url = "AgeGroup/search";
            console.log(data);
            $scope.constraints = {};
            $scope.constraints.keyword = data;
            NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
                console.log("data.value age", data);
                $scope.ageitems = data.data.results;

            });
        }

        $scope.searchAge = function (data) {
            $scope.draw = data;
        }

        $scope.getAllWeight = function (data) {
            $scope.url = "Weight/search";
            console.log(data);
            $scope.constraints = {};
            $scope.constraints.keyword = data;
            NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
                console.log("data.value weight", data);
                $scope.weightitems = data.data.results;

            });
        }

        $scope.searchWeight = function (data) {
            $scope.drawing = data;
        }

        $scope.viewMatch = function (data) {
            console.log(data);
            // $scope.showMatch = !$scope.showMatch;
            console.log($scope.form, "in view match")
            NavigationService.setDetail(data, function (data) {
                console.log('got it');
            });
            if ($scope.form.sportslist.sportsListSubCategory.isTeam) {
                console.log("in tema");
                // TEAM SPORTS PAGE
                $state.go('format-teamtable', {
                    type: data.sportslist.drawFormat.name
                })
            } else {
                // REMANING SPORT PAGE
                $state.go('format-table', {
                    type: data.sportslist.drawFormat.name
                });
            }


            $scope.viewTable(data);
        }

        // $scope.specificFormat = function (draw, matchid, team) {
        //     console.log("click")
        //     console.log(team)
        //     if (team == false) {
        //         console.log("team fasle")
        //         if (draw == "Combat Sports" || "Racquet Sports") {
        //             $state.go('detailplayer', {
        //                 id: matchid
        //             });
        //         } else {
        //             toastr.error("Something went wrong")
        //         }
        //     } else if (team == true) {
        //         if (draw == "Combat Sports" || "Racquet Sports") {
        //             $state.go('detailteam', {
        //                 id: matchid
        //             });
        //         } else {
        //             toastr.error("team error")
        //         }
        //     }
        // }


        $scope.genderList = [];

        $scope.genderList = [{
            name: 'Male'
        }, {
            name: 'Female'
        }]

        $scope.sporttypeList = [];

        $scope.ageList = [];


        $scope.weightList = [];

    })



    .controller('MedalsCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $uibModal, $state, toastr) {
        //Used to name the .html file
        $scope.template = TemplateService.changecontent("medal/tablemedal");
        $scope.menutitle = NavigationService.makeactive("Medal List");
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
            $scope.viewTable();
        };
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
            // $scope.url = "Medal/getAllMedals";
            $scope.url = "Medal/search";
            $scope.formData.page = $scope.formData.page++;
            NavigationService.apiCall($scope.url, $scope.formData, function (data) {
                console.log("data.value", data);
                if (data.value) {
                    $scope.items = data.data.results;
                    console.log(" $scope.items", $scope.items);
                    _.each($scope.items, function (key) {
                        console.log("key", key);
                        key.ageGroup = key.sport.ageGroup.name;
                        key.gender = key.sport.gender;
                        key.sportslist = key.sport.sportslist.name;
                        key.sportListSubCat = key.sport.sportslist.sportsListSubCategory.name;
                        if (key.sport.weight) {
                            key.weight = key.sport.weight.name;
                        }
                        if (key.sportListSubCat !== key.sportslist && key.ageGroup && key.gender) {
                            key.name = key.sportListSubCat + ' - ' + key.ageGroup + ' - ' + key.gender + ' - ' + key.sportslist;
                        }
                        if (key.sportListSubCat !== key.sportslist && key.weight && key.ageGroup && key.gender) {
                            key.name = key.sportListSubCat + ' - ' + key.ageGroup + ' - ' + key.gender + ' - ' + '(' + key.weight + ')' + ' - ' + key.sportslist;

                        }
                        if (key.sportListSubCat === key.sportslist && key.ageGroup && key.gender) {
                            key.name = key.sportListSubCat + ' - ' + key.ageGroup + ' - ' + key.gender;
                        }
                        if (key.sportListSubCat === key.sportslist && key.weight) {
                            key.name = key.sportListSubCat + ' - ' + key.ageGroup + ' - ' + key.gender + ' - ' + '(' + key.weight + ')';
                        }


                    })
                }

                $scope.totalItems = data.data.total;
                $scope.maxRow = data.data.options.count;
            });
        }
        $scope.viewTable();
        $scope.updateTable = function () {
            // $scope.url = "Medal/getAllMedals";
            $scope.url = "Result/getSchool";
            $scope.formData = '';
            NavigationService.apiCall($scope.url, $scope.formData, function (data) {
                console.log("Hi", data);
            });
        }
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
            $scope.url = "Medal/delete";
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
        $scope.generateExcel = function () {
            NavigationService.generateMedalExcel(function (data) {
                window.location.href = adminurl + 'Medal/generateExcel';
            });
        }
    })
    .controller('MediaCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $uibModal, $state, toastr) {
        //Used to name the .html file
        $scope.template = TemplateService.changecontent("galleria/media");
        $scope.menutitle = NavigationService.makeactive("Media List");
        TemplateService.title = $scope.menutitle;
        $scope.navigation = NavigationService.getnav();
        $scope.form = {};
        $scope.excelUploaded = function () {
            NavigationService.uploadExcel("Media/uploadExcel", $scope.form, function (data) {
                console.log(data);
                $scope.data = data.data;
                $scope.viewTable();
            });
        };

        $scope.generateExcel = function (press, sample) {
            $scope.url = "media/generateExcel";
            NavigationService.generateMediaExcel($scope.url, {
                'press': press
            }, function (data) {
                window.location.href = adminurl + $scope.url + "?press=" + press + "&sample=" + sample;
            });
        };
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
            $scope.url = "Media/search";
            $scope.formData.page = $scope.formData.page++;
            NavigationService.apiCall($scope.url, $scope.formData, function (data) {
                console.log("data.value", data);
                if (data.value) {
                    $scope.items = data.data.results;
                    $scope.totalItems = data.data.total;
                    $scope.maxRow = data.data.options.count;
                }


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
            $scope.url = "Media/delete";
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

        $scope.updateThumbnail = function () {
            NavigationService.updateThumbnail(function (data) {
                if (data.data.value) {
                    toastr.success('Thumbnails Updated Successfully', 'Success Message');
                } else {
                    toastr.error('Something went wrong', 'Error Message');
                }
            })
        }

    })
    .controller('DetailMedalCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
        //Used to name the .html file
        $scope.template = TemplateService.changecontent("medal/detailmedal");
        $scope.menutitle = NavigationService.makeactive("Medal Detail");
        TemplateService.title = $scope.menutitle;
        $scope.navigation = NavigationService.getnav();
        $scope.studentTeam = [];
        $scope.filterObj = {};
        $scope.medalInfoForm = {};
        $scope.medalInfoForm.studentTeam = [];;
        $scope.medalInfoForm.school = [];
        $scope.medalTypeArr = ['gold', 'silver', 'bronze'];
        $scope.genderList = ['male', 'female', 'both'];

        $scope.onCancel = function (sendTo) {
            $state.go(sendTo);
        }

        if ($stateParams.id != '') {
            $scope.title = "Edit";
            $scope.setDisabled = true;
            $scope.getOneOldSchoolById = function () {
                $scope.url = "Medal/getOneMedal";
                $scope.constraints = {};
                $scope.constraints._id = $stateParams.id;
                NavigationService.getOneOldSchoolById($scope.url, $scope.constraints, function (data) {
                    $scope.medalInfoForm = data.data;
                    if ($scope.medalInfoForm.team.length > 0) {
                        _.each($scope.medalInfoForm.team, function (team, index) {
                            $scope.medalInfoForm.school[index].uniqueId = team._id;
                            team.fullName = team.teamId + ' - ' + team.schoolName
                        })
                        $scope.showTeams = true;
                        $scope.showAthletes = false;
                        console.log(" $scope.medalForm", $scope.medalInfoForm);
                        _.each($scope.medalInfoForm.team, function (key) {
                            _.each(key.studentTeam, function (value) {
                                $scope.studentTeam.push(value);
                            })
                        })

                        _.each($scope.studentTeam, function (val) {
                            if (val.studentId.middleName) {
                                val.fullName = val.studentId.sfaId + '-' + val.studentId.firstName + ' ' + val.studentId.middleName + ' ' + val.studentId.surname
                            } else {
                                val.fullName = val.studentId.sfaId + '-' + val.studentId.firstName + ' ' + val.studentId.surname
                            }
                        });
                        $scope.medalInfoForm.studentTeam = _.cloneDeep($scope.studentTeam);


                    } else {
                        $scope.showTeams = false;
                        $scope.showAthletes = true;
                        _.each($scope.medalInfoForm.player, function (athelete, index) {
                            $scope.medalInfoForm.school[index].uniqueId = athelete._id;
                            if (athelete.athleteId !== null) {
                                if (athelete.middleName != null || athelete.middleName != undefined) {
                                    athelete.fullName = athelete.sfaId + ' - ' + athelete.firstName + ' ' + athelete.middleName + ' ' + athelete.surname;
                                } else {
                                    if (!athelete.middleName) {
                                        athelete.fullName = athelete.sfaId + ' - ' + athelete.firstName + ' ' + athelete.surname;
                                    }

                                }
                            }

                        })

                    }

                    $scope.editMedalInfoObj = {};
                    $scope.editMedalInfoObj.medalId = $stateParams.id;
                    if ($scope.medalInfoForm.weight) {
                        $scope.editMedalInfoObj.weight = $scope.medalInfoForm.weight._id;
                    }

                    $scope.editMedalInfoObj.ageGroup = $scope.medalInfoForm.ageGroup._id;
                    $scope.editMedalInfoObj.gender = $scope.medalInfoForm.gender;
                    $scope.editMedalInfoObj.sportslist = $scope.medalInfoForm.sportslist._id;
                    $scope.editMedalInfoObj.medalType = $scope.medalInfoForm.medalType;

                    NavigationService.getTeamsAthletesBySport($scope.editMedalInfoObj, function (data) {
                        console.log(" $scope.editMedalInfoObj", $scope.editMedalInfoObj);
                        console.log(data, "In Edit Function");
                        if (data.data.value) {
                            if (data.data.data.allow === false) {
                                $scope.disableSave = true;
                                toastr.error('This sport has already been added', 'Error Message');
                            } else {
                                $scope.disableSave = false;
                            }
                            if (data.data.data.teams && data.data.data.teams.length > 0) {
                                $scope.showTeams = true;
                                $scope.showAthletes = false;
                                $scope.allTeams = data.data.data.teams;

                                _.each($scope.allTeams, function (team) {
                                    team.fullName = team.teamId + ' - ' + team.schoolName
                                })

                                // for reamoving duplicate records in $scope.allTeams
                                // _.each($scope.medalInfoForm.team, function (key) {
                                //     if (key._id) {
                                //         _.remove($scope.allTeams, function (n) {
                                //             return n._id === key._id;
                                //         });
                                //     }

                                // })


                            } else if (data.data.data.athletes && data.data.data.athletes.length > 0) {
                                $scope.showAthletes = true;
                                $scope.showTeams = false;
                                $scope.allAtheletes = data.data.data.athletes;
                                _.each($scope.allAtheletes, function (athelete) {
                                    if (athelete.athleteId !== null) {
                                        if (athelete.athleteId.middleName != null || athelete.athleteId.middleName != undefined) {
                                            athelete.fullName = athelete.athleteId.sfaId + ' - ' + athelete.athleteId.firstName + ' ' + athelete.athleteId.middleName + ' ' + athelete.athleteId.surname;
                                        } else {
                                            if (!athelete.athleteId.middleName) {
                                                athelete.fullName = athelete.athleteId.sfaId + ' - ' + athelete.athleteId.firstName + ' ' + athelete.athleteId.surname;
                                            }

                                        }
                                    }

                                })
                                console.log("  $scope.$scope.allAtheletes ", $scope.allAtheletes);
                            }
                        }
                    })


                });
            };
            $scope.getOneOldSchoolById();
            $scope.saveData = function (data) {
                if (data) {
                    $scope.url = "Medal/saveMedal";
                    NavigationService.apiCall($scope.url, data, function (data) {
                        console.log("data.value", data);
                        if (data.data.nModified == '1') {
                            toastr.success(" Updated Successfully", "SportList Message");
                            $state.go('medals');
                        }

                    });
                } else {
                    toastr.error("Invalid Data", "SportList Message");
                }
            };
            $scope.removeSchool = function (item) {
                console.log(item, "item");
                if (item) {
                    if (item.atheleteID) {
                        var findIndex = _.findIndex($scope.medalInfoForm.school, {
                            'uniqueId': item._id
                        });
                        console.log(findIndex, "findIndex");
                        $scope.medalInfoForm.school.splice(findIndex, 1);
                    } else if (!item.atheleteID) {
                        var findIndex = _.findIndex($scope.medalInfoForm.school, {
                            'uniqueId': item._id
                        });
                        console.log(findIndex, "findIndex");
                        $scope.medalInfoForm.school.splice(findIndex, 1);
                    }
                }
                if (item._id) {
                    _.remove($scope.medalInfoForm.studentTeam, function (n) {
                        return n.teamId === item._id;
                    });

                }

            }

        } else {
            $scope.title = 'Create';
            $scope.setDisabled = false;
            $scope.saveData = function (data) {
                if (data) {
                    if (!_.isEmpty(data)) {
                        $scope.url = "Medal/saveMedal";
                        console.log(data);
                        NavigationService.apiCall($scope.url, data, function (data) {
                            console.log("data.value", data);
                            if (data.value === true) {
                                toastr.success(" Saved Successfully", "MedalList Message");
                                $state.go('medals');

                            } else {
                                toastr.error("Please enter all fields", 'MedalList Message')
                                if (data.error === "No Data Found") {
                                    toastr.error("No data found", 'Error Message');
                                }
                            }
                        });
                    } else {
                        toastr.error("Please enter all fields", 'MedalList Message')
                    }
                } else {
                    toastr.error("Invalid Data", "MedalList Message");
                }
            };



        }




        //for getting AllSpotsList
        $scope.getAllSpotsList = function (data) {
            $scope.constraints = {};
            $scope.constraints.keyword = data;
            NavigationService.getAllSpotsList($scope.constraints, function (allData) {
                if (allData.value) {
                    $scope.sportList = allData.data.results;
                }
            });
        }
        $scope.getAllSpotsList();
        // for getting AllAgeGroups
        NavigationService.getAllAgeGroups(function (allData) {
            if (allData.data.value) {
                $scope.ageGroups = allData.data.data;
            }
        });
        //for getting All Weights
        NavigationService.getAllWeights(function (data) {
            if (data.data.value) {
                $scope.allWeights = data.data.data;
            }
        });
        //function to be called for displaying student team
        $scope.getStudentTeam = function (item) {
            console.log("item", item);
            _.each(item.studentTeam, function (val) {
                if (val.studentId.middleName) {
                    val.fullName = val.studentId.firstName + ' ' + val.studentId.middleName + ' ' + val.studentId.surname
                } else {
                    val.fullName = val.studentId.firstName + ' ' + val.studentId.surname
                }
                $scope.medalInfoForm.studentTeam.push(val);
            });

        }
        //fn to be call for getting schoolName
        $scope.getSchoolNameFun = function (constraintsObj, url, uniqueId) {
            NavigationService.getOneSchool(constraintsObj, url, function (data) {
                if (data.data.value) {
                    console.log(data.data.data, "data");
                    $scope.schoolInfo = {};
                    $scope.schoolInfo.schoolId = data.data.data._id;
                    $scope.schoolInfo.schoolName = data.data.data.schoolName;
                    $scope.schoolInfo.uniqueId = uniqueId;
                    if (!data.data.data.schoolName) {
                        $scope.schoolInfo.schoolName = data.data.data.name;
                    }
                    $scope.medalInfoForm.school.push($scope.schoolInfo);

                    console.log("$scope.schoolList", $scope.medalInfoForm.school);
                }
            })
        }
        //start of getSchoolName() function
        $scope.getSchoolName = function (schoolId) {
            console.log(schoolId, "schoolId");
            $scope.constraintsObj = {};
            if (!schoolId.teamId) {
                if (schoolId.athleteId.atheleteSchoolName || schoolId.athleteId.school) {
                    if (!_.isEmpty(schoolId.athleteId.atheleteSchoolName)) {
                        console.log("schoolId.atheleteSchoolName", schoolId);
                        $scope.tempObj = {};
                        $scope.tempObj.uniqueId = schoolId.athleteId._id;
                        $scope.tempObj.schoolName = schoolId.athleteId.atheleteSchoolName;
                        $scope.medalInfoForm.school.push($scope.tempObj);
                        console.log($scope.medalInfoForm.school, "  $scope.medalInfoForm.school");
                    } else {
                        $scope.urlTosend = 'school/getOne';
                        if (!_.isEmpty(schoolId.athleteId.school)) {
                            $scope.constraintsObj._id = schoolId.athleteId.school;
                            $scope.getSchoolNameFun($scope.constraintsObj, $scope.urlTosend, schoolId.athleteId._id);
                        }
                    }

                }
            } else {
                //for team 
                if (schoolId.school) {
                    $scope.urlTosend = 'registration/getOne'
                    $scope.constraintsObj._id = schoolId.school;
                    $scope.getSchoolNameFun($scope.constraintsObj, $scope.urlTosend, schoolId._id);
                } else {
                    $scope.schoolInfo = {};
                    $scope.schoolInfo.schoolName = schoolId.schoolName;
                    $scope.schoolInfo.uniqueId = schoolId._id;
                    $scope.medalInfoForm.school.push($scope.schoolInfo);
                }
            }


        }

        //End  of getSchoolName() function

        //for getting allAtheletes or allTeams

        $scope.selectSport = function (type, id) {
            $scope.allTeams = [];
            $scope.allAtheletes = [];
            if (type === 'sportName') {
                $scope.filterObj.sportslist = id;
            } else if (type === 'gender') {
                $scope.filterObj.gender = id;
            } else if (type === 'weight') {
                $scope.filterObj.weight = id;
            } else if (type === 'ageGroup') {
                $scope.filterObj.ageGroup = id;
            } else if (type === 'medalType') {
                $scope.filterObj.medalType = id;
            }

            if ($scope.filterObj.sportslist && $scope.filterObj.gender && $scope.filterObj.ageGroup || $scope.filterObj.weight) {
                console.log($scope.filterObj, " $scope.filterObj");
                NavigationService.getTeamsAthletesBySport($scope.filterObj, function (data) {
                    console.log(data, "data");
                    if (data.data.value) {
                        console.log("dataaaaaaa", data.data);
                        if (data.data.data === 'No Data Found') {
                            $scope.disableSave = true;
                        }

                        if (data.data.data.allow === false) {
                            $scope.disableSave = true;
                            toastr.error('This sport has already been added', 'Error Message');
                        }

                        if (data.data.data.teams && data.data.data.teams.length > 0) {
                            $scope.showTeams = true;
                            $scope.showAthletes = false;
                            $scope.allTeams = data.data.data.teams;
                            _.each($scope.allTeams, function (team) {
                                team.fullName = team.teamId + ' - ' + team.schoolName
                            })
                            console.log("  $scope.allTeams  ", $scope.allTeams);
                        } else if (data.data.data.athletes && data.data.data.athletes.length > 0) {
                            $scope.showAthletes = true;
                            $scope.showTeams = false;
                            $scope.allAtheletes = data.data.data.athletes;
                            if (!_.isEmpty($scope.filterObj.weight) && data.data.data.athletes === 0) {
                                $scope.disableSave = true;
                            } else {
                                $scope.disableSave = false;
                            }
                            _.each($scope.allAtheletes, function (athelete) {
                                if (athelete.athleteId !== null) {
                                    if (athelete.athleteId.middleName != null || athelete.athleteId.middleName != undefined) {
                                        athelete.fullName = athelete.athleteId.sfaId + ' - ' + athelete.athleteId.firstName + ' ' + athelete.athleteId.middleName + ' ' + athelete.athleteId.surname;
                                    } else {
                                        if (!athelete.athleteId.middleName) {
                                            athelete.fullName = athelete.athleteId.sfaId + ' - ' + athelete.athleteId.firstName + ' ' + athelete.athleteId.surname;
                                        }

                                    }
                                }

                            })
                            console.log("  $scope.$scope.allAtheletes ", $scope.allAtheletes);
                        }
                    }
                })
            }
        }


        $scope.removeSchool = function (item) {
            console.log(item, "item");
            if (item) {
                if (item.athleteId) {
                    var findIndex = _.findIndex($scope.medalInfoForm.school, {
                        'uniqueId': item.athleteId._id
                    });
                    console.log(findIndex, "findIndex");
                    $scope.medalInfoForm.school.splice(findIndex, 1);
                } else if (!item.athleteId) {
                    console.log("$scope.medalInfoForm.school before", $scope.medalInfoForm.school);
                    var findIndex = _.findIndex($scope.medalInfoForm.school, {
                        'uniqueId': item._id
                    });
                    $scope.medalInfoForm.school.splice(findIndex, 1);

                }
            }
            if (item._id) {
                _.remove($scope.medalInfoForm.studentTeam, function (n) {
                    return n.teamId === item._id;
                });

            }

        }
    })

    .controller('GalleryCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, $uibModal, toastr) {
        //Used to name the .html file
        $scope.template = TemplateService.changecontent("galleria/tablegallery");
        $scope.menutitle = NavigationService.makeactive("Gallery");
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
            $scope.viewTable();
        };
        $scope.formData = {};
        $scope.formData.page = 1;
        $scope.formData.type = '';
        $scope.formData.keyword = '';
        // $scope.selectedStatus = 'All';
        // CONFIG DETAIL
        $scope.getDetailConfig = function () {
            NavigationService.getDetailConfig(function (data) {
                console.log(data, "config data");
                $scope.year = data.data.data.year;
                console.log($scope.year, "year");

            })
        }
        $scope.getDetailConfig();
        // CONFIG DETAIL END
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
            $scope.url = "gallery/search";
            $scope.formData.page = $scope.formData.page++;
            NavigationService.apiCall($scope.url, $scope.formData, function (data) {
                console.log("data.value", data);
                if (data.value) {
                    $scope.items = data.data.results;
                    _.each($scope.items, function (key) {
                        key.imageArray = _.split(key.mediaLink, '/');
                        key.image = key.imageArray[key.imageArray.length - 1];
                        console.log(key.image, "key");
                    })
                    console.log($scope.items, "at the end");
                }

                $scope.totalItems = data.data.total;
                $scope.maxRow = data.data.options.count;
            });
        }
        $scope.viewTable();

        $scope.confDel = function (type, name, image) {
            $scope.type = type;
            $scope.name = name;
            $scope.image = image;
            console.log(type, name, image, "click modal");
            $scope.modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'views/modal/folderdelete.html',
                backdrop: 'static',
                keyboard: false,
                size: 'sm',
                scope: $scope

            });
        };

        $scope.noDelete = function () {
            $scope.modalInstance.close();
        }
        $scope.delete = function (type, name, image) {
                console.log(type, name, image);
                $scope.url = "Vimeo/deleteFolderImage";
                $scope.constraints = {};
                $scope.constraints.prefix = $scope.year + '/' + type + '/' + name;
                $scope.constraints.fileName = image;
                console.log($scope.constraints, "check this")
                NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
                    console.log("data.value", data);
                    if (data.value) {
                        toastr.success('Successfully Deleted', 'Gallery Meaasge');
                        $scope.modalInstance.close();
                        $scope.viewTable();
                    } else {
                        toastr.error('Something went wrong while Deleting', 'Gallery Meaasge');
                    }

                });
            },
            $scope.filterAthlete = function (formData) {
                console.log("formData", formData);
                $scope.url = "gallery/search";
                $scope.formData.filter = {};
                $scope.formData.page = $scope.formData.page++;
                if (formData.type == 'title') {
                    $scope.formData.filter.title = {};
                    $scope.formData.filter.title.$regex = formData.input;
                    $scope.formData.filter.title.$options = "i";
                } else if (formData.type == 'Folder Name') {
                    $scope.formData.filter.folderName = {}
                    $scope.formData.filter.folderName.$regex = formData.input;
                    $scope.formData.filter.folderName.$options = "i";
                } else if (formData.type == 'Folder Type') {
                    $scope.formData.filter.folderType = {};
                    $scope.formData.filter.folderType.$regex = formData.input;
                    $scope.formData.filter.folderType.$options = "i";
                }
                NavigationService.apiCall($scope.url, $scope.formData, function (data) {
                    $scope.items = data.data.results;
                    $scope.totalItems = data.data.total;
                    $scope.maxRow = data.data.options.count;
                });

            };



        $scope.setThumbnail = function (name, link, value, id) {
            console.log(value, "value");
            $scope.url = "Gallery/setThumbnail";
            $scope.constraintsObj = {}
            $scope.constraintsObj._id = id;
            $scope.constraintsObj.folderName = name;
            $scope.constraintsObj.thumbnail = link;
            console.log($scope.constraintsObj, "data for setthumbnail");
            if (value) {
                $scope.constraintsObj.isThumbnail = true;

            } else {
                $scope.constraintsObj.isThumbnail = false;

            }
            NavigationService.apiCall($scope.url, $scope.constraintsObj, function (data) {
                if (data.value) {
                    $scope.viewTable();
                }
            })

        }

        // SET THUMBNAIL END

    })

    .controller('DetailGalleryCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
        //Used to name the .html file
        $scope.template = TemplateService.changecontent("galleria/gallerydetail");
        $scope.menutitle = NavigationService.makeactive("Gallery Detail");
        TemplateService.title = $scope.menutitle;
        $scope.navigation = NavigationService.getnav();
        $scope.formData = {};
        $scope.getFolderNames = function (formData, flag) {
            if (flag) {
                $scope.formData.folderName = '';
            }
            NavigationService.getAllFolderNameCloud(formData, function (data) {
                if (data.data.value) {
                    console.log("data.data", data.data);
                    $scope.folderNames = data.data.data;
                }
            })
        };



        $scope.title = "Create";
        $scope.saveData = function (data) {
            if (data) {
                $scope.url = "vimeo/getFilesPerFolder";
                console.log(data);
                NavigationService.apiCall($scope.url, data, function (data) {
                    console.log("data.value", data);
                    if (data.value === true && data.data[0].errors) {
                        toastr.error("Folder Name Already Exists");
                    } else if (data.value === true && data.data === 'Saved Successfully') {
                        toastr.success("Saved Successfully", 'Success Message');
                        $state.go('gallery');
                    }
                });
            } else {
                toastr.error("Invalid Data", "Gallery Details Message");
            }
        };


        $scope.onCancel = function (sendTo) {
            $state.go(sendTo);
        }
    })

//Certificate Banner

myApp.controller('CertificateBannerCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, $uibModal, toastr) {
    //registration filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("other/certificate/tablecertificatebanner");
    $scope.menutitle = NavigationService.makeactive("Certificate Banner");
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
        $scope.url = "CertificateBanner/search";
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
            templateUrl: "views/modal/delete.html",
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
        $scope.url = "CertificateBanner/delete";
        $scope.constraints = {};
        $scope.constraints._id = data;
        NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
            console.log(data.value);
            if (data.value) {
                toastr.success('Successfully Deleted', 'Certificate Banner Meaasge');
                $scope.modalInstance.close();
                $scope.viewTable();
            } else {
                toastr.error('Something went wrong', 'Certificate Banner Message');
            }
        });
    }

});

//Detail Certificate Banner
myApp.controller('DetailCertificateBannerCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, toastr) {
    //registration filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("other/certificate/detailcertificatebanner");
    $scope.menutitle = NavigationService.makeactive("Detail Certificate Banner");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();

    if ($stateParams.id != '') {
        $scope.title = "Edit";
        $scope.getOneOldSchoolById = function () {
            $scope.url = "CertificateBanner/getOne";
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

                $scope.url = "CertificateBanner/save";
                NavigationService.apiCall($scope.url, data, function (data) {
                    console.log("data.value", data);
                    if (data.data.nModified == '1') {
                        toastr.success(" Updated Successfully", "Certificate Banner Message");
                        $state.go('certificatebanner');

                    }

                });
            } else {
                toastr.error("Invalid Data", "Certificate Banner Message");
            }
        };


    } else {
        $scope.title = "Create";
        $scope.saveData = function (data) {

            if (data) {

                $scope.url = "CertificateBanner/save";
                NavigationService.apiCall($scope.url, data, function (data) {
                    console.log("data.value", data);
                    if (data.value === true) {
                        toastr.success(" Saved Successfully", "Certificate Banner Message");
                        $state.go('certificatebanner');

                    }

                });
            } else {
                toastr.error("Invalid Data", "Certificate Banner Message");
            }
        };

    }



    $scope.onCancel = function (sendTo) {
        $state.go(sendTo);
    }


});

//Certificate Details

myApp.controller('CertificateDetailsCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, $uibModal, toastr) {
    //registration filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("other/certificate/tablecertificatedetails");
    $scope.menutitle = NavigationService.makeactive("Certificate Details");
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
        $scope.url = "CertificateDetails/search";
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
            templateUrl: "views/modal/delete.html",
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
        $scope.url = "CertificateDetails/delete";
        $scope.constraints = {};
        $scope.constraints._id = data;
        NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
            console.log(data.value);
            if (data.value) {
                toastr.success('Successfully Deleted', 'Certificate Details Meaasge');
                $scope.modalInstance.close();
                $scope.viewTable();
            } else {
                toastr.error('Something went wrong', 'Certificate Details Message');
            }
        });
    }

});

//Detail Certificate Details
myApp.controller('DetailCertificateDetailsCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state, $stateParams, toastr) {
    //registration filter view
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("other/certificate/detailcertificatedetails");
    $scope.menutitle = NavigationService.makeactive("Detail Certificate Details");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();

    if ($stateParams.id != '') {
        $scope.title = "Edit";
        $scope.getOneOldSchoolById = function () {
            $scope.url = "CertificateDetails/getOne";
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
                $scope.url = "CertificateDetails/save";
                NavigationService.apiCall($scope.url, data, function (data) {
                    console.log("data.value", data);
                    if (data.data.nModified == '1') {
                        toastr.success(" Updated Successfully", "Certificate Details Message");
                        $state.go('certificatedetails');

                    }

                });
            } else {
                toastr.error("Invalid Data", "Certificate Details Message");
            }
        };


    } else {
        $scope.title = "Create";
        $scope.saveData = function (data) {

            if (data) {

                $scope.url = "CertificateDetails/save";
                console.log(data);
                NavigationService.apiCall($scope.url, data, function (data) {
                    console.log("data.value", data);
                    if (data.value === true) {
                        toastr.success(" Saved Successfully", "Certificate Details Message");
                        $state.go('certificatedetails');

                    }

                });
            } else {
                toastr.error("Invalid Data", "Certificate Details Message");
            }
        };

    }

    $scope.getAllSportListSubCategory = function (data) {
        console.log(data);
        $scope.url = "SportsListSubCategory/search";
        $scope.constraints = {};
        $scope.constraints.keyword = data;
        NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
            console.log("data.value", data);
            $scope.sportstypeitems = data.data.results;
        });
    }
    $scope.searchSportListSubCategory = function (data) {
        console.log(data);
        $scope.sportlistsubcategory = data._id;
    }

    $scope.onCancel = function (sendTo) {
        $state.go(sendTo);
    }


});

myApp.controller('AdditionalPaymentCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr, $uibModal) {
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("tableadditionalpayment");
    $scope.menutitle = NavigationService.makeactive("Additional Payment List");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();
    $scope.formData = {};
    $scope.formData.page = 1;
    $scope.formData.type = '';
    $scope.formData.keyword = '';

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

        $scope.url = "AdditionalPayment/filter";
        // $scope.search = $scope.formData.keyword;
        $scope.formData.page = $scope.formData.page++;
        NavigationService.apiCall($scope.url, $scope.formData, function (data) {
            // console.log("data.value", data);
            $scope.items = data.data.results;
            _.each($scope.items, function (n) {
                // console.log('N', n);
                if (n.athleteId) {
                    if (n.athleteId.middleName) {
                        n.athleteName = n.athleteId.firstName + ' ' + n.athleteId.middleName + ' ' + n.athleteId.surname;
                    } else {
                        n.athleteName = n.athleteId.firstName + ' ' + n.athleteId.surname;
                    }
                    n.sfaId = n.athleteId.sfaId;
                }
            });
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
        // console.log(data);
        $scope.url = "AdditionalPayment/delete";
        $scope.constraints = {};
        $scope.constraints._id = data;
        NavigationService.apiCall($scope.url, $scope.constraints, function (data) {
            if (data.value) {
                toastr.success('Successfully Deleted', 'Additional Payment Message');
                $scope.modalInstance.close();
                $scope.viewTable();
            } else {
                toastr.error('Something Went Wrong while Deleting', 'Additional Payment Message');
            }
        });
    }

    $scope.generateExcel = function () {
        NavigationService.generateAdditionalPaymentExcel(function (data) {
            window.location.href = adminurl + 'AdditionalPayment/generateExcel';
        });
    }

});

myApp.controller('DetailAdditionalPaymentCtrl', function ($scope, TemplateService, NavigationService, $timeout, $stateParams, $state, toastr) {
    //Used to name the .html file
    $scope.template = TemplateService.changecontent("detailadditionalpayment");
    $scope.menutitle = NavigationService.makeactive("Detail Additional Payment");
    TemplateService.title = $scope.menutitle;
    $scope.navigation = NavigationService.getnav();

    if ($stateParams.id) {
        $scope.getOneOldSchoolById = function () {
            $scope.url = 'AdditionalPayment/getOne';
            $scope.constraints = {};
            $scope.constraints._id = $stateParams.id;
            NavigationService.getOneOldSchoolById($scope.url, $scope.constraints, function (data) {
                $scope.formData = data.data;
                if (data.data.athleteId.middleName) {
                    $scope.formData.athleteName = data.data.athleteId.firstName + ' ' + data.data.athleteId.middleName + ' ' + data.data.athleteId.surname;
                } else {
                    $scope.formData.athleteName = data.data.athleteId.firstName + ' ' + data.data.athleteId.surname;
                }
                $scope.formData.sfaId = data.data.athleteId.sfaId;
                $scope.formData.email = data.data.athleteId.email;
            });
        };
        $scope.getOneOldSchoolById();
    }

    $scope.saveData = function (data) {
        console.log("data", data);
        if (data) {
            $scope.url = "AdditionalPayment/save";
            NavigationService.apiCall($scope.url, data, function (data) {
                console.log("data.value", data);
                if (data.value) {
                    toastr.success(" Updated Successfully", "SportList Message");
                    $state.go('additional-payment');
                }
            });
        } else {
            toastr.error("Invalid Data", "SportList Message");
        }
    };


});

myApp.controller('DashboardCtrl', function ($scope, TemplateService, NavigationService, $timeout, $state) {
        //Used to name the .html file
        $scope.template = TemplateService.changecontent("dashboard");
        $scope.menutitle = NavigationService.makeactive("Dashboard");
        TemplateService.title = $scope.menutitle;
        $scope.navigation = NavigationService.getnav();



        // $state.reload();


        $scope.generateExcel = function () {
            $scope.url = "match/getUniqueEventsPlayed";
            NavigationService.generateExcel($scope.url, function (data) {
                window.location.href = adminurl + $scope.url;
            });
        }
    })

    .controller('headerctrl', function ($scope, TemplateService, $uibModal, $rootScope, $location, $state) {
        $scope.template = TemplateService;


        $rootScope.$watch(function () {
            return $location.path()
        }, function (newLocation, oldLocation) {
            if ($rootScope.actualLocation === newLocation) {
                $state.go("login");
            }
        });
        $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            $(window).scrollTop(0);
        });

        var index;
        var probhitUrls = [];
        var allowedUrls = [];
        var accessLevel = $.jStorage.get("accessLevel");
        var currentPath = $location.path();
        currentPath = _.split(currentPath, '/')[1];

        console.log("currentPath", currentPath);
        switch (accessLevel) {
            case "Super Admin":
                break;

            case "Admin":
                probhitUrls = ["users"];
                index = probhitUrls.indexOf(currentPath);

                if (index != -1) {
                    $state.go('dashboard');
                }

                if ($.jStorage.get('athleteOps') && currentPath !== 'viewAthlete' && currentPath !== 'athleteOps') {
                    $.jStorage.set('athleteOps', null);
                }

                if ($.jStorage.get('schoolOps') && currentPath !== 'viewSchool' && currentPath !== 'schoolOps') {
                    $.jStorage.set('schoolOps', null);
                }

                break;

            case "Sports Ops":
                var allowedUrls = ["schoolOps", "athleteOps", "viewSchool", "viewAthlete"];
                index = allowedUrls.indexOf(currentPath);
                if (index == -1) {
                    $state.go('dashboard');
                }
                break;

            case "Accounts":
                var allowedUrls = ["schoolOps", "athleteOps", "viewSchool", "viewAthlete", "athleteaccount", "schoolaccount"];
                index = allowedUrls.indexOf(currentPath);
                if (index == -1) {
                    $state.go('dashboard');
                }
                break;
        }

        $scope.logout = function () {
            if (accessLevel == 'Sports Ops' || accessLevel == 'Accounts') {
                $.jStorage.set('athleteOps', null);
                $.jStorage.set('schoolOps', null);
                $state.go("login");
            } else {
                $state.go("login");
            }
        }
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