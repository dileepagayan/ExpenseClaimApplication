(function () {
    'use strict';

    angular
        .module('ExpenseClaimApproval')
        .factory('applicationLoadService', applicationLoadService);

    applicationLoadService.$inject = ['$q', 'sharePointService'];

    function applicationLoadService($q, sharePointService) {

        var deferred = $q.defer();
        var hostweburl;
        var appweburl;

        //Get the URI decoded URLs. 
        hostweburl = decodeURIComponent(getQueryStringParameter("SPHostUrl"));
        appweburl = decodeURIComponent(getQueryStringParameter("SPAppWebUrl"));
        var scriptbase = hostweburl + "/_layouts/15/";

        ExecuteOrDelayUntilScriptLoaded(function () {
            //$.getScript(scriptbase + "SP.Runtime.js",
            //    function () {
            //    }
            //);


            $.getScript(scriptbase + "SP.js",
                function () {
                    $.getScript(scriptbase + "SP.RequestExecutor.js", function () {
                        checkGroups();
                        deferred.resolve();
                    });
                }
            );
        }, "sp.js");

        // Function to retrieve a query string value.  
        function getQueryStringParameter(paramToRetrieve) {
            var params = document.URL.split("?")[1].split("&");
            var strParams = "";

            for (var i = 0; i < params.length; i = i + 1) {
                var singleParam = params[i].split("=");
                if (singleParam[0] == paramToRetrieve)
                    return singleParam[1];
            }
        }

        function checkGroups() {
            var admin = false, approvers = false, members = false, paymentHandler = false ;

            sharePointService.getSPGroups().then(function success(data) {
                $.each(data, function (index, element) {
                    if (element.Title == "Admin") {
                        admin = true; 
                    } else if (element.Title == "Members") {
                        members = true;
                    } else if (element.Title == "Approvers") {
                        approvers = true;
                    } else if (element.Title == "PaymentHandlers") {
                        paymentHandler == true;
                    }
                });

                if (admin == false) {
                    var options = {};
                    options.title = "Admin";
                    options.description = "Group of administrators on the board";
                    createGroup(options);
                }

                if (approvers == false) {
                    var options = {};
                    options.title = "Approvers";
                    options.description = "Group of the approvers";
                    createGroup(options);
                }

                if (members == false) {
                    var options = {};
                    options.title = "Members";
                    options.description = "Group of members on the company";
                    createGroup(options);
                }

                if (paymentHandler == false) {
                    var options = {};
                    options.title = "PaymentHandlers";
                    options.description = "Group of payment handlers";
                    createGroup(options);
                }
            },
            function fail() {
                alert("group init failed");
            }
            )};


        function createGroup(options) {
            return sharePointService.createSPGroup(options);
        }






        return deferred.promise;

    }
})();