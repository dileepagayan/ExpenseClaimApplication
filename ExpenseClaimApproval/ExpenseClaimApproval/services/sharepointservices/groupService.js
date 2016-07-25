(function () {
    'use strict';

    angular
        .module('ExpenseClaimApproval')
        .factory('groupService', groupService);

    groupService.$inject = ['$http', 'sharePointService'];

    function groupService($http, sharePointService) {
        var service = {
            getSPGroups: getSPGroups,
            createGroup: createGroup
        };

        return service;

        function getSPGroups() {
            return sharePointService.getSPGroups();
        }

        function createGroup(data) {
            var options = {};
            options.title = "Admin";
            options.description = "This is testing";
            return sharePointService.createSPGroup(options);
        }
    }
})();