


var app = {
    timerId: null,
    timerInterval: 75,

    // Start a timer to update ID periodically
    //
    // app.startTimer('timestamp')
    startTimer: function(elementId) {
        var element = document.getElementById(elementId);

        app.timerId = setInterval(
            function() {
                var dt = new Date();

                // var hour = app.util.padLeadingZero(dt.getHours());
                var min = app.util.padLeadingZero(dt.getMinutes());
                var sec = app.util.padLeadingZero(dt.getSeconds());
                var ms = app.util.padLeadingZero(app.util.twoDigitsMilliseconds(dt));
                var str = min + ':' + sec + '.' + ms;

                element.innerHTML = str;
            },
            app.timerInterval
        );
    },

    util: {
        padLeadingZero: function(num) {
            var str = String(num);

            switch (str.length) {
            case 0:
                return '00';
            case 1:
                return '0' + str;
            default:
                return str;
            }
        },

        twoDigitsMilliseconds: function(dt) {
            var ms = dt.getMilliseconds();
            var digits2 = Math.round(ms / 10);

            return 100 == digits2 ? 0 : digits2;
        },
    },

    // doc = app.getStravaDocument('#gpxdata')
    //
    getStravaDocument: function(scriptTagId) {
        var data = $(scriptTagId).text();
        var parser = new DOMParser();
        return parser.parseFromString(data.trim(), 'text/xml');
    },

    // points = app.getStravaPoints(doc)
    //
    getStravaPoints: function(doc) {
        var nodes = doc.getElementsByTagName('trkpt');
        var points = [];
        var getAttributeValue = function(node, attribName) {
            return node.attributes[attribName].value;
        };
        var getChildNodeValue = function(node, tagName) {
            var subNode = node.getElementsByTagName(tagName);
            return subNode[0].childNodes[0].nodeValue;
        };

        var ii;
        var node;
        var numNodes = nodes.length;
        for (ii = 0; ii < numNodes; ii++) {
            node = nodes[ii];

            points.push(
                {
                    lat: Number(getAttributeValue(node, 'lat')),
                    lon: Number(getAttributeValue(node, 'lon')),
                    ele: Number(getChildNodeValue(node, 'ele')),
                    time: new Date(getChildNodeValue(node, 'time')),
                }
            );
        }

        return points;
    },

    // distances = app.getDistances(points)
    //
    getDistances: function(points) {
        var distances = [];
        var numPoints = points.length;

        var ii;
        var pt1, pt2;

        var meters;
        var seconds;

        var totalDistance = 0.0;
        var totalTime = 0.0;

        for (ii = 1; ii < numPoints; ii++) {
            pt1 = points[ii - 1];
            pt2 = points[ii];

            meters = app.distance(pt1.lat, pt1.lon, pt2.lat, pt2.lon);
            totalDistance += meters;

            seconds = (pt2.time - pt1.time) / 1000.0;	// ms to seconds
            totalTime += seconds;

            distances.push({
                distance: meters,
                seconds: seconds,
                pace: app.pace(meters, seconds),

                totalDistance: totalDistance,
                totalTime: totalTime,
                averagePace: (totalTime != 0 ?
                              app.pace(totalDistance, totalTime) :
                              NaN),
            });
        }

        return distances;
    },

    // Haversine formula - http://stackoverflow.com/questions/14560999/using-the-haversine-formula-in-javascript
    //
    distance: function(lat1, lon1, lat2, lon2) {
        var R = 6371000; // meters

        var dLat = app.toRad(lat2 - lat1);
        var dLon = app.toRad(lon2 - lon1);
        var a = Math.pow(Math.sin(dLat/2), 2) +
            Math.cos(app.toRad(lat1)) * Math.cos(app.toRad(lat2)) *
            Math.pow(Math.sin(dLon/2), 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c;

        return d;
    },

    // expressed as minutes per mile when given meters per second
    //
    // miles_per_second = meters/seconds / meters_per_mile
    // miles_per_minute = miles_per_second * seconds_per_minute
    //
    // seconds_per_mile = seconds/meters * meters_per_mile
    // minutes_per_mile = seconds_per_mile / seconds_per_minute
    pace: function(meters, seconds) {
        var meters_per_mile = 1609.34;
        var seconds_per_minute = 60;

        var seconds_per_mile = seconds / meters * meters_per_mile;
        var minutes_per_mile = seconds_per_mile / seconds_per_minute;

        return minutes_per_mile;
    },

    toRad: function(x) {
        return x * Math.PI / 180;
    },

};


