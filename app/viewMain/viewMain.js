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
.controller('ViewMainCtrl', ['$scope', '$timeout', '$uibModal', '$location', 'localStorageService', 'growl', 'cards',
    function($scope, $timeout, $uibModal, $location, localStorageService, growl, cards) {

        var cardUniqueId = "ID";

        $scope.cards = angular.copy(cards);
        $scope.costs = _.range(0,10);
        $scope.types = {Minion: 'Minion', Spell: 'Spell', building: 'Building'};
        $scope.cardsById = _.indexBy(cards, cardUniqueId);
        $scope.selection = [];
        $scope.filters = {};
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

        /**
         * UpdateStats
         */
        function updateStats(){
            //Stored stats
            $scope.stats = {
                dpsAir: 0,
                dpsGround: 0,
                dpsAirAOE: 0,
                dpsGroundAOE: 0,
                dpsBuilding: 0,

                costTotal: 0,
                costSpells: 0,
                costMinions: 0,
                costBuildings: 0,

                totalSpeed: 0,
                totalRange: 0,
                totalHealth: 0,
                totalCreatures: 0,
                totalCards: $scope.selection.length,
                totalRanged: 0,
                totalFlying: 0,

                typeBuildings: 0,
                typeMinions: 0,
                typeSpells: 0
            };

            //Update stored for each card in selection
            $scope.selection.forEach(function(s){
                var card = $scope.cardsById[s.id];

                //Manacost
                $scope.stats.costTotal+= card.manacost;

                if(card.type == 'building'){
                    $scope.stats.typeBuildings++;
                    $scope.stats.costBuildings+= card.manacost;
                }
                if(card.type == 'Spell'){
                    $scope.stats.typeSpells++;
                    $scope.stats.costSpells+= card.manacost;
                }
                if(card.type == 'Minion'){
                    //Totals
                    $scope.stats.typeMinions++;
                    $scope.stats.costMinions+= card.manacost;
                    $scope.stats.totalSpeed+= card.speed;
                    $scope.stats.totalRange+= card.isRanged ? card.range:0;
                    $scope.stats.totalHealth+= card.health * card.count;
                    $scope.stats.totalCreatures+= card.count;
                    $scope.stats.totalRanged+=card.isRanged?1:0;
                    $scope.stats.totalFlying+=card.Flying?1:0;

                    //DPS
                    var dps =  card.dps * card.count;
                    if(card.HitsFlying){$scope.stats.dpsAir+= dps;}
                    if( ! card.AttackOnlyStationary){$scope.stats.dpsGround+= dps;}
                    if(card.isAOE && card.HitsFlying){$scope.stats.dpsAirAOE+= dps;}
                    if(card.isAOE && ! card.AttackOnlyStationary){$scope.stats.dpsGroundAOE+= dps;}
                    $scope.stats.dpsBuilding+= dps;
                }
            })

        }

        /**
         * Update page URL when deck changes
         */
        function updateUrl(){
            $location.search('deck', btoa(_.map($scope.selection, function(v){return v.id.toString()}).join('|')));
        }

        /**
         * Function run when changing filters
         */
        function onFilterChange(){
            //Reset cards list
            $scope.cards = angular.copy(cards);

            //Cleanup filters
            _.each($scope.filters, function(v, k){
                //Filters to clean up
                if(_.isArray(v) && !v.length){delete $scope.filters[k];}
                if(_.isBoolean(v) && !v){delete $scope.filters[k];}
                if(_.isString(v) && !v){delete $scope.filters[k];}
            });

            //Filter if required
            if( !_.isEmpty($scope.filters)){
                var filters = $scope.filters;
                $scope.cards = _.filter($scope.cards, function(card){
                    //Find any filters that is not match, if any found return FALSE to filter out the card
                    var show = !_.find(filters, function(v, k){
                        //We return TRUE as soon as a filters is NOT valid => breaks the "find"

                        //Arrays
                        if(_.isArray(v) && v.indexOf(card[k])<0){return true;}

                        //Booleans
                        if(_.isBoolean(v) && card[k]!=v){return true;}

                        //String
                        if(_.isString(v) && !card[k].match(new RegExp(v, 'i'))){return true;}
                    })

                    //if( ! show){console.log(card);}
                    return show;
                });
            }
        }

        /**
         * Add a card to the selection
         * @param card
         */
        $scope.selectCard = function(card){
            var id = card[cardUniqueId];

            //Group by count
            var groupBy = _.chain($scope.selection).groupBy('id').mapObject(function(a){return a.length}).value();

            //Update wildcard number
            var hasMaxWildCard = $scope.wildCardsUsed >= $scope.wildCardsMax;

            //Verification before adding the card
            if($scope.selection.length >= 10){
                growl.error('10 Cards limit reached');
                return;
            }
            else if(hasMaxWildCard && groupBy[id]){
                growl.error('2 Wildcards maximum allowed');
                return;
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

            //Update our URL & stats
            updateUrl();
            updateStats();
        }

        /**
         * Remove card at selected position
         * @param position
         */
        $scope.removeCard = function(position){
            $scope.selection.splice(position, 1);
            updateWildCardUsed();
            updateUrl();
            updateStats();
        }

        $scope.toggleFilterArrayValue = function(property, value){
            if( ! $scope.filters[property]){
                $scope.filters[property] = [value];
            }
            else if($scope.filters[property].indexOf(value)>=0){
                $scope.filters[property].splice($scope.filters[property].indexOf(value), 1);
            }
            else{
                $scope.filters[property].push(value);
            }
        }

        /**
         * EVENTS
         */
        $scope.$watch('filters', onFilterChange, true);

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
            growl.error('Unable to read passed deck');
            console.error("UNABLE TO READ DECK: " + e);
        }
    }]);