myApp.service('selectService', function ($http, TemplateService, $state, toastr, NavigationService, loginService, errorService) {
    this.team = [];
    this.detail = null;
    this.sportsId = null; // Req in api For sending data at backend eg:5864..69
    this.gender = null; // fOR confirm-team
    this.ageGroup = null; // for confirm-team eg:U-12, U-8
    this.redirectTo = null; // not in used now
    this.sportName = null; // for biforcating columns based on sportName
    this.sportType = null; // eg:F,K,AAS,ST,I
    this.isValidForm = true;
    this.showMissingFields = false;
    this.disableNextOnRules = false;

    this.initialFun = function () {
        loginService.loginGet(function (data) {
            detail = data;
        });
        if (detail.userType === 'athlete') {
            this.gender = detail.gender;
        } else {
            this.gender = 'male';
        }
    };

    this.setBasicSportDetails = function (formData, callback) {
        $http({
            url: adminUrl2 + 'SportsListSubCategory/getSportsDeails',
            method: 'POST',
            data: formData
        }).then(function (data) {
            if (data.data.value) {
                callback(data.data.data);
            } else {
                console.log(data);
            }
        });
    };

    //make .checked to true if already selected
    this.isAtheleteSelected = function (listOfAthlete, team) {
        var temp = _.intersectionBy(listOfAthlete, this.team, '_id');
        _.each(temp, function (n) {
            n.checked = true;
        });
        return listOfAthlete;
    };



    // push to Team
    this.pushToTeam = function (obj, bool, listOfAthlete, events) {
        console.log(obj, bool, listOfAthlete, events);

        function checkIfApplicable(sT, sN) {
            var isApplicable = true;
            switch (sT) {
                case "K":
                    if (obj.eventKata.length <= 1 && obj.eventKumite.length <= 1) {
                        obj.checked = false;
                        toastr.error("Not Applicable");
                        isApplicable = false;
                    }
                    break;
                case "FA":
                    console.log(obj);
                    if (sN == 'Fencing') {
                        if (obj.eventEpee.length <= 1 && obj.eventSabre.length <= 1 && obj.eventFoil.length <= 1) {
                            obj.checked = false;
                            toastr.error("Not Applicable");
                            isApplicable = false;
                        }
                    } else if (sN == 'Archery') {
                        if (obj.ageGroups.length == 0) {
                            obj.checked = false;
                            toastr.error("Not Applicable");
                            isApplicable = false;
                        }
                    }
                    break;
                case "AAS":
                    if (obj.ageGroups.length == 0) {
                        obj.checked = false;
                        toastr.error("Not Applicable");
                        isApplicable = false;
                    }
                    break;
                case "I":
                    if (obj.ageGroups.length == 0) {
                        obj.checked = false;
                        toastr.error("Not Applicable");
                        isApplicable = false;
                    }
                    break;
                case "CT":
                    break;
            }
            return isApplicable;
        }

        var confirmPageKey = $.jStorage.get("confirmPageKey");
        //check if added or not and do it accordingly
        if (bool) {
            //add athelete
            if (obj.isTeamSelected) {
                toastr.error('This Player has already been Selected');
            } else if (obj.isIndividualSelected) {
                toastr.error('This Player has already been Registered');
            } else {
                //get Data for columns accordingly eg:ageGroup
                obj = this.getAgeGroupByAthelete(obj, confirmPageKey, events);
                if (checkIfApplicable(this.sportType, this.sportName)) {
                    this.team.push(obj);
                    this.team = _.uniqBy(this.team, '_id');
                } else {
                    if ($.jStorage.get('userType') == 'athlete') {
                        this.disableNextOnRules = true;
                    }
                }
            }
        } else {
            //remove athelete
            _.remove(this.team, function (n) {
                return n._id == obj._id;
            });
            var temp = _.find(listOfAthlete, ['_id', obj._id]);
            temp.checked = false;
        }
    };

    this.getAgeGroupByAthelete = function (athelete, confirmPageKey, events) {
        var birthdate = moment(athelete.dob);
        var st = this.sportName;

        //Events are filtered as per age and weights
        function getAgeGroups(events) {
            var event = _.cloneDeep(events);
            _.each(event, function (i, key) {
                i.data = _.filter(i.data, function (j) {
                    var startDate = moment(j.fromAge);
                    var endDate = moment(j.toAge);
                    if ((j.gender == athelete.gender) && birthdate.isBetween(startDate, endDate, null, '[]')) {
                        return true;
                    } else {
                        return false;
                    }
                });
            });
            event = _.reject(event, function (n) {
                return n.data.length == 0;
            });
            return event;
        }

        // for kata and kumite
        function filterEventWise(events) {
            var kata = _.cloneDeep(events);
            var kumite = _.cloneDeep(events);

            // kata
            _.each(kata, function (n, i) {
                n.data = _.filter(n.data, ['eventName', 'Kata']);
            });
            athelete.eventKata = getAgeGroups(kata);

            // kumite
            _.each(kumite, function (n, i) {
                n.data = _.filter(n.data, ['eventName', 'Kumite']);
            });
            athelete.eventKumite = getAgeGroups(kumite);
            athelete.sport = [];
            athelete.eventKata.unshift({
                '_id': 'None',
                'data': [{
                    'sport': null
                }]
            });
            athelete.eventKumite.unshift({
                '_id': 'None',
                'data': [{
                    'sport': null,
                    'weight': 'First Select Kumite'
                }]
            });
            return athelete;
        }

        // for fencing
        function filterFencing(events) {
            var epee = _.cloneDeep(events);
            var sabre = _.cloneDeep(events);
            var foil = _.cloneDeep(events);

            //epee
            _.each(epee, function (n, i) {
                n.data = _.filter(n.data, ['eventName', 'Epee']);
            });
            athelete.eventEpee = getAgeGroups(epee);
            athelete.eventEpee.unshift({
                '_id': 'None',
                'data': [{
                    'sport': null
                }]
            });

            // sabre
            _.each(sabre, function (n, i) {
                n.data = _.filter(n.data, ['eventName', 'Sabre']);
            });
            athelete.eventSabre = getAgeGroups(sabre);
            athelete.eventSabre.unshift({
                '_id': 'None',
                'data': [{
                    'sport': null
                }]
            });

            // foil
            _.each(foil, function (n, i) {
                n.data = _.filter(n.data, ['eventName', 'Foil']);
            });
            athelete.eventFoil = getAgeGroups(foil);
            athelete.eventFoil.unshift({
                '_id': 'None',
                'data': [{
                    'sport': null
                }]
            });

            console.log(athelete.eventFoil, "foil");
            athelete.sport = [];
            return athelete;
        }

        function filterArchery(events) {
            athelete.allEvents = [];
            _.each(events, function (m, i) {
                _.each(m.data, function (n) {
                    n._id = m._id;
                    athelete.allEvents.push(n);
                });
                delete m._id;
            });

            athelete.groupByEventName = _.groupBy(athelete.allEvents, 'eventName');
            // _.each(events, function (n) {
            //     _.each(n.data, function (m) {
            //         archerEvents.push(m);
            //     });
            // });
            console.log(athelete.groupByEventName);
            athelete.optionalEvents = _.union(athelete.groupByEventName['Compound Bow'], athelete.groupByEventName['Recurve Bow'])
            console.log(athelete.allEvents, athelete.optionalEvents);
        }

        switch (confirmPageKey) {
            case "K":
                athelete = filterEventWise(events);
                break;
            case "FA":
                athelete.sport = [];
                if (this.sportName == 'Fencing') {
                    athelete = filterFencing(events);
                } else if (this.sportName == 'Archery') {
                    athelete.ageGroups = getAgeGroups(events);
                    filterArchery(athelete.ageGroups);
                }
                break;
            case "AAS":
                athelete.ageGroups = getAgeGroups(events);
                console.log(athelete);
                break;
            case "I":
                athelete.sport = [];
                athelete.ageGroups = getAgeGroups(events);
                break;
            case "CT":
                break;
        }
        return athelete;
        // athlete birthdate
        // _.filter(sports,between athlete birthdate and filter by gender as well);
    };

    this.goNext = function (basicSportDetails, gender, age, length) {
        this.yourPromise = NavigationService.success().then(function () {
            console.log(basicSportDetails, gender, age, length, "---------Gonext service----------");

            this.gender = gender;
            this.ageGroup = age;
            // console.log();
            // For individual sportselection ,if team has no members return false with error msg
            if (basicSportDetails.isTeam === false && length === 0) {
                toastr.error("please select atleast one player");
                return false;
            }

            //change state based on sportType [why:coz confiem pages are different for each sports]
            switch (basicSportDetails.sportType) {
                case "K":
                    $state.go("confirm-karate", {
                        name: basicSportDetails.sportName
                    });
                    break;
                case "FA":
                    $state.go("confirm-fencing", {
                        name: basicSportDetails.sportName
                    });
                    break;
                case "AAS":
                    $state.go("confirm-athleteswim", {
                        name: basicSportDetails.sportName
                    });
                    break;
                case "I":
                    $state.go("confirm-individual", {
                        name: basicSportDetails.sportName
                    });
                    break;
                case "CT":
                    $state.go("confirmteam", {
                        name: basicSportDetails.sportName
                    });
                    break;
            }
        });
    };

    this.findOverAllFormValidation = function () {
        this.isValidForm = (_.findIndex(this.team, ['isValidSelection', false]) == -1);
        if (this.isValidForm) {
            this.showMissingFields = false;
        } else {
            this.showMissingFields = true;
            toastr.error("Please select all the fields", "Confirm Message");
        }
    };

    this.confirmSelection = function (data) {
        console.log(this.team);
        var formData = _.cloneDeep(this.team);
        switch (this.sportType) {
            case "K":
                this.findOverAllFormValidation();
                _.each(formData, function (m) {
                    _.each(m.sport, function (n, index) {
                        console.log(index, index == 0 && n.data[0]);
                        if (index == 0 && n && n.data[0]) {
                            m.sport[0] = n.data[0].sport;
                        } else if (index == 1 && n && n.sport) {
                            m.sport[1] = n.sport;
                        }
                    });
                    m.sport = _.compact(m.sport);
                });
                break;
            case "FA":
                this.findOverAllFormValidation();
                if (this.sportName == 'Fencing') {
                    _.each(formData, function (n) {
                        n.sport = _.compact(n.sport);
                    });
                } else if (this.sportName == 'Archery') {
                    console.log(formData);
                    _.each(formData, function (m, i) {
                        formData[i].sport = _.map(m.sport, 'sport');
                    });

                }
                console.log(this.isValidForm);
                break;
            case "AAS":
                this.findOverAllFormValidation();
                break;
            case "I":
                var st = this.sportName
                if (st == 'Judo' || st == 'Boxing' || st == 'Taekwondo' || st == 'Sport MMA') {
                    this.findOverAllFormValidation();
                    _.each(formData, function (n, i) {
                        n.sport = _.filter(n.sport, function (o, i) {
                            return i == 1
                        });
                    });
                } else {
                    this.findOverAllFormValidation();
                }
                break;
            case "CT":
                break;
        }
        //check if form is valid and then send data
        if (this.isValidForm) {
            console.log("isValid");
            _.each(formData, function (n, i) {
                n.sportsListSubCategory = $.jStorage.get("sportsId");
                n.athleteId = n._id
                formData[i] = _.pick(n, ['sport', 'sportsListSubCategory', 'athleteId']);
            });
            this.saveData(formData, data);
        } else {
            console.log("Some Fields are Missing");
        }
    };

    this.saveData = function (formData, data) {
        var accessToken = $.jStorage.get('userDetails').accessToken;
        var obj = {};
        _.each(formData, function (n) {
            if (data.nominatedContactDetails) {
                n.nominatedContactDetails = data.nominatedContactDetails;
            }
            if (data.nominatedEmailId) {
                n.nominatedEmailId = data.nominatedEmailId;
            }
            if (data.nominatedSchoolName) {
                n.nominatedSchoolName = data.nominatedSchoolName;
            }
            if (data.nominatedName) {
                n.nominatedName = data.nominatedName;
            }
            if (data.isVideoAnalysis) {
                n.isVideoAnalysis = data.isVideoAnalysis;
            }
        });
        obj.individual = formData;
        if ($.jStorage.get('userType') == 'school') {
            obj.schoolToken = accessToken;
        } else {
            obj.athleteToken = accessToken;
        }
        console.log(formData);
        $http({
            'method': 'POST',
            'url': adminUrl2 + 'individualSport/saveInIndividual',
            'data': obj
        }).then(function (data) {
            errorService.errorCode(data, function (allData) {
                if (!allData.message) {
                    if (allData.value) {
                        toastr.success("Successfully Confirmed", 'Success Message');
                        $state.go("individual-congrats");
                    }
                } else {
                    toastr.error(allData.message, 'Error Message');
                }
            });
        });
    };

    this.isValidSelection = function (athelete) {
        switch (this.sportType) {
            case "K":
                var arr = athelete.sport;
                var weights = athelete.event2Weights;
                // athelete.isValidSelection = (arr.length == 0 && (!weights || weights.length == 0)) ? false : (weights && weights.length == 0 && athelete.sport[0]) ? true : (weights.length != 0 && athelete.sport[1]) ? true : false;
                // athelete.isValidSelection = (arr.length == 0 && (!weights || (weights.length == 0))) ? false : ((arr.length >= 1 && arr[0].data[0].sport!=null) && (!weights || weights.length == 0)) ? true : ((arr.length >= 1 && arr[0].data[0].sport==null) && weights && weights.length!= 0 && weights.data[0].sport!=null && athelete.sport[1]) ? true : false;
                athelete.isValidSelection = ((arr.length == 0 || arr[0] && arr[0].data && arr[0].data[0].sport == null) && (!weights || (weights.length == 0))) ? false : (((arr.length >= 1 && arr[0].data[0].sport != null) && (!weights || weights.length == 0 || weights.data[0].sport == null)) || ((arr.length >= 1 && arr[0].data[0].sport == null) && weights && weights.length != 0 && weights.data[0].sport != null && athelete.sport[1]) || ((arr.length >= 1 && arr[0].data[0].sport != null) && weights && weights.length != 0 && weights.data[0].sport != null && athelete.sport[1])) ? true : false;
                // athelete.isValidSelection = ((arr.length == 0 || arr[0] && arr[0].data && arr[0].data[0].sport==null || arr[0] && arr[0].sport==null) && (!weights || (weights.length == 0))) ? false : (((arr.length >= 1 && arr[0].data[0].sport!=null) && (!weights || weights.length == 0 || weights.data[0].sport==null)) || ((arr.length >= 1 && (arr[0] && arr[0].data && arr[0].data[0].sport!=null || arr[0] && arr[0].sport!=null)) && weights && weights.length!= 0 && weights.data[0].sport!=null && athelete.sport[1]) || ((arr.length >= 1 && (arr[0] && arr[0].data && arr[0].data[0].sport!=null || arr[0] && arr[0].sport!=null)) && weights && weights.length!= 0 && weights.data[0].sport!=null && athelete.sport[1]))? true :false;   

                //    by properlogic // athelete.isValidSelection=((arr && arr.length>=1 && arr[0].data[0].sport!=null) ||((arr && arr.length>=1 && arr[1] && arr[1].sport!=null)&&(weights && weights.length>=1 && weights.data[0] && weights.data[0].sport!=null)))?true:false;
                break;
            case "FA":
                if (this.sportName == 'Fencing') {
                    var arr = _.compact(athelete.sport);
                    athelete.isValidSelection = arr.length > 0;
                } else if (this.sportName == 'Archery') {
                    athelete.disableEvent2 = (athelete && athelete.sport && athelete.sport[0] && athelete.sport[0].eventName != 'Indian Bow') ? true : false;
                    athelete.isValidSelection = ((athelete.sport && athelete.sport[0]) || (athelete.sport && athelete.sport[1])) ? true : false
                    if (athelete.sport && athelete.sport[1] && athelete.sport[1] != '' && athelete.sport[0].eventName != 'Indian Bow') {
                        athelete.sport[1] = {};
                    }
                }
                break;
            case "AAS":
                var arr = _.compact(athelete.sport);
                athelete.isValidSelection = (arr.length >= 1);
                break;
            case "I":
                var st = this.sportName;
                if (st == 'Judo' || st == 'Boxing' || st == 'Taekwondo' || st == 'Sport MMA') {
                    athelete.isValidSelection = (athelete.sport && athelete.sport[1] && athelete.sport[1] != '') ? true : false;
                } else {
                    var arr = _.compact(athelete.sport);
                    athelete.isValidSelection = arr.length > 0;
                }

                break;
            case "CT":

                break;
        }
    };

    this.editTeam = function (state) {
        $state.go(state, {
            'id': this.sportsId
        });
    };

    this.emptyTeam = function () {
        this.team = [];
    };

    this.reset = function () {
        this.team = [];
        this.sportsId = null;
        this.gender = null;
        this.ageGroup = null;
        this.redirectTo = null;
        this.showMissingFields = false;
        this.initialFun();
    };


});