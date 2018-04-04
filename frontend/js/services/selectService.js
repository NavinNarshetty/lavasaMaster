myApp.service('selectService', function ($http, TemplateService, $state, toastr, NavigationService, loginService, errorService, $timeout) {
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
    this.isDisabled = false;
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
                // console.log(data);
            }
        });
    };

    //make .checked to true if already selected
    this.isAtheleteSelected = function (listOfAthlete, team) {
        // console.log("Yes! it is.");
        var temp = _.intersectionBy(listOfAthlete, this.team, '_id');
        _.each(temp, function (n) {
            n.checked = true;
        });
        listOfAthlete = _.map(listOfAthlete, function (n) {
            // console.log("n.package && n.selectedEvent && !n.isIndividualSelected", n.package, n.selectedEvent, !n.isIndividualSelected);
            if (n.package && n.selectedEvent && !n.isIndividualSelected) {
                // console.log("n.selectedEvent==n.package.eventCount", n.selectedEvent, n.package.eventCount);
                if (n.selectedEvent == n.package.eventCount) {
                    n.maxReached = true;
                    console.log("got", n.sfaId);
                }
                return n;
            } else {
                return n;
            }
        });
        return listOfAthlete;
    };

    // push to Team (all validations objects are made here-For School As well as for Athlete Login)
    this.pushToTeam = function (ath, bool, listOfAthlete, events) {

        function checkIfApplicable(sT, sN) {
            var isApplicable = true;
            switch (sT) {
                case "K":
                    if (ath.eventKata.length <= 1 && ath.eventKumite.length <= 1) {
                        ath.checked = false;
                        toastr.error("Not Applicable");
                        isApplicable = false;
                    }
                    break;
                case "FA":
                    // console.log(ath);
                    if (sN == 'Fencing') {
                        if (ath.eventEpee.length <= 1 && ath.eventSabre.length <= 1 && ath.eventFoil.length <= 1) {
                            ath.checked = false;
                            toastr.error("Not Applicable");
                            isApplicable = false;
                        }
                    } else if (sN == 'Archery') {
                        if (ath.ageGroups.length == 0) {
                            ath.checked = false;
                            toastr.error("Not Applicable");
                            isApplicable = false;
                        }
                    }
                    break;
                case "AAS":
                    if (ath.ageGroups.length == 0) {
                        ath.checked = false;
                        toastr.error("Not Applicable");
                        isApplicable = false;
                    }
                    break;
                case "I":
                    if (ath.ageGroups.length == 0) {
                        ath.checked = false;
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

        //add athelete In Team if checkbox is checked else remove From Team
        if (bool) {
            if (ath.isTeamSelected) {
                toastr.error('This Player has already been Selected');
            } else if (ath.isIndividualSelected) {
                toastr.error('This Player has already been Registered');
            } else {

                ath = this.getAgeGroupByAthelete(ath, confirmPageKey, events);

                if (checkIfApplicable(this.sportType, this.sportName)) {
                    ath = this.checkPackageLimit(ath, this.sportType, this.sportName);
                    this.team.push(ath);
                    this.team = _.uniqBy(this.team, '_id');
                } else {
                    if ($.jStorage.get('userType') == 'athlete') {
                        this.disableNextOnRules = true;
                        $state.go('sports-selection');
                    }
                }
            }
        } else {
            _.remove(this.team, function (n) {
                return n._id == ath._id;
            });
            var temp = _.find(listOfAthlete, ['_id', ath._id]);
            temp.checked = false;
        }
    };

    this.checkPackageLimit = function (ath, sT, sN) {
        if (sN == "Athletics") {
            ath.selectLimit = 2;
            ath.maxOptionsText = "Limit reached ( " + ath.selectLimit + " events max)"
        }
        if (ath.selectedEvent != null && ath.selectedEvent != undefined && ath.package) {
            ath.registeredSportCount = ath.selectedEvent;
            ath.packageCount = ath.package.eventCount;

            switch (sT) {
                case "K":

                    break;
                case "FA":
                    // console.log(ath);
                    if (sN == 'Fencing') {
                        ath.selectLimit = ath.packageCount - ath.registeredSportCount;
                        ath.maxOptionsText = "Upgrade Your Package";
                    } else if (sN == 'Archery') {
                        ath.fen1flag = false;
                        ath.fen2flag = false;
                        ath.informTitle = "Select Event"
                        ath.selectLimit = ath.packageCount - ath.registeredSportCount;
                        ath.maxOptionsText = "Upgrade Your Package";
                    }
                    break;
                case "AAS":
                    if (sN == "Athletics") {
                        if (ath.registeredSportCount + 2 > ath.packageCount) {
                            ath.selectLimit = ath.packageCount - ath.registeredSportCount;
                            if (ath.selectLimit >= 2) {
                                ath.selectLimit = 2;
                                ath.maxOptionsText = "Limit reached ( " + ath.selectLimit + " events max)";
                            } else {
                                ath.maxOptionsText = "Upgrade Your Package";
                            }
                        } else {
                            ath.selectLimit = 2;
                            ath.maxOptionsText = "Limit reached ( " + ath.selectLimit + " events max)"
                        }
                    } else if (sN == "Swimming") {
                        ath.selectLimit = ath.packageCount - ath.registeredSportCount;
                        ath.maxOptionsText = "Upgrade Your Package"
                    } else if (sN == "Shooting") {
                        ath.selectLimit = ath.packageCount - ath.registeredSportCount;
                        ath.maxOptionsText = "Upgrade Your Package";
                    }

                    break;
                case "I":

                    break;
                case "CT":
                    break;
            }
            return ath;
        } else {
            return ath;
        }

    };

    this.getAgeGroupByAthelete = function (athelete, confirmPageKey, events) {
        // console.log("confirmPageKey", confirmPageKey);
        // console.log("events", events);

        var birthdate = moment(athelete.dob);
        var st = this.sportName;

        //Events are filtered as per age and weights
        function getAgeGroups(events) {

            var event = _.cloneDeep(events);
            _.each(event, function (i, key) {
                i.data = _.filter(i.data, function (j) {
                    var startDate = moment(j.fromAge);
                    var endDate = moment(j.toAge);
                    console.log("----");
                    if ((j.gender == athelete.gender) && birthdate.isBetween(startDate, endDate, null, '[]')) {
                        return true;
                    } else {
                        return false;
                    }
                });
            });
            console.log("event", event);
            event = _.reject(event, function (n) {
                return n.data.length == 0;
            });
            console.log("event", event);
            return event;
        }


        //for filtering Shooting Events
        var airRiflePeepArr = [];
        var airRifleOpenArr = [];
        var airRiflePistolArr = [];

        function filterShooting(events) {
            var airRiflePeep = _.cloneDeep(events);
            var airRifleOpen = _.cloneDeep(events);
            var airRiflePistol = _.cloneDeep(events);

            //airRiflePeep
            _.each(airRiflePeep, function (n, i) {
                n.data = _.filter(n.data, ['eventName', 'Air Rifle Peep']);
                _.each(n.data, function (key) {
                    key.ageId = n._id;
                });
            });

            airRiflePeep = getAgeGroups(airRiflePeep);
            _.each(airRiflePeep, function (j) {
                airRiflePeepArr.push(j.data);
            });
            athelete.airRiflePeep = _.flattenDeep(airRiflePeepArr);

            // airRifleOpen
            _.each(airRifleOpen, function (n, i) {
                n.data = _.filter(n.data, ['eventName', 'Air Rifle Open']);
                _.each(n.data, function (key) {
                    key.ageId = n._id;
                });
            });
            airRifleOpen = getAgeGroups(airRifleOpen);
            _.each(airRifleOpen, function (j) {
                airRifleOpenArr.push(j.data);
            });
            athelete.airRifleOpen = _.flattenDeep(airRifleOpenArr);

            // airRiflePistol
            _.each(airRiflePistol, function (n, i) {
                n.data = _.filter(n.data, ['eventName', 'Air Pistol']);
                _.each(n.data, function (key) {
                    key.ageId = n._id;
                });
            });
            airRiflePistol = getAgeGroups(airRiflePistol);
            _.each(airRiflePistol, function (j) {
                airRiflePistolArr.push(j.data);
            });
            athelete.airRiflePistol = _.flattenDeep(airRiflePistolArr);

            athelete.sport = [];
            athelete.pistol = [];
            athelete.peep = [];
            athelete.open = [];
            return athelete;
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
            console.log("eventKata", athelete.eventKata);
            // kumite
            _.each(kumite, function (n, i) {
                n.data = _.filter(n.data, ['eventName', 'Kumite']);
            });
            athelete.eventKumite = getAgeGroups(kumite);
            console.log("eventKumite", athelete.eventKumite);

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
        // function filterFencing(events) {
        //     var epee = _.cloneDeep(events);
        //     var sabre = _.cloneDeep(events);
        //     var foil = _.cloneDeep(events);

        //     //epee
        //     _.each(epee, function (n, i) {
        //         n.data = _.filter(n.data, ['eventName', 'Epee']);
        //     });
        //     athelete.eventEpee = getAgeGroups(epee);
        //     athelete.eventEpee.unshift({
        //         '_id': 'None',
        //         'data': [{
        //             'sport': null
        //         }]
        //     });
        //     console.log("athelete.eventEpee",athelete.eventEpee);

        //     // sabre
        //     _.each(sabre, function (n, i) {
        //         n.data = _.filter(n.data, ['eventName', 'Sabre']);
        //     });
        //     athelete.eventSabre = getAgeGroups(sabre);
        //     athelete.eventSabre.unshift({
        //         '_id': 'None',
        //         'data': [{
        //             'sport': null
        //         }]
        //     });
        //     console.log("athelete.eventSabre",athelete.eventSabre);


        //     // foil
        //     _.each(foil, function (n, i) {
        //         n.data = _.filter(n.data, ['eventName', 'Foil']);
        //     });
        //     athelete.eventFoil = getAgeGroups(foil);
        //     athelete.eventFoil.unshift({
        //         '_id': 'None',
        //         'data': [{
        //             'sport': null
        //         }]
        //     });
        //     console.log("athelete.eventFoil",athelete.eventFoil);


        //     // console.log(athelete.eventFoil, "foil");
        //     athelete.sport = [];
        //     return athelete;
        // }

        function filterFencing(events) {
            var epee = _.cloneDeep(events);
            var sabre = _.cloneDeep(events);
            var foil = _.cloneDeep(events);

            //epee
            _.each(epee, function (n, i) {
                n.data = _.filter(n.data, ['eventName', 'Epee']);
            });
            athelete.eventEpee = getAgeGroups(epee);
            athelete.eventEpee = _.map(athelete.eventEpee, function (n) {
                n._id = n._id + "-Epee"
                return n;
            });
            athelete.eventEpee.unshift({
                '_id': 'None',
                'data': [{
                    'sport': null
                }]
            });
            console.log("athelete.eventEpee", athelete.eventEpee);

            // sabre
            _.each(sabre, function (n, i) {
                n.data = _.filter(n.data, ['eventName', 'Sabre']);
            });
            athelete.eventSabre = getAgeGroups(sabre);
            athelete.eventSabre = _.map(athelete.eventSabre, function (n) {
                n._id = n._id + "-Sabre"
                return n;
            });
            // athelete.eventSabre.unshift({
            //     '_id': 'None',
            //     'data': [{
            //         'sport': null
            //     }]
            // });
            console.log("athelete.eventSabre", athelete.eventSabre);


            // foil
            _.each(foil, function (n, i) {
                n.data = _.filter(n.data, ['eventName', 'Foil']);
            });
            athelete.eventFoil = getAgeGroups(foil);
            athelete.eventFoil = _.map(athelete.eventFoil, function (n) {
                n._id = n._id + "-Foil"
                return n;
            });
            // athelete.eventFoil.unshift({
            //     '_id': 'None',
            //     'data': [{
            //         'sport': null
            //     }]
            // });
            console.log("athelete.eventFoil", athelete.eventFoil);
            athelete.events = _.concat(athelete.eventEpee, athelete.eventSabre, athelete.eventFoil);
            console.log("athelete.events", athelete.events);


            // console.log(athelete.eventFoil, "foil");
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
            // _.each(n.data, function (m) {
            // archerEvents.push(m);
            // });
            // });
            // console.log(athelete.groupByEventName);
            athelete.optionalEvents = _.union(athelete.groupByEventName['Compound Bow'], athelete.groupByEventName['Recurve Bow'])
            // console.log(athelete.allEvents, athelete.optionalEvents);
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
                if (this.sportName == 'Shooting') {
                    athelete.ageGroups = getAgeGroups(events);
                    filterShooting(athelete.ageGroups);
                } else {
                    athelete.ageGroups = getAgeGroups(events);
                }
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
            // console.log(basicSportDetails, gender, age, length, "---------Gonext service----------");

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
        console.log("findOverAllFormValidation");
        this.isValidForm = (_.findIndex(this.team, ['isValidSelection', false]) == -1);
        console.log();
        if (this.isValidForm) {
            this.showMissingFields = false;
        } else {
            this.showMissingFields = true;
            toastr.error("Please select all the fields", "Confirm Message");
        }
    };

    this.confirmSelection = function (data) {
        console.log("save");
        console.log("data", data);
        console.log("this.team", this.team);
        var formData = _.cloneDeep(this.team);
        console.log("formData", formData);
        switch (this.sportType) {
            case "K":
                this.findOverAllFormValidation();
                _.each(formData, function (m) {
                    _.each(m.sport, function (n, index) {
                        // console.log(index, index == 0 && n.data[0]);
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
                    // console.log(formData);
                    _.each(formData, function (m, i) {
                        formData[i].sport = _.map(m.sport, 'sport');
                    });

                }
                // console.log(this.isValidForm);
                break;
            case "AAS":
                this.findOverAllFormValidation();
                break;
            case "I":
                var st = this.sportName
                if (st == 'Judo' || st == 'Boxing' || st == 'Taekwondo' || st == 'Sport MMA' || st == 'Wrestling') {
                    this.findOverAllFormValidation();
                    console.log("this.team[0].sport[0].data", this.team[0].sport[0].data);
                    _.each(formData, function (n, i) {
                        arr = _.filter(n.sport[0].data, function (o, i) {
                            return !_.has(o, 'weight')
                        });
                        console.log("arr", arr);
                        n.sport = _.map(arr, 'sport');
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
            // console.log("isValid");
            _.each(formData, function (n, i) {
                n.sportsListSubCategory = $.jStorage.get("sportsId");
                n.athleteId = n._id
                formData[i] = _.pick(n, ['sport', 'sportsListSubCategory', 'athleteId']);
            });
            console.log("finalData", formData);
            console.log("savedData", formData);
            this.saveData(formData, data);
        } else {
            // console.log("Some Fields are Missing");
        }
    };

    this.setJstorageProfile = function () {
        console.log($.jStorage.get("userDetails"));
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
        this.isDisabled = true;
        var ref = this;
        // console.log(formData);
        $http({
            'method': 'POST',
            'url': adminUrl2 + 'individualSport/saveInIndividual',
            'data': obj
        }).then(function (data) {
            ref.isDisabled = false;
            errorService.errorCode(data, function (allData) {
                console.log("allData", allData);
                if (allData.value) {
                    toastr.success("Successfully Confirmed", 'Success Message');

                    $state.go("individual-congrats");
                } else {
                    toastr.error(allData.message || allData.error, 'Error Message');
                }
            });
        });
    };

    this.isValidSelection = function (athelete, whichSelectTag) {
        switch (this.sportType) {

            case "K":

                var arr = athelete.sport;
                var weights = _.cloneDeep(athelete.event2Weights);
                if (athelete.event2Weights) {
                    var obj = _.find(weights.data, function (n) {
                        if (!n.weight) {
                            console.log("n", n);
                            return n
                        }
                    });
                    if (obj) {
                        arr[1] = obj;
                    } else {
                        arr[1] = {};
                    }
                }
                athelete.isValidSelection = (arr.length == 0 || ((!arr[0] || arr[0] && arr[0].data && arr[0].data[0].sport == null) && ((arr[1] && !arr[1].sport) || (arr[1] && arr[1].sport == null)))) ? false : ((arr.length >= 1 && arr[0] && arr[0].data && arr[0].data[0] && arr[0].data[0].sport != null) || ((arr.length >= 1 && (!arr[0] || arr[0] && arr[0].data[0].sport == null)) && (arr.length >= 1 && arr[1] && arr[1].sport != null)) || ((arr.length >= 1 && arr[0] && arr[0].data[0] && arr[0].data[0].sport != null) && (arr.length >= 1 && arr[1] && arr[1].sport != null))) ? true : false;
                break;

            case "FA":

                if (this.sportName == 'Fencing') {
                    var arr = _.compact(athelete.sport);
                    athelete.isValidSelection = arr.length > 0;
                } else if (this.sportName == 'Archery') {
                    console.log("event from Service");

                    var allowedAsPerPackage = (((athelete.package.eventCount - athelete.selectedEvent) - _.compact(athelete.sport).length) <= 0) ? true : false;
                    if (allowedAsPerPackage) {
                        athelete.disableEvent2 = true;
                        athelete.informTitle = "Upgrade Package To Add More";
                        if (whichSelectTag == 'Fen2') {
                            athelete.sport[1]={};
                            toastr.info("Sfa Id " + athelete.sfaId +" Can Only Participate In "+ athelete.selectLimit +" Event. As per Selected Package", "Select From Event 1");
                        }
                    }

                    var disableIfNotIndianBow = (athelete && athelete.sport && athelete.sport[0] && athelete.sport[0].eventName != 'Indian Bow')?true:false;
                    if (disableIfNotIndianBow) {
                        athelete.disableEvent2 = true;
                        athelete.informTitle = "Not Allowed";
                    }
                    athelete.disableEvent2 = (allowedAsPerPackage || disableIfNotIndianBow) ? true : false;
                    
                    athelete.isValidSelection = ((athelete.sport && athelete.sport[0]) || (athelete.sport && athelete.sport[1])) ? true : false
                    if (athelete.sport && athelete.sport[1] && athelete.sport[1] != '' && athelete.sport[0] && athelete.sport[0].eventName != 'Indian Bow') {
                        athelete.sport[1] = {};
                    }
                }
                break;

            case "AAS":

                if (this.sportName == 'Shooting') {
                    if (athelete.peep.length >= 1 || athelete.open.length >= 1 || athelete.pistol.length >= 1) {
                        if (athelete.peep.length >= 1) {
                            athelete.sport = _.cloneDeep(athelete.peep);
                            var arr = _.compact(athelete.sport);
                            athelete.isValidSelection = (arr.length >= 1);
                        }
                        if (athelete.open.length >= 1) {
                            athelete.sport = _.cloneDeep(athelete.open);
                            var arr = _.compact(athelete.sport);
                            athelete.isValidSelection = (arr.length >= 1);
                        }
                        if (athelete.pistol.length >= 1) {
                            athelete.sport = _.cloneDeep(athelete.pistol);
                            var arr = _.compact(athelete.sport);
                            athelete.isValidSelection = (arr.length >= 1);
                        }
                    } else {
                        athelete.isValidSelection = false;
                    }

                } else {
                    var arr = _.compact(athelete.sport);
                    athelete.isValidSelection = (arr.length >= 1);
                }
                break;

            case "I":

                var st = this.sportName;
                if (st == 'Judo' || st == 'Boxing' || st == 'Taekwondo' || st == 'Sport MMA' || st == 'Wrestling') {
                    athelete.isValidSelection = (athelete.sport && athelete.sport[0] && athelete.sport[0] != '') ? true : false;
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