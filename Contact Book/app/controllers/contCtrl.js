﻿(function () {
    angular.module('cbApp')
        .controller('contCtrl', contCtrl);
    contCtrl.$inject = ['$routeParams','$location','$scope','$timeout','$window','$filter','api','regexpConst','contactConst','logger'];
    function contCtrl($routeParams, $location, $scope, $timeout, $window, $filter, api, regexpConst, contactConst, logger) {
        var vm = this;
        var originalContact = {};
        init();
        function init() {
            vm.contactId = $routeParams.contId;
            vm.home = home;
            vm.update = update;
            vm.remove = remove;
            vm.reset = reset;
            vm.regExp = regexpConst;
            api.getContact(vm.contactId).then(onSuccess);
            resetFixed();
            $scope.$watchCollection('vm.contact', contChange);      /*Stops Angulars live update and only removes errors if fixed. If invalid again will not show until next submit*/
            function onSuccess(response) {
                vm.contact = response;
                originalContact = angular.merge({}, contactConst.CONTACTOBJ, vm.contact);       /*Unifies contact to what is present in API database.*/
            }
        }
        function home() {
            $location.path('/home');
        }
        function update() {
            resetFixed();
            if ($scope.editForm.$valid) {           /*Unifies all contacts. If user puts a value and erases it reads '' not null.*/
                for (var prop in vm.contact) {
                    if (vm.contact[prop] === '') {
                        vm.contact[prop] = null;
                    }
                }
                api.updateContact(vm.contact).then(onSucc);
            } else {
                if ($window.innerWidth < 768) {
                    logger.error({ from: 'contCtrl.js', message: 'Not a valid Form!' });        /*On samller screens, if user is scrolled at bottom they will not know there is an error if I didn't include this.*/
                    $timeout(logger.closeAlert, 5000);
                }
            }
            function onSucc(response) {
                originalContact = angular.merge({}, contactConst.CONTACTOBJ, vm.contact);
                vm.contact.updated_at = $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss', '+0000');   /*Updates view updated time (assuming server updates to UTC:+0 time) it will be off because of communication time.*/
            }
        }
        function remove(contactId){
            api.deleteContact(contactId).then(onSucc);
            function onSucc(response) {
                $location.path('/home');
            }
        }
        function reset() {
            vm.contact = angular.copy(originalContact);
            resetFixed();
            $scope.editForm.$setPristine();
            $scope.editForm.$setUntouched();
            $scope.editForm.$setValidity();
            $scope.editForm.$submitted = false;
        }
        function contChange(newContact) {
            var count = 0;
            if ($scope.editForm.firstName.$valid)
                vm.fixed.firstName = true;
            if ($scope.editForm.lastName.$valid)
                vm.fixed.lastName = true;
            if ($scope.editForm.url.$valid)
                vm.fixed.url = true;
            if ($scope.editForm.address.$valid)
                vm.fixed.address = true;
            if ($scope.editForm.city.$valid)
                vm.fixed.city = true;
            if ($scope.editForm.state.$valid)
                vm.fixed.state = true;
            if ($scope.editForm.zip.$valid)
                vm.fixed.zip = true;
            if ($scope.editForm.email.$valid)
                vm.fixed.email = true;
            if ($scope.editForm.phone.$valid)
                vm.fixed.phone = true;
            if ($scope.editForm.work.$valid)
                vm.fixed.work = true;
            for (var prop in vm.fixed) {
                if (vm.fixed[prop] === true)
                    count += 1;
            }
            if (count == 10)
                vm.fixedForm = true;
        }
        function resetFixed() {
            vm.fixed = {
                firstName: false,
                lastName: false,
                url: false,
                address: false,
                city: false,
                state: false,
                zip: false,
                email: false,
                phone: false,
                work: false
            };
            vm.fixedForm = false;
        }
    }
})();