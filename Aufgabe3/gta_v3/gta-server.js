/**
 * Template für Übungsaufgabe VS1lab/Aufgabe3
 * Das Skript soll die Serverseite der gegebenen Client Komponenten im
 * Verzeichnisbaum implementieren. Dazu müssen die TODOs erledigt werden.
 */

/**
 * Definiere Modul Abhängigkeiten und erzeuge Express app.
 */

var http = require('http');
//var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var express = require('express');

var app;
app = express();
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Setze ejs als View Engine
app.set('view engine', 'ejs');

/**
 * Konfiguriere den Pfad für statische Dateien.
 * Teste das Ergebnis im Browser unter 'http://localhost:3000/'.
 */

app.use(express.static(__dirname + '/public'));

/**
 * Konstruktor für GeoTag Objekte.
 * GeoTag Objekte sollen min. alle Felder des 'tag-form' Formulars aufnehmen.
 */

 class GeoTag {
     constructor(latitude, longitude, name, hashtag) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.name = name;
        this.hashtag = hashtag;
     }
 }

// TODO: CODE ERGÄNZEN

/**
 * Modul für 'In-Memory'-Speicherung von GeoTags mit folgenden Komponenten:
 * - Array als Speicher für Geo Tags.
 * - Funktion zur Suche von Geo Tags in einem Radius um eine Koordinate.
 * - Funktion zur Suche von Geo Tags nach Suchbegriff.
 * - Funktion zum hinzufügen eines Geo Tags.
 * - Funktion zum Löschen eines Geo Tags.
 */

// TODO: CODE ERGÄNZEN

var geoTags = [];
var closeTags = [];

var searchByRadius = function(latitude2, longitude2, closeTags) {
    
    for (index = 0; index < geoTags.length; index++) {
        if(geoTags[index].latitude - latitude2 <= 1 && geoTags[index].latitude - latitude2 >= -1) {
            if(geoTags[index].longitude - longitude2 <= 1 && geoTags[index].longitude - longitude2 >= -1) {
                closeTags.push(geoTags[index]);
            }
        }
    }
};

var searchByTerm = function(searchterm, closeTags) {
    for (index = 0; index < geoTags.length; index++) {
        if(geoTags[index].name == searchterm) {
            closeTags.push(geoTags[index]);
        }
    }
};

var addTag = function(latitude, longitude, name, hashtag) {
    var newTag = new GeoTag(latitude, longitude, name, hashtag);
    geoTags.push(newTag);

    console.log(geoTags);
};

var removeTag = function(index) {
    geoTags.splice(index, 1);
}

/**
 * Route mit Pfad '/' für HTTP 'GET' Requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests enthalten keine Parameter
 *
 * Als Response wird das ejs-Template ohne Geo Tag Objekte gerendert.
 */

app.get('/', function(req, res) {
    res.render('gta', {
        taglist: []
    });
});

/**
 * Route mit Pfad '/tagging' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'tag-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Mit den Formulardaten wird ein neuer Geo Tag erstellt und gespeichert.
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 */

// TODO: CODE ERGÄNZEN START

app.post('/tagging', function(req, res) {
    console.log(req.body);
    addTag(req.body.latitude, req.body.longitude, req.body.tagname, req.body.taghashtag);


    closeTags = [];

    searchByRadius(req.body.latitude, req.body.longitude, closeTags);

    res.render('gta', {
        taglist: closeTags
    });
});

/**
 * Route mit Pfad '/discovery' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'filter-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 * Falls 'term' vorhanden ist, wird nach Suchwort gefiltert.
 */

// TODO: CODE ERGÄNZEN

app.post('/discovery', function(req, res) {
    closeTags = [];

    if(req.body.searchterm == "") {
        searchByRadius(req.body.latitudehidden, req.body.longitudehidden, closeTags);
    } else {
        searchByTerm(req.body.searchterm, closeTags);
    }

    res.render('gta', {
        taglist: closeTags
    });
});

/**
 * Setze Port und speichere in Express.
 */

var port = 3000;
app.set('port', port);

/**
 * Erstelle HTTP Server
 */

var server = http.createServer(app);

/**
 * Horche auf dem Port an allen Netzwerk-Interfaces
 */

server.listen(port);
