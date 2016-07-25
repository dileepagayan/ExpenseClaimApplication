(function () {
    'use strict';

    angular
        .module('ExpenseClaimApproval')
        .factory('helperService', helperService);

    helperService.$inject = ['$http'];

    function helperService($http) {

        return {
            parse: parse,
            parseArray: parseArray
        }

        function parse(obj, fields) {
            var robj = {};
            $.each(obj, function (key, value) {
                if (fields[key] !== undefined)
                    robj[fields[key]] = value;
            });

            return robj;
        }

        function parseArray(arr, fields) {

            var narry = [];
            for (var i in arr) {
                narry.push(parse(arr[i], fields));
            }
            return narry;
        }
    }
})();