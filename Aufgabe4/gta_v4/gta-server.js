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

var searchByRadiusWithId = function(latitude2, longitude2, closeTags) {
    for (index = 0; index < geoTags.length; index++) {
        if(geoTags[index].latitude - latitude2 <= range && geoTags[index].latitude - latitude2 >= -range) {
            if(geoTags[index].longitude - longitude2 <= range && geoTags[index].longitude - longitude2 >= -range) {
                closeTags.push([geoTags[index], "Location: /geotags/" + index]);
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

var searchByTermWithId = function(searchterm, closeTags) {
    for (index = 0; index < geoTags.length; index++) {
        if(geoTags[index].name.includes(searchterm)) {
            closeTags.push([geoTags[index], "Location: /geotags/" + index]);
        }
    }
};

var addTag = function(latitude, longitude, name, hashtag) {
    var newTag = new GeoTag(latitude, longitude, name, hashtag);
    geoTags.push(newTag);
};

var addTagWithId = function(latitude, longitude, name, hashtag) {
    var newTag = new GeoTag(latitude, longitude, name, hashtag);
    geoTags.push(newTag);
    return geoTags.length - 1;
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
    addTag(req.body.latitude, req.body.longitude, req.body.name, req.body.hashtag);

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

app.post('/discovery', function(req, res) { //macht jetzt nichts mehr?
    
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

app.get('/discovery', function(req, res) {

    //req.body enthält Daten aus dem Discovery-Formular beim Absenden
    closeTags = [];
    var isTermEmpty;

    if(req.query.searchname == "") {
        isTermEmpty = 1;
        searchByRadius(req.query.searchlat, req.query.searchlong, closeTags);
    } else {
        isTermEmpty = 0;
        console.log("term");
        searchByTerm(req.query.searchname, closeTags);

        if(closeTags.length == 0) {
            isTermEmpty = 1; //Falls nichts mit dem Suchbegriff gefunden wird, Karte mit unserem Standort laden
        }
    }

    res.send({
        isTermEmpty: isTermEmpty,
        hiddenLatNext: req.query.searchlat,
        hiddenLongNext: req.query.searchlong,
        taglist: closeTags
    });
});

app.post('/geotags', jsonParser, function(req, res) { 
    var newId = addTagWithId(req.body.latitude, req.body.longitude, req.body.name, req.body.hashtag);
    res.location('/geotags/' + newId);
    res.sendStatus(201);
});

app.get('/geotags', jsonParser, function(req, res) {
    var closeTags = [];

    if (req.body.searchterm != "" && req.body.searchterm != null) {
        searchByTermWithId(req.body.searchterm, closeTags);

        if (closeTags.length == 0) {
            res.sendStatus(406);
        } else {
            res.status(200).send({
                results: closeTags
            });
        }
    } else if (req.body.searchlatitude != "") {
        if (req.body.searchlongitude != "") {
            searchByRadiusWithId(req.body.searchlatitude, req.body.searchlongitude, closeTags);
    
            if (closeTags.length == 0) {
                res.sendStatus(404);
            } else {
                res.status(200).send({
                    results: closeTags
                });
            }
        }
    } else {
        res.sendStatus(400); //Not acceptable
    }
});

app.get('/geotags/:userId([0-9]+)', function(req, res) {
    if(geoTags.length > req.params.userId) {
        res.status(200).send({
            result: geoTags[req.params.userId]
        });
    } else {
        res.sendStatus(404);
    }
});

app.put('/geotags/:userId([0-9]+)', jsonParser, function(req, res) {
    if(geoTags.length > req.params.userId) {
        newTag = new GeoTag(req.body.latitude, req.body.longitude, req.body.name, req.body.hashtag);
        geoTags[req.params.userId] = newTag;

        res.status(200).send({
            result: geoTags[req.params.userId]
        });
    } else {
        res.sendStatus(404);
    }
});

app.delete('/geotags/:userId([0-9]+)', function(req, res) {
    if(geoTags.length > req.params.userId) {
        removeTag(req.params.userId);

        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
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
