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

// Declare app level module which depends on views, and components
angular.module('appMmBuilder', [
    'ngRoute',
    'ngAnimate',
    'ngSanitize',
    'ui.bootstrap',
    'ui.sortable',
    'ui.select',
    'angular-growl',

    'LocalStorageModule',

    'appMmBuilder.viewMain',
    'appMmBuilder.card-directive',
    'appMmBuilder.scrollable-directive'
]).
config(['$locationProvider', '$routeProvider', 'growlProvider', function($locationProvider, $routeProvider, growlProvider) {
  growlProvider.globalTimeToLive(5000);

  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/'});
}]).
run(['$rootScope', function($rootScope){
    $rootScope.codeVersion = codeVersion;
}])
;
