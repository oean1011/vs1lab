/* Dieses Skript wird ausgeführt, wenn der Browser index.html lädt. */

// Befehle werden sequenziell abgearbeitet ...

/**
 * "console.log" schreibt auf die Konsole des Browsers
 * Das Konsolenfenster muss im Browser explizit geöffnet werden.
 */
console.log("The script is going to start...");

// Es folgen einige Deklarationen, die aber noch nicht ausgeführt werden ...

// Hier wird die verwendete API für Geolocations gewählt
// Die folgende Deklaration ist ein 'Mockup', das immer funktioniert und eine fixe Position liefert.
GEOLOCATIONAPI = {
    getCurrentPosition: function (onsuccess) {
        onsuccess({
            "coords": {
                "latitude": 49.013790,
                "longitude": 8.390071,
                "altitude": null,
                "accuracy": 39,
                "altitudeAccuracy": null,
                "heading": null,
                "speed": null
            },
            "timestamp": 1540282332239
        });
    }
};

// Die echte API ist diese.
// Falls es damit Probleme gibt, kommentieren Sie die Zeile aus.
GEOLOCATIONAPI = navigator.geolocation;

/**
 * GeoTagApp Locator Modul
 */
var gtaLocator = (function GtaLocator(geoLocationApi) {

    // Private Member

    /**
     * Funktion spricht Geolocation API an.
     * Bei Erfolg Callback 'onsuccess' mit Position.
     * Bei Fehler Callback 'onerror' mit Meldung.
     * Callback Funktionen als Parameter übergeben.
     */
    var tryLocate = function (onsuccess, onerror) {
        if (geoLocationApi) {
            geoLocationApi.getCurrentPosition(onsuccess, function (error) {
                var msg;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        msg = "User denied the request for Geolocation.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        msg = "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        msg = "The request to get user location timed out.";
                        break;
                    case error.UNKNOWN_ERROR:
                        msg = "An unknown error occurred.";
                        break;
                }
                onerror(msg);
            });
        } else {
            onerror("Geolocation is not supported by this browser.");
        }
    };

    // Auslesen Breitengrad aus der Position
    var getLatitude = function (position) {
        return position.coords.latitude;
    };

    // Auslesen Längengrad aus Position
    var getLongitude = function (position) {
        return position.coords.longitude;
    };

    // Hier Google Maps API Key eintragen
    var apiKey = "Uatl5k3XOd39HmA0UbKqVAPGqBC2nuzv";

    /**
     * Funktion erzeugt eine URL, die auf die Karte verweist.
     * Falls die Karte geladen werden soll, muss oben ein API Key angegeben
     * sein.
     *
     * lat, lon : aktuelle Koordinaten (hier zentriert die Karte)
     * tags : Array mit Geotag Objekten, das auch leer bleiben kann
     * zoom: Zoomfaktor der Karte
     */
    var getLocationMapSrc = function (lat, lon, tags, zoom) {
        zoom = typeof zoom !== 'undefined' ? zoom : 10;

        if (apiKey === "YOUR_API_KEY_HERE") {
            console.log("No API key provided.");
            return "images/mapview.jpg";
        }

        var tagList = "&pois=You," + lat + "," + lon;
        if (tags !== undefined) tags.forEach(function (tag) {
            tagList += "|" + tag.name + "," + tag.latitude + "," + tag.longitude;
        });

        var urlString = "https://www.mapquestapi.com/staticmap/v4/getmap?key=" +
            apiKey + "&size=600,400&zoom=" + zoom + "&center=" + lat + "," + lon + "&" + tagList;

        console.log("Generated Maps Url: " + urlString);
        return urlString;
    };

    return { // Start öffentlicher Teil des Moduls ...

        // Public Member

        readme: "Zum updaten der Map über AJAX",

        refreshMap: function (latitudeNextt, longitudeNextt, taglistt) {
            var updateMap = getLocationMapSrc(latitudeNextt, longitudeNextt, taglistt, 12);
            console.log(latitudeNextt, longitudeNextt, taglistt);
            document.getElementById("result-img").setAttribute("src", updateMap);
        },

        readme: "Dieses Objekt enthält 'öffentliche' Teile des Moduls.",

        updateLocation: function () {
            var tags = [];
            var latiInForm = "";
            var longInForm = "";

            //Enthält etwas wenn die Seite mit /tagging POST-Request geladen wurde
            latiInForm = document.getElementById("text_field_latitude").value;
            longInForm = document.getElementById("text_field_longitude").value;

            //Enthält etwas wenn die Seite mit /discovery POST-Request geladen wurde
            if (latiInForm == "" && longInForm == "") {
                latiInForm = document.getElementById("latitudehidden").value;
                longInForm = document.getElementById("longitudehidden").value;
            }

            var erfolg = function (position) { //Callback für tryLocate
                console.log("wird ausgeführt");
                latiInForm = getLatitude(position);
                longInForm = getLongitude(position);

                document.getElementById("text_field_latitude").setAttribute("value", latiInForm);
                document.getElementById("text_field_longitude").setAttribute("value", longInForm);
                document.getElementById("latitudehidden").setAttribute("value", latiInForm);
                document.getElementById("longitudehidden").setAttribute("value", longInForm);

                var newURL = getLocationMapSrc(latiInForm, longInForm, tags, 12);
                document.getElementById("result-img").setAttribute("src", newURL);
            }

            var keinErfolg = function (msg) { //Callback für tryLocate
                console.log(msg);
            }

            //Wenn leer = Kein POST-Request, Koordinaten müssen bestimmt werden
            if (latiInForm == "" && longInForm == "") {
                tryLocate(erfolg, keinErfolg);
            } else {
                var taglist_json = document.getElementById("result-img").getAttribute("data-tags");
                tags = JSON.parse(taglist_json);

                var newURL = getLocationMapSrc(latiInForm, longInForm, tags, 12);
                document.getElementById("result-img").setAttribute("src", newURL);
            }
        }


    }; // ... Ende öffentlicher Teil
})(GEOLOCATIONAPI);

