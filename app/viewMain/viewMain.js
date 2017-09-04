/**
 * League of Legends Item Set Editor
 * Copyright (C) 2016  Rachid Al-Owairdi
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Contact: https://github.com/Cadrach
 */
'use strict';

angular.module('appMmBuilder.viewMain', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/:hash?', {
        templateUrl: 'app/viewMain/viewMain.html?v=' + codeVersion,
        controller: 'ViewMainCtrl',
        resolve: {
            cards: function($http){
                return $http.get('sources/cards.json').then(function(d){return d.data});
            }
        }
    });
}])
.controller('ViewMainCtrl', ['$scope', '$timeout', '$uibModal', '$location', 'localStorageService', 'cards',
    function($scope, $timeout, $uibModal, $location, localStorageService, cards) {

        $scope.cards = cards;
}]);