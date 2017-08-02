myApp.service('GoogleAdWordsService', function ($http, TemplateService, $state, toastr, $uibModal, NavigationService, $window) {
    // Conversion labels 
    var google_conversion_label = {
        'register-customer': "AJxaCK6dj3IQx4D5lAM"
    };
    // Basic settings for AdWords Conversion
    var googleTrackConversion = function (conversion_label) {
        $window.google_trackConversion({
            google_conversion_id: 849231943,
            google_conversion_language: "en",
            google_conversion_format: "3",
            google_conversion_color: "ffffff",
            google_conversion_label: google_conversion_label[conversion_label],
            // google_conversion_value: 0,
            google_remarketing_only: false
        });
    };
    return {
        sendRegisterCustomerConversion: function () {
            googleTrackConversion('register-customer');
        },
    };
});