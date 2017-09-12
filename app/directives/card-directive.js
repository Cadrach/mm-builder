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

angular.module('appMmBuilder.card-directive', [])
.directive('cardAutosizer', ['$window', '$timeout', function($window, $timeout) {
    return {
        controller: function ($element) {

            var parentWidth = $element.parent().width();
            var cards = [];

            this.addCardScope = function(s){
                cards.push(s);
                autosize();
            }

            this.removeCardScope = function(s){
                cards.splice(cards.indexOf(s), 1);
                autosize();
            }

            function autosize(){
                var w = (parentWidth / 10 - 17);
                if(w<61){
                    w = (parentWidth / 5 - 17);
                }

                cards.forEach(function(card){
                    card.setWidth(w);
                })
            }
            angular.element($window).bind('resize', function(){
                parentWidth = $element.parent().width();
                autosize();
            });
            $timeout(autosize);
        },
        controllerAs: 'autosizer'
    }
}])
.directive('card', ['$window', '$timeout', '$rootScope', function($window, $timeout, $rootScope) {
    return {
        link: function(scope, elmt, attributes, autosizer){
            scope.ratio =  1.185185185185185;
            scope.width = scope.width ? scope.width:61;
            scope.height = scope.width * scope.ratio;
            scope.fontSize = 12;
            scope.styles = {};
            scope.codeVersion = $rootScope.codeVersion;

            //Set width of the card
            scope.setWidth = function(width){
                scope.width = width;
                scope.height = Math.floor(scope.width * scope.ratio);
                scope.fontSize = scope.height * 0.16667;
                updateStyles();
            }

            //If an autosizer is present, register against it
            if(autosizer){
                autosizer.addCardScope(scope);
                scope.$on('$destroy',function(){
                    autosizer.removeCardScope(scope);
                })
            }

            function updateStyles(){
                scope.styles = {
                    width: scope.width + 'px',
                    height: scope.height + 'px',
                    fontSize: Math.round(scope.fontSize) + 'px',
                    marginTop: Math.round(scope.height * .19) + 'px'
                }
                if(scope.card){
                    scope.styles['background-image'] = 'url(' + scope.card.image + ')';
                }
                else{
                    scope.card = {rarity: 'placeholder'};
                }
            }

            //Bootstrap
			updateStyles();
        },
        //Attempt to locate the required controller by searching the element's parents, or pass null to the link fn if not found
        //https://docs.angularjs.org/api/ng/service/$compile#-require-
        require: '?^^cardAutosizer',
        scope: {
            card: '=?value', // <-- the '?' makes it optional
            width: '@'
        },
        templateUrl: 'app/templates/directive-card.html?v=' + codeVersion
    }
}]);
