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
    $routeProvider.when('/', {
        templateUrl: 'app/viewMain/viewMain.html?v=' + codeVersion,
        controller: 'ViewMainCtrl',
        reloadOnSearch: false,
        resolve: {
            cards: function($http){
                return $http.get('sources/cards.json').then(function(d){return d.data});
            }
        }
    });
}])
.controller('ViewMainCtrl', ['$scope', '$timeout', '$uibModal', '$location', 'localStorageService', 'cards',
    function($scope, $timeout, $uibModal, $location, localStorageService, cards) {

        var cardUniqueId = "ID";

        $scope.cards = cards;
        $scope.cardsById = _.indexBy(cards, cardUniqueId);
        $scope.selection = [];
        $scope.wildCardsMax = 2;
        $scope.wildCardsUsed = 0;

        /**
         * Compute the number of WildCard used
         */
        function updateWildCardUsed(){
            //Update Wildcard used number
            var newGroupBy = _.chain($scope.selection).groupBy('id').mapObject(function(a){return a.length}).value();
            $scope.wildCardsUsed = _.reduce(newGroupBy, function(memo, v){return v-1+memo;}, 0);
        }

        function updateUrl(){
            $location.search('deck', btoa(_.map($scope.selection, function(v){return v.id.toString()}).join('|')));
        }

        $scope.selectCard = function(card){
            var id = card[cardUniqueId];

            //Group by count
            var groupBy = _.chain($scope.selection).groupBy('id').mapObject(function(a){return a.length}).value();

            //Update wildcard number
            var hasMaxWildCard = $scope.wildCardsUsed >= $scope.wildCardsMax;

            //Verification before adding the card
            if($scope.selection.length >= 10){
                throw "MAX CARDS";
            }
            else if(hasMaxWildCard && groupBy[id]){
                throw "MAX WILDCARDS";
            }

            //Add the card
            $scope.selection.push({id:id});

            //Update usage of wildcards
            updateWildCardUsed();

            //Sort the card list
            $scope.selection.sort(function(a,b){
                a = $scope.cardsById[a.id];
                b = $scope.cardsById[b.id];
                if(a.manacost>b.manacost) return 1;
                if(a.manacost<b.manacost) return -1;
                if(a.name>b.name) return 1;
            })

            //Update our URL
            updateUrl();
        }

        $scope.removeCard = function(position){
            $scope.selection.splice(position, 1);
            updateWildCardUsed();
            updateUrl();
        }

        /**
         * BOOTSTRAP
         */
        var deck = $location.search().deck;
        try{
            if(deck){
                atob(deck).split('|').forEach(function(id){
                    $scope.selectCard($scope.cardsById[id]);
                });
            }
        }catch(e){
            console.error("UNABLE TO READ DECK: " + e);
        }
    }]);