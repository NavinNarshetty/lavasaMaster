myApp.service('TemplateService', function () {
    this.title = "Home";
    this.meta = "Google";
    this.metadesc = "Home";
    this.description = "";
    this.keywords = "";
    this.pageMax = 10;
    var d = new Date();
    this.year = d.getFullYear();
    this.onlyAlpha = /^[A-z]+$/;

    this.init = function () {
        this.header = "views/template/header.html";
        this.menu = "views/template/menu.html";
        this.content = "views/content/content.html";
        this.footer = "views/template/footer.html";
    };

    this.getHTML = function (page) {
        this.init();
        var data = this;
        data.content = "views/" + page;
        return data;
    };

    // SCROLL FUNCTION FROM CONTROLLER
    this.scrollTo = function (destination, type) {
      // "type" is either class or id written in string;
      // "destination" is the CLASS  or ID  you want to scroll to without '#' or '.'
      // E.G :CLASS:  scrollTo('hello', 'class');     :ID:  scrollTo('rankTable1', 'id');
      if (type == 'id') {
        var destination = '#' + destination;
      } else if (type == 'class') {
        var destination = '.' + destination;
      }
    //   console.log(destination, type, 'in dir')
      $('html,body').animate({
          scrollTop: $(destination).offset().top
        },
        'slow');
    };
    // SCROLL FUNCTION FROM CONTROLLER END

    this.init();

});
