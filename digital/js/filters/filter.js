// JavaScript Document
myApp.filter('myFilter', function () {
    // In the return function, we must pass in a single parameter which will be the data we will work on.
    // We have the ability to support multiple other parameters that can be passed into the filter optionally
    return function (input, optional1, optional2) {

        var output;

        // Do filter work here
        return output;
    };

});

myApp.filter('indianCurrency', function () {
    return function (getNumber) {
        if (!isNaN(getNumber)) {
            var numberArr = getNumber.toString().split('.');
            var lastThreeDigits = numberArr[0].substring(numberArr[0].length - 3);
            var otherDigits = numberArr[0].substring(0, numberArr[0].length - 3);
            if (otherDigits != '') {
                lastThreeDigits = ',' + lastThreeDigits;
            }
            var finalNumber = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThreeDigits;
            if (numberArr.length > 1) {
                var getRoundedDecimal = parseInt(numberArr[1].substring(0, 2)) + 1;
                finalNumber += "." + getRoundedDecimal;
            }
            // return '₹' + finalNumber;
            return finalNumber;
        }
    }
});

// TRUNCATE
myApp.filter('truncate', function () {
    return function (value, limit) {
        if (value) {
            if (value.length < limit) {
                return value;
            } else {
                return value.slice(0, limit) + "...";
            }
        }
    }
});
// TRUNCATE END

// SERVER IMAGE
myApp.filter('serverimage', function () {
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
            return adminurl + "upload/readFile?file=" + image + other;
        } else {
            return undefined;
        }
    };
});

// SERVER IMAGE  END

myApp.filter('firstcapitalize', function () {
    return function (input, all) {
        var reg = (all) ? /([^\W_]+[^\s-]*) */g : /([^\W_]+[^\s-]*)/;
        return (!!input) ? input.replace(reg, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }) : '';
    };
});

myApp.filter('capitalize', function () {
    return function (input, all) {
        var reg = (all) ? /([^\W_]+[^\s-]*) */g : /([^\W_]+[^\s-]*)/;
        return (!!input) ? input.replace(reg, function (txt) {
            return txt.toUpperCase();
        }) : '';
    };
});

myApp.filter('englishNumeralDate', function () {
    return function (value) {
        if (value) {
            return moment(new Date(value)).format("Do MMMM YYYY");
        }
    };
});

myApp.filter('filterPlayers', function () {
    return function (players) {
        console.log(players);
        players = _.filter(players, ['noShow', false]);
        console.log(players);
        return players;
    };
});
myApp.filter('filterConcate', function () {
    return function (first, second) {
        if (first != undefined) {
            return first + ' - ' + second;
        } else {
            return first;
        }
    };
});
myApp.filter('englishNumeralDateOne', function () {
    return function (value) {
        if (value) {
            return moment(new Date(value)).format(" Do MMM YYYY");
        }
    };
});
// VIDEO LINK FILTER
myApp.filter('linkvideo', function () {
    return function (input, type) {
        var videourl;
        if (type == 'youtube') {
            videourl = "https://www.youtube.com/embed/" + input + "?autoplay=0&modestbranding=0&showinfo=0&rel=0&loop=1";
        } else {
            videourl = "https://player.vimeo.com/video/" + input + "?autoplay=1&loop=1&autopause=0";
        }
        return videourl;
    };
})
// VIDEO LINK FILTER END
// FILTER FOR SPORT ICON AND HEADER IMG
myApp.filter('sporticon', function(){
  return function(input, type){
    var input = input.toLowerCase();
    var type = type.toLowerCase();
    var iconImg = "";
    var headerImg = "";
    // Switch the sport types to get the icons
    switch(input){
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
    if( type == 'header' || type == 'certificate'){
      return headerImg;
    } else{
      return iconImg;
    }
  }
});
// FILTER FOR SPORT ICON AND HEADER IMG END
