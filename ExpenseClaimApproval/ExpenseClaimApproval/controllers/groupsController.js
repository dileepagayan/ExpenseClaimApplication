(function () {
    'use strict';

    angular
        .module('ExpenseClaimApproval')
        .controller('groupsController', groupsController);

    groupsController.$inject = ['$location', 'groupService', '$scope'];

    function groupsController($location, dashboardSharePointService, $scope) {

        $scope.getAllGroups = function () {
            groupService.getSPGroups().then(function (state) {
                $scope.groups = state;
            })
        }


        $scope.createGroup = function () {
            groupService.createGroup().then(function (state) {
                $scope.results = state;
            })
        }
    }
})();