/**
 * $(function(){...}) wartet, bis die Seite komplett geladen wurde. Dann wird die
 * angegebene Funktion aufgerufen. An dieser Stelle beginnt die eigentliche Arbeit
 * des Skripts.
 */
$(function () {
    gtaLocator.updateLocation();

    var submitTag = document.getElementById("submit-tagging");
    var submitDiscovery = document.getElementById("button-search");

    submitTag.addEventListener("click", function () {
        event.preventDefault();

        var ajax = new XMLHttpRequest();
        ajax.onreadystatechange = function () {
            if (ajax.readyState === 4 && ajax.status === 200) { //Map und Taglist updaten nach Response
                var responseItems = JSON.parse(ajax.responseText);
                gtaLocator.refreshMap(responseItems.latitudeNext, responseItems.longitudeNext, responseItems.taglist);
                
                document.getElementById("results").innerHTML = ''; //Taglist leeren
                responseItems.taglist.forEach(function(gtag) {
                    var ul = document.getElementById("results");
                    
                    var li = document.createElement("li"); //Neues Element erstellen
                    li.appendChild(document.createTextNode(gtag.name + " (" + gtag.latitude + ", " + gtag.longitude + ") " + gtag.hashtag));
                    ul.appendChild(li); //An Liste fügen
                });
            }
        };
        ajax.open("POST", "/tagging", true); //true bedeutet asynchroner Request

        class GeoTag {
            constructor(latitude, longitude, name, hashtag) {
                this.latitude = latitude;
                this.longitude = longitude;
                this.name = name;
                this.hashtag = hashtag;
            }
        }

        var newLat = document.getElementById("text_field_latitude").value; //TODO: Nimmt warum auch immer default-values beim Anfangsladen der Seite
        var newLong = document.getElementById("text_field_longitude").value;
        var newName = document.getElementById("text_field_name").value;
        var newHashtag = document.getElementById("text_field_hashtag").value;

        var newTag = new GeoTag(newLat, newLong, newName, newHashtag);
        var jsonTag = JSON.stringify(newTag);


        ajax.setRequestHeader("Content-Type", "application/json");
        ajax.setRequestHeader("Data-Type", "json");

        ajax.send(jsonTag);
    });

    submitDiscovery.addEventListener("click", function () { //TODO: Funktioniert noch nicht
        event.preventDefault();
        var ajax2 = new XMLHttpRequest();
        ajax2.onreadystatechange = function () { //Map updaten nach Response
            if (ajax2.readyState === 4 && ajax2.status === 200) {
                var responseItems = JSON.parse(ajax2.responseText);
                
                document.getElementById("results").innerHTML = ''; //Taglist updaten
                responseItems.taglist.forEach(function(gtag) {
                    var ul = document.getElementById("results");
                    
                    var li = document.createElement("li");
                    li.appendChild(document.createTextNode(gtag.name + " (" + gtag.latitude + ", " + gtag.longitude + ") " + gtag.hashtag));
                    ul.appendChild(li);
                });

                if (responseItems.isTermEmpty == 1) {
                    gtaLocator.refreshMap(responseItems.hiddenLatNext, responseItems.hiddenLongNext, responseItems.taglist);
                } else {
                    //Falls Searchterm vorhanden gewesen, dann nimm ersten, übereinstimmenden Tag als Zentrum
                    gtaLocator.refreshMap(responseItems.taglist[0].latitude, responseItems.taglist[0].longitude, responseItems.taglist); 
                }
            }
        };

        var searchname = document.getElementById("searchterm").value;
        var searchlat = document.getElementById("latitudehidden").value;
        var searchlong = document.getElementById("longitudehidden").value;

        console.log("Sende searchterm:" + searchname);
        console.log("Sende lathidden:" + searchlat);
        console.log("Sende longhidden:" + searchlong);
 
        var params = "searchname=" + searchname + "&searchlat=" + searchlat + "&searchlong=" + searchlong;

        ajax2.open("GET", "/discovery?" + params, true);

        ajax2.send(null);
    });

});