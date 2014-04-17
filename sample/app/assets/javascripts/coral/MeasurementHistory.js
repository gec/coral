/**
 * Copyright 2014 Green Energy Corp.
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
 *
 * Author: Flint O'Brien
 */
define( 'coral/MeasurementHistory',
[
], function() {
    'use strict';

    /**
     * Manage one subscription for a single point which may have multiple subscribers.
     * Update the subscribers associated with this point when new measurements come in.
     *
     * @param point
     * @constructor
     */
    function MeasurementHistory( subscription, point)  {
        this.subscription = subscription
        this.point = point
        this.subscriptionId = null
        this.subscribers = [] // {subscriber:, notify:} -- subscribers that display this point
        this.measurements = []
    }

    MeasurementHistory.prototype.subscribe = function( scope, timeFrom, limit, subscriber, notify) {

        this.subscribers.push( {subscriber: subscriber, notify: notify})
        if( this.subscriptionId)
            return this.measurements

        var self = this,
//            now = new Date().getTime(),
//            timeFrom = now - 1000 * 60 * 60,  // 1 Hour
//            limit = 500,
            json = {
                subscribeToMeasurementHistory: {
                    "pointId": this.point.id,
                    "timeFrom": timeFrom,
                    "limit": limit
                }
            }


        this.subscriptionId = this.subscription.subscribe( json, scope,
            function( subscriptionId, type, data) {

                switch( type) {
                    case 'pointWithMeasurements': self.onPointWithMeasurements( data); break;
                    case 'measurements': self.onMeasurements( data); break;
                    default:
                        console.error( "MeasurementHistory unknown message type: '" + type + "'")
                }
            },
            function( error, message) {
                console.error( "MeasurementHistory.subscribe " + error + ", " + message)
            }
        )

        return this.measurements
    }

    MeasurementHistory.prototype.unsubscribe = function( subscriber) {
        this.removeSubscriber( subscriber)

        if( this.subscribers.length === 0 && this.subscriptionId) {
            try {
                this.subscription.unsubscribe( this.subscriptionId);
            } catch( ex) {
                console.error( "Unsubscribe measurement history for " + this.point.name + " exception " + ex)
            }
            this.subscriptionId = null;
            this.measurements = []
        }

    }


    MeasurementHistory.prototype.onPointWithMeasurements = function( pointWithMeasurements) {
        var self = this,
            measurements = pointWithMeasurements.measurements

        console.log( "onPointWithMeasurements point.name " + this.point.name + " measurements.length=" + measurements.length)
        measurements.forEach( function( m) {
            self.onMeasurement( m)
        })
        this.notifySubscribers()
    }

    MeasurementHistory.prototype.onMeasurements = function( pointMeasurements) {
        var self = this
        console.log( "onMeasurements point.name " + this.point.name + " measurements.length=" + pointMeasurements.length)
        pointMeasurements.forEach( function( m) {
            self.onMeasurement( m.measurement)
        })
        this.notifySubscribers()
    }

    MeasurementHistory.prototype.onMeasurement = function( measurement) {

        var value = parseFloat( measurement.value)
        if( ! isNaN( value)) {
            measurement.value = value
            measurement.time = new Date( measurement.time)
            //console.log( "onMeasurement measurements " + this.point.name + " " + measurement.time + " " + measurement.value)
//            this.point.measurements.push( measurement)
            this.measurements.push( measurement)
        } else {
            console.error( "onMeasurement " + this.point.name + " time=" + measurement.time + " value='" + measurement.value + "' -- value is not a number.")
        }
    }

    MeasurementHistory.prototype.notifySubscribers = function() {
        this.subscribers.forEach( function( s) {
            if( s.notify)
                s.notify.call( s.subscriber)
        })

//        this.subscribers.forEach( function( subscriber) {
//            subscriber.traits.update( "trend")
//        })
    }

    MeasurementHistory.prototype.removeSubscriber = function( subscriber) {

        var s,
            i = this.subscribers.length

        while( i > 0) {
            i--
            s = this.subscribers[i]
            if( s.subscriber === subscriber) {
                this.subscribers.splice(i, 1);
                return
            }
        }
    }

    return MeasurementHistory

});// end RequireJS define