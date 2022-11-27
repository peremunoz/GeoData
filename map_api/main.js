import './style.css';
import {Feature, Map, Overlay, View} from 'ol';
import {Circle, Fill, Stroke, Style} from "ol/style";
import {LineString, MultiLineString, Point} from 'ol/geom';
import {transform} from 'ol/proj';
import {OSM, Vector} from "ol/source";
import {Tile} from "ol/layer";
import {Zoom} from "ol/control";
import VectorLayer from "ol/layer/Vector";
import {toStringHDMS, toStringXY} from "ol/coordinate";

let dades = [];
let coordinates = []; //Coordinates for the map representation
let coordinates2 = [];
recuperarLinies();
function recuperarPunts() {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://00dc-176-83-19-148.eu.ngrok.io/php/RecuperarPunts.php");
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let cadena = this.responseText.split(";");
            let x = 0
            for (let i = 0; i < cadena.length; i++) {
                if ((i % 2) != 0) {
                    dades[x] = cadena[i];
                    x++;
                }
            }
            for (let i = 0; i < dades.length; i++) {
                dades[i] = dades[i].split("POINT(")[1];
            }
            for (let i = 0; i < dades.length; i++) {
                dades[i] = dades[i].split(")")[0];
            }

            for (let i = 0; i < dades.length; i++) {
                coordinates.push([dades[i].split(" ")[0], dades[i].split(" ")[1]])
            }

            map();

        }
    }
    xhr.send();
}

function recuperarLinies() {
    let dades = [];
    let coordinates0 = [];
    let coordinates1 = [];
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://00dc-176-83-19-148.eu.ngrok.io/php/RecuperarLinies.php");
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {

        if (this.readyState == 4 && this.status == 200) {
            let cadena = this.responseText.split(";");
            let x = 0
            for (let i = 0; i < cadena.length; i++) {
                if ((i % 2) != 0) {
                    dades[x] = cadena[i];
                    x++;
                }
            }
            for (let i = 0; i < dades.length; i++) {
                dades[i] = dades[i].split("LINESTRING(")[1];
            }
            for (let i = 0; i < dades.length; i++) {
                dades[i] = dades[i].split(")")[0];
            }
            for (let i = 0; i < dades.length; i++) {
                coordinates1 = [];
                coordinates0 = dades[i].split(",")
                for (let y = 0; y < coordinates0.length; y++) {
                    coordinates1.push([coordinates0[y].split(" ")[0], coordinates0[y].split(" ")[1]])
                }
                coordinates2.push(coordinates1)
            }
            recuperarPunts()
        }
    }
    xhr.send();
}



function createPoints(lat, long, desc) {
  return new Feature({
      geometry: new Point(transform([long, lat], 'EPSG:4326', 'EPSG:3857')),
      desc: desc
  });
}

function insertar(lat, lon) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://00dc-176-83-19-148.eu.ngrok.io/php/RecuperarLinies.php");
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {

        }
    }
    xhr.send("Lon" + lon + "Lat" + lat);}

function map() {
    var style = new Style({
        image: new Circle({
            radius: 5,
            fill: new Fill({
                color: '#7AC7F4'
            }),
            stroke: new Stroke({
                color: '#624553',
                width: 2
            })

        }),
        stroke: new Stroke({
            color: '#EF5FA2',
            width: 2
        })
    });


    let features = []; // Array<Feature<Point>>
    let cordsPoints = coordinates;
    // Create points
    for (var i = 0; i < cordsPoints.length; i++) {
        let lat = cordsPoints[i][1];
        let long = cordsPoints[i][0];
        let desc = 'Latitude: ' + lat + "\n" + "Long: " + long;
        let a = createPoints(lat, long, desc)
        features.push(a);
    }

    let cordsLines = coordinates2;

    // Create lines
    var vectorLine = new Vector({})
    for (var numberOfCoordsPerLine = 0; numberOfCoordsPerLine < cordsLines.length; numberOfCoordsPerLine++) {
        let actualLinePoints = [];
        for (var i = 0; i < cordsLines[numberOfCoordsPerLine].length; i++) {
            actualLinePoints.push(transform(cordsLines[numberOfCoordsPerLine][i], 'EPSG:4326', 'EPSG:3857'));
        }
        var featureLine = new Feature({
            geometry: new LineString(actualLinePoints)
        });
        vectorLine.addFeature(featureLine);
    }

    var vectorLineLayer = new VectorLayer({
        source: vectorLine,
        style: new Style({
            fill: new Fill({color: '#FF0000'}),
            stroke: new Stroke({color: '#FF0000', width: 2})
        })
    });

    var view = new View({
        center: new transform([-0.1570, 51.2500], 'EPSG:4326', 'EPSG:3857'),
        zoom: 12,
        minZoom: 1,
        projection: 'EPSG:3857'
    });

    var drawingSource = new Vector({
        wrapX: true,
        features: features
    });

    var drawingLayer = new VectorLayer({
        source: drawingSource,
        style: style
    });

    var baseLayer = new Tile({
        source: new OSM()
    });

    //Map
    var map = new Map({
        layers: [baseLayer, vectorLineLayer, drawingLayer],
        target: 'map',
        view: view,
        controls: [new Zoom()]
    });

    var container = document.getElementById('popup');
    var content = document.getElementById('popup-content');
    var closer = document.getElementById('popup-closer');

    closer.onclick = function () {
        overlay.setPosition(undefined);
        closer.blur();
        return false;
    };
    var overlay = new Overlay({
        element: container,
        autoPan: true,
        offset: [0, -10]
    });
    map.addOverlay(overlay);

    map.on('click', function(evt) {
        let pixel_exists = false;
        let my_last_pixel = null;
        let feature = map.forEachFeatureAtPixel(evt.pixel, function(createPoints, layer) {
            console.log(createPoints)
            pixel_exists = true;
            my_last_pixel = createPoints.values_
            return createPoints;
        });
        if (!pixel_exists) {
            let coordinate = evt.coordinate;
            content.innerHTML = '<button>Inserir punt</button>';
            //insertar(coordinate[0], coordinate[1]);
            overlay.setPosition(coordinate);
        } else {
            let coordinate = evt.coordinate;
            content.innerHTML = my_last_pixel.desc;
            overlay.setPosition(coordinate);
        }
            // overlay.setPosition(undefined);
    });
}
