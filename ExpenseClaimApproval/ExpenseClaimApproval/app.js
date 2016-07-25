/// <reference path="views/Customers/customers.html" />
/// <reference path="views/Customers/customers.html" />
/// <reference path="views/Customers/customers.html" />

var app = angular.module('ExpenseClaimApproval', [
      'ngRoute',
      'ngMaterial',
      'ui.router',
      'angular-loading-bar',
      'sp-peoplepicker',
      'lfNgMdFileInput',
      'datatables',
      'angularTrix',
      'ngMessages'
]);


app.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/dashboard');

    $stateProvider
     .state('dashboard', {
         templateUrl: 'views/dashboard/dashboard.html',
         controller: 'dashboardController',
         url: '/dashboard',
         resolve: {
             sharePointLoad: 'applicationLoadService'
         }
     }).state('groups', {
         templateUrl: 'views/admin/groups.html',
         controller: 'groupsController',
         url: '/groups',
         resolve: {
             sharePointLoad: 'applicationLoadService'
         }
     });
});






