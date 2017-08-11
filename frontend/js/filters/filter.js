// JavaScript Document
myApp.filter('myFilter', function () {
        // In the return function, we must pass in a single parameter which will be the data we will work on.
        // We have the ability to support multiple other parameters that can be passed into the filter optionally
        return function (input, optional1, optional2) {

            var output;

            // Do filter work here
            return output;
        };
    })

    .filter('ageYearFilter', function () {
        function calculateAge(birthday) { // birthday is a date
            var ageDifMs = Date.now() - new Date(birthday).getTime();
            var ageDate = new Date(ageDifMs); // miliseconds from epoch
            return Math.abs(ageDate.getUTCFullYear() - 1970);
        }

        return function (birthdate) {
            if (birthdate) {
                return calculateAge(birthdate);
            } else {
                return '-';
            }
        };
    })

    .filter('uploadpath', function () {
        return function (input, width, height, style) {
            var other = "";
            if (width && width !== "") {
                other += "&width=" + width;
            }
            if (height && height !== "") {
                other += "&height=" + height;
            }
            if (style && style !== "") {
                other += "&style=" + style;
            }
            if (input) {
                if (input.indexOf('https://') == -1) {
                    return imgPath + "?file=" + input + other;
                } else {
                    return input;
                }
            }
        };
    })

    .filter('letterLimit', function () {
        return function (value, limit) {
            if (value) {
                if (value.length < limit) {
                    return value;
                } else {
                    return value.slice(0, limit - 2) + "..";
                }
            } else {
                return "";
            }
        };
    })

    .filter('removeSchool', function () {
        return function (value, school) {
            if (value) {
                return value.replace(school + " ", "");
            } else {
                return "";
            }
        };
    })

    .filter('knockoutRoundName', function () {
        return function (value) {
            if (value) {
                return value.substring(value.indexOf(' ') + 1);
            } else {
                return "";
            }
        };
    })

    .filter('mediapath', function () {
        return function (value) {
            if (value) {
                return "https://storage.googleapis.com/sportsforall/media%26gallery/" + value;
            } else {
                return "";
            }
        };
    })

    .filter('videothumbnail', function () {
        return function (value) {
            if (value) {
                return "http://img.youtube.com/vi/" + value + "/hqdefault.jpg";
            } else {
                return "";
            }
        };
    })

    .filter('lessthan10', function () {
        return function (value) {
            if (value) {
                if (value < 10) {
                    return "0" + value;
                } else {
                    return value;
                }
            } else {
                return "00";
            }
        };
    })

    .filter('ageFilter', function () {
        return function (birthdate) { // birthday is a date
            var birth = _.clone(birthdate);
            if (birth) {
                if (new Date(birth) > new Date(2011, 1, 1)) {
                    return 'U-6';
                } else if (new Date(birth) > new Date(2010, 1, 1)) {
                    return 'U-7';
                } else if (new Date(birth) > new Date(2009, 1, 1)) {
                    return 'U-8';
                } else if (new Date(birth) > new Date(2008, 1, 1)) {
                    return 'U-9';
                } else if (new Date(birth) > new Date(2007, 1, 1)) {
                    return 'U-10';
                } else if (new Date(birth) > new Date(2006, 1, 1)) {
                    return 'U-11';
                } else if (new Date(birth) > new Date(2005, 1, 1)) {
                    return 'U-12';
                } else if (new Date(birth) > new Date(2004, 1, 1)) {
                    return 'U-13';
                } else if (new Date(birth) > new Date(2003, 1, 1)) {
                    return 'U-14';
                } else if (new Date(birth) > new Date(2002, 1, 1)) {
                    return 'U-15';
                } else if (new Date(birth) > new Date(2001, 1, 1)) {
                    return 'U-16';
                } else if (new Date(birth) > new Date(2000, 1, 1)) {
                    return 'U-17';
                } else if (new Date(birth) > new Date(1999, 1, 1)) {
                    return 'U-18';
                } else if (new Date(birth) > new Date(1998, 1, 1)) {
                    return 'U-19';
                } else {
                    return "";
                }
            }
        };
    })

    .filter('rawHtml', ['$sce',
        function ($sce) {
            return function (val) {
                return $sce.trustAsHtml(val);
            };
        }
    ])

    .filter('englishNumeralDate', function () {
        return function (value) {
            if (value) {
                return moment(new Date(value)).format("Do MMMM YYYY");
            }
        };
    })

    .filter('serverimage', function () {
        return function (image) {
            if (image && image !== null) {
                console.log("adminUrl--", adminUrl2);
                return adminUrl2 + "upload/readFile?file=" + image;
            } else {
                return undefined;
            }
        };
    })

    .filter('serverimage2', function () {
        return function (image, width, height, style) {
            var other = "";
            if (width && width !== "") {
                other += "&width=" + width;
            }
            if (height && height !== "") {
                other += "&height=" + height;
            }
            if (style && style !== "") {
                other += "&style=" + style;
            }
            if (image && image !== null) {
                console.log("adminUrl--", adminUrl2);
                return adminUrl2 + "upload/readFile?file=" + image + other;
            } else {
                return undefined;
            }
        };
    })

    .filter('propsFilter', function () {
        return function (items, props) {
            var out = [];

            if (angular.isArray(items)) {
                var keys = Object.keys(props);

                items.forEach(function (item) {
                    var itemMatches = false;

                    for (var i = 0; i < keys.length; i++) {
                        var prop = keys[i];
                        var text = props[prop].toLowerCase();
                        if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                            itemMatches = true;
                            break;
                        }
                    }

                    if (itemMatches) {
                        out.push(item);
                    }
                });
            } else {
                // Let the output be the input untouched
                out = items;
            }

            return out;
        };
    })

    .filter('tp', function () {
        return function (items) {
            return _.filter(items, ['val', true]);
        };
    })

    .filter('firstcapitalize', function () {
        return function (input, all) {
            var reg = (all) ? /([^\W_]+[^\s-]*) */g : /([^\W_]+[^\s-]*)/;
            return (!!input) ? input.replace(reg, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }) : '';
        };
    })

    .filter('capitalize', function () {
        return function (input, all) {
            var reg = (all) ? /([^\W_]+[^\s-]*) */g : /([^\W_]+[^\s-]*)/;
            return (!!input) ? input.replace(reg, function (txt) {
                return txt.toUpperCase();
            }) : '';
        };
    })

    .filter('shorten', function () {
        return function (value, limit) {
            if (value)
                if (value.length < limit) {
                    return value;
                } else {
                    return value.slice(0, limit) + "...";

                }

        };
    })

    .filter('formatEvent', function () {
        return function (age, event) {
            if (age != 'None') {
                return age + '-' + event;
            } else {
                return age;
            }
        };
    })

    .filter('truncate', function () {
        return function (value, limit) {
            if (value) {
                if (value.length < limit) {
                    return value;
                } else {
                    return value.slice(0, limit) + "...";
                }
            }
        }
    })

    .filter('isValidSelection', function () {
        return function (age, event) {
            if (age != 'None') {
                return age + '-' + event;
            } else {
                return age;
            }
        };
    });