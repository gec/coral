/**
 * Copyright 2013 Green Energy Corp.
 *
 * Licensed to Green Energy Corp (www.greenenergycorp.com) under one or more
 * contributor license agreements. See the NOTICE file distributed with this
 * work for additional information regarding copyright ownership. Green Energy
 * Corp licenses this file to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
define([
    'd3-traits'
], function() {

    'use strict';

/* Directives */


angular.module('ReefAdmin.directives', []).
    directive('chart', function() {
        return {
            restrict: 'A',
            scope: {
                chart: '=',  // chart type. use it later
                data: '=',    // binding to data in controller
                update: '='    // This directive will supply the update method
            },
            link: function (scope, elem, attrs) {

                var config = {
                    x1: function(d) { return d.time; },
                    y1: function(d) { return d.value; },
                    seriesData: function(s) { return s.measurements},
                    seriesLabel: function(s) { return s.name}
                }

                var chartEl = d3.select(elem.context)
                var theChart = d3.trait( d3.trait.chart.base, config )
                    .trait( d3.trait.scale.time, { axis: "x1"})
                    //.trait( d3.trait.scale.linear, { axis: "x1"})
                    .trait( d3.trait.scale.linear, { axis: "y1" })
                    .trait( d3.trait.chart.line,     { interpolate: "linear" })// linear, monotone
                    //.trait( d3.trait.control.brush, { axis: 'x1', target: chart, targetAxis: 'x1'})
//                    .trait( d3.trait.axis.time.month, { axis: "x1", ticks: 3})
                    .trait( d3.trait.axis.linear, { axis: "x1", ticks: 3})
                    .trait( d3.trait.axis.linear, { axis: "y1", extentTicks: true})
                    .trait( d3.trait.legend.series)
                    .trait( d3.trait.focus.tooltip)
                var brushSelection = chartEl.datum( scope.data)
                theChart.call( brushSelection)

                scope.update = function() {
                    //console.log( "ReefAdmin.directives chart update")
                    theChart.update( "trend")
                }

            }//,
//            controller: function($scope, $element, $attrs){
//                if( ! $scope.data)
//                    $scope.data = [
//                        { name: "series two", values: [{ x: 50, y: 50}, { x: 100, y: 100}] }
//                    ]
//            }
        };
    }).
    directive('draggable', function() {
        return {
            restrict: 'A',
            scope: {
                id: "="
            },
            link: function (scope, elem, attrs) {

                var el = elem.context
                el.draggable = true

                el.addEventListener(
                    'dragstart',
                    function(e) {
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('Text', scope.id);
                        this.classList.add('drag');
                        return false;
                    },
                    false
                );

                el.addEventListener(
                    'dragend',
                    function(e) {
                        this.classList.remove('drag');
                        return false;
                    },
                    false
                );

            }
        };
    }).
    directive('droppable', function() {
        return {
            scope: {
                dropped: '='
            },
            replace: false,
            link: function(scope, element) {
                // again we need the native object
                var el = element.context;
                el.addEventListener(
                    'dragover',
                    function(e) {
                        e.dataTransfer.dropEffect = 'move';
                        // allows us to drop
                        if (e.preventDefault) e.preventDefault();
                        this.classList.add('over');
                        return false;
                    },
                    false
                )
                el.addEventListener(
                    'dragenter',
                    function(e) {
                        this.classList.add('over');
                        return false;
                    },
                    false
                )

                el.addEventListener(
                    'dragleave',
                    function(e) {
                        this.classList.remove('over');
                        return false;
                    },
                    false
                )
                el.addEventListener(
                    'drop',
                    function(e) {
                        // Stops some browsers from redirecting.
                        if (e.stopPropagation) e.stopPropagation();

                        this.classList.remove('over');

                        var id = e.dataTransfer.getData('Text');
                        console.log( "------------- drop: " + id)
                        scope.dropped( id)

//                        var item = document.getElementById(e.dataTransfer.getData('Text'));
//                        this.appendChild(item);

                        return false;
                    },
                    false
                );
            }
        }
    })


/*angular.module('myApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]);*/

}); // end RequireJS define