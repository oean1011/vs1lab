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

/**
 * Modul für 'In-Memory'-Speicherung von GeoTags mit folgenden Komponenten:
 * - Array als Speicher für Geo Tags.
 * - Funktion zur Suche von Geo Tags in einem Radius um eine Koordinate.
 * - Funktion zur Suche von Geo Tags nach Suchbegriff.
 * - Funktion zum hinzufügen eines Geo Tags.
 * - Funktion zum Löschen eines Geo Tags.
 */

var geoTags = [];
var closeTags = [];
var range = 1;

var searchByRadius = function(latitude2, longitude2, closeTags) {
    for (index = 0; index < geoTags.length; index++) {
        if(geoTags[index].latitude - latitude2 <= range && geoTags[index].latitude - latitude2 >= -range) {
            if(geoTags[index].longitude - longitude2 <= range && geoTags[index].longitude - longitude2 >= -range) {
                closeTags.push(geoTags[index]);
            }
        }
    }
};

var searchByTerm = function(searchterm, closeTags) {
    for (index = 0; index < geoTags.length; index++) {
        if(geoTags[index].name.includes(searchterm)) {
            closeTags.push(geoTags[index]);
        }
    }
};

var addTag = function(latitude, longitude, name, hashtag) {
    var newTag = new GeoTag(latitude, longitude, name, hashtag);
    geoTags.push(newTag);
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

var jsonParser = bodyParser.json();

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

app.post('/tagging', jsonParser, function(req, res) {

    //req.body enthält Daten aus dem Tagging-Formular beim Absenden
    addTag(req.body.latitude, req.body.longitude, req.body.tagname, req.body.taghashtag);

    closeTags = [];
    searchByRadius(req.body.latitude, req.body.longitude, closeTags);

    res.send({
        latitudeNext: req.body.latitude,
        longitudeNext: req.body.longitude,
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

app.post('/discovery', function(req, res) {
    
    //req.body enthält Daten aus dem Discovery-Formular beim Absenden
    closeTags = [];

    if(req.body.searchterm == "") {
        searchByRadius(req.body.latitudehidden, req.body.longitudehidden, closeTags);
    } else {
        searchByTerm(req.body.searchterm, closeTags);
    }

    res.render('gta', {
        hiddenLatNext: req.body.latitudehidden,
        hiddenLongNext: req.body.longitudehidden,
        term: req.body.searchterm,
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
