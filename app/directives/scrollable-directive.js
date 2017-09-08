angular.module('appMmBuilder.scrollable-directive', [])
.directive('scrollable', ['$window', '$timeout', function ($window, $timeout) {
    function link(scope, element) {
        function autosize(){
            var e = angular.element(element);
            e.css('height', 'calc(100vh - ' + (e.offset().top+10) + 'px)');
        }

        var scrollable = element.mCustomScrollbar(angular.extend({
            theme:"dark"
        }, scope.scrollable));

        if(typeof scope.autosizeFromTop !== 'undefined'){
            angular.element($window).resize(autosize);
            $timeout(autosize);
        }

        //Update scrollable
        // scope.$on('update-scrollable', function(){
        //     autosize();
        //     scrollable.mCustomScrollbar('update');
        // })
        setInterval(function(){
                autosize();
                scrollable.mCustomScrollbar('update');
        }, 1000)
    }

    return {
        restrict: 'A',
        scope: {
            scrollable: '=',
            autosizeFromTop: '@'
        },
        link: link
    }
}])