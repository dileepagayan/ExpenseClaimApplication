(function () {
    'use strict';

    angular
        .module('ExpenseClaimApproval')
        .controller('dashboardController', dashboardController);

    dashboardController.$inject = ['$location', 'dashboardSharePointService', '$scope'];

    function dashboardController($location, dashboardSharePointService, $scope) {

        $scope.admin = function () {
            dashboardSharePointService.getSPGroups().then(function (state) {
                $scope.groups = state;
            })
        }


        $scope.createGroup = function () {
            dashboardSharePointService.createGroup().then(function (state) {
                $scope.results = state;
            })
        }
    }
})();
