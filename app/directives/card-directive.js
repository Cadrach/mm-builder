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

.directive('card', ['$window', '$timeout', function($window, $timeout) {
    return {
        link: function(scope, elmt){
            scope.ratio =  1.185185185185185;
            scope.width = scope.width ? scope.width:61;
            scope.height = scope.width * scope.ratio;
            scope.fontSize = 12;
            scope.styles = {};

            function updateStyles(){
                scope.styles = {
                    'background-image': 'url(' + scope.card.image + ')',
                    width: Math.round(scope.width) + 'px',
                    height: Math.round(scope.height) + 'px',
                    fontSize: Math.round(scope.fontSize) + 'px',
                    marginTop: Math.round(scope.height * .19) + 'px'
                }
            }

            function autoSize(){
                //try 1 line
                scope.width = (elmt.parent().width()) / 10 - 16;

                //If width is under 50, work on 2 lines
                if(scope.width < 61){
                    scope.width = (elmt.parent().width()) / 5 - 16;
                }

                scope.height = Math.floor(scope.width * scope.ratio);
                scope.fontSize = scope.height * 0.16667;

                updateStyles();

                scope.$digest();
            }

            //Observe resize if auto size
            if(scope.autoSize){
                angular.element($window).bind('resize', autoSize);
                $timeout(autoSize);
            }
            else{
                updateStyles();
            }
        },
        // restrict: 'E',
        // transclude: true,
        scope: {
            card: '=value',
            width: '@',
            autoSize: '@'
        },
        templateUrl: 'app/templates/directive-card.html?v=' + codeVersion
    }
}]);
