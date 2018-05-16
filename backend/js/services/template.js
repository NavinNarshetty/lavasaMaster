myApp.service('TemplateService', function () {
  this.title = "Home";
  this.meta = "Google";
  this.metadesc = "Home";
  this.pageMax = 10;
  this.adminurl = adminurl;
  this.accessTokenUrl = adminurl;
  var d = new Date();
  this.year = d.getFullYear();
  this.profile = $.jStorage.get("profile");
  this.init = function () {
    this.header = "views/header.html";
    this.menu = "views/menu.html";
    this.content = "views/content/content.html";
    this.footer = "views/footer.html";
    this.profile = $.jStorage.get("profile");
  };

  this.changecontent = function (page) {
    this.init();
    var data = this;
    data.content = "views/content/" + page + ".html";
    return data;
  };

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
      }, 300, 'linear');
  };

  this.init();

});
