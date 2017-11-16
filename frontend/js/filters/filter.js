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

    .filter('uploadpathTwo', function () {
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
                    return imgPath2 + "?file=" + input + other;
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

    .filter('removeSchoolWithDash', function () {
        return function (value, school) {
            if (value) {
                return value.replace(school + "-", "");
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

    .filter('englishNumeralDateOne', function () {
        return function (value) {
            if (value) {
                return moment(new Date(value)).format(" Do MMM YYYY");
            }
        };
    })

    .filter('serverimage', function () {
        return function (image) {
            if (image && image !== null) {
                // console.log("adminUrl--", adminUrl2);
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
        };
    })

    .filter('isValidSelection', function () {
        return function (age, event) {
            if (age != 'None') {
                return age + '-' + event;
            } else {
                return age;
            }
        };
    })

    .filter('filterConcate', function () {
        return function (first, second) {
            if (first !== undefined) {
                return first + ' - ' + second;
            } else {
                return first;
            }
        };
    })

    // FILTER MEDALS
    .filter('medalicon', function () {
        return function (input, type) {
            var input = input.toLowerCase();
            var type = type.toLowerCase();
            var medalImg = "";
            medalImg = "img/medal-icon/" + input + "-" + type + ".png";
            return medalImg;
        };
    })
    // FILTER MEDALS;
    // VIDEO
    .filter('linkvideo', function () {
        return function (input, type) {
            var videourl;
            if (type == 'youtube') {
                videourl = "https://www.youtube.com/embed/" + input + "?autoplay=1&modestbranding=0&showinfo=0&rel=0&loop=1";
            } else {
                videourl = "https://player.vimeo.com/video/" + input + "?autoplay=1&loop=1&autopause=0";
            }
            return videourl;
        };
    })

    .filter('videothumbnail', function () {
        return function (value) {
            console.log('valu', value);
            if (value) {
                return "http://img.youtube.com/vi/" + value + "/hqdefault.jpg";
            } else {
                return "";
            }
        };
    })


    // VIDEO END
    // FILTER FOR SPORT ICON AND HEADER IMG
    .filter('sporticon', function () {
        return function (input, type) {
            var input = input.toLowerCase();
            var type = type.toLowerCase();
            var iconImg = "";
            var headerImg = "";
            // Switch the sport types to get the icons
            switch (input) {
                case "handball":
                    iconImg = "img/sporticon/handball.png";
                    headerImg = "img/sporticon/handball-" + type + ".jpg";
                    break;
                case "basketball":
                    iconImg = "img/sporticon/basketball.png";
                    headerImg = "img/sporticon/basketball-" + type + ".jpg";
                    break;
                case "volleyball":
                    iconImg = "img/sporticon/volleyball.png";
                    headerImg = "img/sporticon/volleyball-" + type + ".jpg";
                    break;
                case "throwball":
                    iconImg = "img/sporticon/throwball.png";
                    headerImg = "img/sporticon/throwball-" + type + ".jpg";
                    break;
                case "hockey":
                    iconImg = "img/sporticon/hockey.png";
                    headerImg = "img/sporticon/hockey-" + type + ".jpg";
                    break;
                case "kabaddi":
                    iconImg = "img/sporticon/kabaddi.png";
                    headerImg = "img/sporticon/kabaddi-" + type + ".jpg";
                    break;
                case "football":
                    iconImg = "img/sporticon/football.png";
                    headerImg = "img/sporticon/football-" + type + ".jpg";
                    break;
                case "badminton":
                case "badminton doubles":
                    iconImg = "img/sporticon/badminton.png";
                    headerImg = "img/sporticon/badminton-" + type + ".jpg";
                    break;
                case "tennis":
                case "tennis doubles":
                case "tennis mixed doubles":
                    iconImg = "img/sporticon/tennis.png";
                    headerImg = "img/sporticon/tennis-" + type + ".jpg";
                    break;
                case "table tennis":
                case "table tennis doubles":
                    iconImg = "img/sporticon/table-tennis.png";
                    headerImg = "img/sporticon/table-tennis-" + type + ".jpg";
                    break;
                case "squash":
                    iconImg = "img/sporticon/squash.png";
                    headerImg = "img/sporticon/squash-" + type + ".jpg";
                    break;
                case "judo":
                    iconImg = "img/sporticon/judo.png";
                    headerImg = "img/sporticon/judo-" + type + ".jpg";
                    break;
                case "taekwondo":
                    iconImg = "img/sporticon/taekwondo.png";
                    headerImg = "img/sporticon/taekwondo-" + type + ".jpg";
                    break;
                case "boxing":
                    iconImg = "img/sporticon/boxing.png";
                    headerImg = "img/sporticon/boxing-" + type + ".jpg";
                    break;
                case "fencing":
                    iconImg = "img/sporticon/fencing.png";
                    headerImg = "img/sporticon/fencing-" + type + ".jpg";
                    break;
                case "karate":
                case "karate team kumite":
                    iconImg = "img/sporticon/karate.png";
                    headerImg = "img/sporticon/karate-" + type + ".jpg";
                    break;
                case "sport mma":
                    iconImg = "img/sporticon/sport-mma.png";
                    headerImg = "img/sporticon/sport-mma-" + type + ".jpg";
                    break;
                case "shooting":
                case "shooting air rifle peep team":
                case "shooting air rifle open team":
                case "shooting air rifle peep team":
                    iconImg = "img/sporticon/shooting.png";
                    headerImg = "img/sporticon/shooting-" + type + ".jpg";
                    break;
                case "archery":
                    iconImg = "img/sporticon/archery.png";
                    headerImg = "img/sporticon/archery-" + type + ".jpg";
                    break;
                case "swimming":
                case "swimming 4x50m freestyle relay":
                case "swimming 4x50m medley relay":
                    iconImg = "img/sporticon/swimming.png";
                    headerImg = "img/sporticon/swimming-" + type + ".jpg";
                    break;
                case "water polo":
                    iconImg = "img/sporticon/water-polo.png";
                    headerImg = "img/sporticon/water-polo-" + type + ".jpg";
                    break;
                case "carrom":
                    iconImg = "img/sporticon/carrom.png";
                    headerImg = "img/sporticon/carrom-" + type + ".jpg";
                    break;
                case "chess":
                    iconImg = "img/sporticon/chess.png";
                    headerImg = "img/sporticon/chess-" + type + ".jpg";
                    break;
                case "athletics":
                case "athletics 4x100m relay":
                case "athletics 4x50m relay":
                case "athletics medley relay":
                    iconImg = "img/sporticon/athletics.png";
                    headerImg = "img/sporticon/athletics-" + type + ".jpg";
                    break;
                case "kho kho":
                    iconImg = "img/sporticon/kho-kho.png";
                    headerImg = "img/sporticon/kho-kho-" + type + ".jpg";
                    break;
            }
            if (type == 'header' || type == 'certificate') {
                return headerImg;
            } else {
                return iconImg;
            }
        };
    });
// FILTER FOR SPORT ICON AND HEADER IMG END