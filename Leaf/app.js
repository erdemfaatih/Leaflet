var map = L.map('map', {
    center: [39.925533, 32.866287],
    zoom: 7,
    maxZoom:40, // Maksimum zoom seviyesi
    minZoom: 4  // Minimum zoom seviyesi
});
var currentMapStyle = 'openstreetmap'; // varsayılan olarak OpenStreetMap stili
var mapLayer; // mevcut harita stili katmanı

mapLayer = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
}).addTo(map);

var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var drawControl = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems
    },
    draw: {
        polygon: {
            shapeOptions: {
                color: 'blue'
            },
            showArea: false,
            allowIntersection: false,
            drawError: {
                color: '#bada55',
                timeout: 1000
            },
            guidelineDistance: 20,
            maxGuideLineLength: 4000,
            icon: new L.DivIcon({
                iconSize: new L.Point(0, 0),
                className: 'leaflet-div-icon leaflet-editing-icon'
            }),
            touchIcon: new L.DivIcon({
                iconSize: new L.Point(0, 0),
                className: 'leaflet-div-icon leaflet-editing-icon'
            })
        },
        polyline: {
            shapeOptions: {
                color: 'red'
            }
        },
        marker: false,
        circle: false,
        rectangle: false,
        circlemarker: false
    }
});
map.addControl(drawControl);

map.on(L.Draw.Event.CREATED, function (event) {
    var layer = event.layer;
    drawnItems.addLayer(layer);

    if (event.layerType === 'polygon') {
        var area = calculateArea(layer);
        layer.on('click', function () {
            displayArea(area);
        });
    }

    if (event.layerType === 'polyline') {
        var coordinates = getLayerCoordinates(layer);
        displayPolylineCoordinates(coordinates);
    }
});

function calculateArea(layer) {
    var latlngs = layer.getLatLngs()[0];
    var area = L.GeometryUtil.geodesicArea(latlngs);
    var hectares = area / 10000; // Convert square meters to hectares
    return hectares.toFixed(2); // Round to 2 decimal places
}

function getLayerCoordinates(layer) {
    var coords = [];

    if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
        var latlngs = layer.getLatLngs();

        latlngs.forEach(function (latlng) {
            coords.push([latlng.lat, latlng.lng]);
        });
    }

    return coords;
}

function displayArea(area) {
    var coordsContent = document.getElementById('coords-content');
    coordsContent.innerHTML = '<h2>Poligon Alan Bilgisi:</h2>';
    var p = document.createElement('p');
    p.textContent = 'Alan: ' + area + ' m2';
    coordsContent.appendChild(p);

    var polygonContainer = document.getElementById('polygon-coords-container');
    polygonContainer.style.display = 'block';
    document.getElementById('polyline-coords-container').style.display = 'none';
}

function displayPolylineCoordinates(coords) {
    var polylineCoordsContent = document.getElementById('polyline-coords-content');
    polylineCoordsContent.innerHTML = '<h2>Çizgi Noktalarının Koordinatları:</h2>';
    coords.forEach(function (coord, index) {
        if (coord[0] !== undefined && coord[1] !== undefined) {
            var p = document.createElement('p');
            p.textContent = 'Nokta ' + (index + 1) + ': ' + coord.join(', ');
            polylineCoordsContent.appendChild(p);
        }
    });

    var totalDistance = calculatePolylineDistance(coords);
    var distanceElement = document.createElement('p');
    distanceElement.textContent = 'Toplam Uzunluk: ' + totalDistance.toFixed(2) + ' km';
    polylineCoordsContent.appendChild(distanceElement);

    document.getElementById('polygon-coords-container').style.display = 'none';
    var polylineContainer = document.getElementById('polyline-coords-container');
    polylineContainer.style.display = 'block';
}

function calculatePolylineDistance(coords) {
    var totalDistance = 0;
    for (var i = 0; i < coords.length - 1; i++) {
        var point1 = L.latLng(coords[i][0], coords[i][1]);
        var point2 = L.latLng(coords[i + 1][0], coords[i + 1][1]);
        totalDistance += point1.distanceTo(point2) / 1000; // Metreden kilometreye çeviriyoruz
    }
    return totalDistance;
}

function closeCoordsContainer() {
    document.getElementById('polygon-coords-container').style.display = 'none';
}

function closePolylineCoordsContainer() {
    document.getElementById('polyline-coords-container').style.display = 'none';
}

function redirectToRegister() {
    window.location.href = 'register.html';
}

function showZoomInput() {
    var zoomInputContainer = document.getElementById('zoom-input-container');
    zoomInputContainer.style.display = 'block';
}

function zoomToCoordinates() {
    var latInput = document.getElementById('lat-input').value;
    var lngInput = document.getElementById('lng-input').value;

    if (latInput && lngInput) {
        map.setView([latInput, lngInput], 6); // Or set your desired zoom level
    }

    var zoomInputContainer = document.getElementById('zoom-input-container');
    zoomInputContainer.style.display = 'none';
}

function changeMapStyle() {
    // Eğer mevcut harita stili OpenStreetMap ise Satellite'e geç
    if (currentMapStyle === 'openstreetmap') {
        var newMapStyle = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        });

        // Eğer önceki bir harita stili varsa, onu kaldır
        if (mapLayer) {
            map.removeLayer(mapLayer);
        }

        // Yeni harita stili ekleniyor
        newMapStyle.addTo(map);

        // Değiştirilen harita stiline referansı güncelleniyor
        mapLayer = newMapStyle;

        // Mevcut harita stilini güncelle
        currentMapStyle = 'satellite';
    } else { // Eğer mevcut harita stili Satellite ise OpenStreetMap'e geç
        var newMapStyle = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.{ext}', {
            minZoom: 0,
            maxZoom: 20,
            attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            ext: 'png'
        });

        // Eğer önceki bir harita stili varsa, onu kaldır
        if (mapLayer) {
            map.removeLayer(mapLayer);
        }

        // Yeni harita stili ekleniyor
        newMapStyle.addTo(map);

        // Değiştirilen harita stiline referansı güncelleniyor
        mapLayer = newMapStyle;

        // Mevcut harita stilini güncelle
        currentMapStyle = 'openstreetmap';
    }
}

var addingMarker = false;

function enableMarkerAdding() {
    addingMarker = !addingMarker;
    if (addingMarker) {
        map.on('click', onMapClick);
        alert('Marker ekleme modu aktif. Haritaya tıklayarak marker ekleyebilirsiniz.');
    } else {
        map.off('click', onMapClick);
        alert('Marker ekleme modu kapalı.');
    }
}

function onMapClick(e) {
    if (addingMarker) {
        var marker = L.marker(e.latlng).addTo(map);
        var popupContent = `
            <div>
                <p>Koordinatlar: ${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}</p>
                <button onclick="removeMarker(${e.latlng.lat}, ${e.latlng.lng})">Sil</button>
            </div>
        `;
        marker.bindPopup(popupContent).openPopup();

        // Marker'ı saklamak için marker objesini kaydedelim
        marker.myCoords = e.latlng;
        marker.myPopupContent = popupContent; // Popup içeriğini saklayalım
        marker.on('popupopen', function () {
            this.setPopupContent(this.myPopupContent); // Popup açıldığında içeriği güncelle
        });

        // Marker'ı listemize ekleyelim
        markers.push(marker);
    }
}

var markers = [];

function removeMarker(lat, lng) {
    for (var i = 0; i < markers.length; i++) {
        var marker = markers[i];
        if (marker.getLatLng().lat === lat && marker.getLatLng().lng === lng) {
            map.removeLayer(marker);
            markers.splice(i, 1);
            break;
        }
    }
}

function clearAllMarkers() {
    markers.forEach(function(marker) {
        map.removeLayer(marker);
    });
    markers = [];
    alert('Tüm markerlar silindi.');
}

function showCoordinateInput() {
    var coordinateInputContainer = document.getElementById('coordinate-input-container');
    coordinateInputContainer.style.display = 'block';
}

function showCustomMarkerInput() {
    var customMarkerInputContainer = document.getElementById('custom-marker-input-container');
    customMarkerInputContainer.style.display = 'block';
}

function closeCustomMarkerInput() {
    var customMarkerInputContainer = document.getElementById('custom-marker-input-container');
    customMarkerInputContainer.style.display = 'none';
}

function addCustomMarker() {
    var latInput = document.getElementById('custom-lat-input').value;
    var lngInput = document.getElementById('custom-lng-input').value;
    var nameInput = document.getElementById('custom-name-input').value; // İsim girişi

    if (latInput && lngInput) {
        var lat = parseFloat(latInput);
        var lng = parseFloat(lngInput);

        if (!isNaN(lat) && !isNaN(lng)) {
            var marker = L.marker([lat, lng]).addTo(map);
            var popupContent = `
                <div>
                    <p>İsim: ${nameInput}</p> <!-- İsim göster -->
                    <p>Koordinatlar: ${lat.toFixed(5)}, ${lng.toFixed(5)}</p>
                    <button onclick="removeMarker(${lat}, ${lng})">Sil</button>
                </div>
            `;
            marker.bindPopup(popupContent).openPopup();

            marker.myCoords = { lat: lat, lng: lng };
            marker.myPopupContent = popupContent;
            marker.on('popupopen', function () {
                this.setPopupContent(this.myPopupContent);
            });

            markers.push(marker);

            document.getElementById('custom-lat-input').value = '';
            document.getElementById('custom-lng-input').value = '';
            document.getElementById('custom-name-input').value = ''; // İsim girişi temizle
            document.getElementById('custom-marker-input-container').style.display = 'none';
        } else {
            alert('Geçerli bir enlem ve boylam girin.');
        }
    } else {
        alert('Enlem ve boylam değerlerini girin.');
    }
}



var markers = []; // Tüm markerları saklamak için bir dizi

async function fetchData() {
    try {
        // Önce mevcut tüm markerları temizleyelim
        markers.forEach(marker => {
            map.removeLayer(marker);
        });
        markers = [];

        // API'den verileri çekelim
        const response = await fetch('http://localhost:3001/locations');
        const locations = await response.json();

        // Küçük turuncu kare stilini oluşturalım
        const smallOrangeSquareIcon = L.divIcon({
            className: 'small-orange-square-icon', // CSS sınıfı adı
            iconSize: [15, 15] // İkonun boyutları
        });

        // Yeni markerları ekleyelim
        locations.forEach(location => {
            const { latitude, longitude, ground_data } = location;
            const marker = L.marker([latitude, longitude], { icon: smallOrangeSquareIcon }).addTo(map);
            marker.bindPopup(`<b>Zemin Verisi:</b> ${ground_data}`).openPopup();
            markers.push(marker); // Markerı diziye ekleyelim
        });
    } catch (error) {
        console.error('Veri getirme hatası:', error);
    }
}



function showDataInputForm() {
    var dataInputContainer = document.getElementById('data-input-container');
    dataInputContainer.style.display = 'block';
}

function closeDataInputForm() {
    var dataInputContainer = document.getElementById('data-input-container');
    dataInputContainer.style.display = 'none';
}

async function addLocation() {
    var latitude = document.getElementById('input-latitude').value;
    var longitude = document.getElementById('input-longitude').value;
    var groundData = document.getElementById('input-ground-data').value;

    if (latitude && longitude && groundData) {
        var data = {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            ground_data: groundData
        };

        try {
            var response = await fetch('http://localhost:3001/locations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('Veri başarıyla eklendi!');
                closeDataInputForm();
            } else {
                alert('Veri eklenirken bir hata oluştu.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Veri eklenirken bir hata oluştu.');
        }
    } else {
        alert('Lütfen tüm alanları doldurun.');
    }
}




// Kare şeklinde bir ikon oluştur
const squareIcon = L.divIcon({
    className: 'square-icon',
    iconSize: [7, 7],  // Kare ikonun boyutu
    iconAnchor: [3, 3],   // Ikonun orta noktası
    html: '<div style="width: 12px; height: 12px; background-color: red; border: 2px solid black;"></div>'
});


// fetchSPTData fonksiyonunu güncelleyin
async function fetchSPTData() {
    try {
        const response = await fetch('http://localhost:3001/spt_data'); // API endpoint URL
        const sptData = await response.json();

        // Haritayı Adıyaman konumuna odaklayın
        map.setView([37.7745, 38.6241], 17);

        sptData.forEach(location => {
            const { latitude, longitude, sondaj_noktasi, derinlik, spt_degeri, zemin_turu } = location;
            const marker = L.marker([latitude, longitude], { icon: squareIcon }).addTo(map);
            marker.bindPopup(`
                <b>Sondaj Noktası:</b> ${sondaj_noktasi}<br>
                <b>Derinlik:</b> ${derinlik} m<br>
                <b>SPT (N) Değeri:</b> ${spt_degeri}<br>
                <b>Zemin Türü:</b> ${zemin_turu}
            `);
        });
    } catch (error) {
        console.error('Veri getirme hatası:', error);
    }
}

document.getElementById('fetchSPTDataButton').addEventListener('click', fetchSPTData);




var faultLinesLayerTurkey;
var faultLinesTurkeyShown = false;

function toggleFaultLinesTurkey() {
    if (!faultLinesTurkeyShown) {
        // GitHub'dan GeoJSON dosyasını çekme
        fetch('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json')
            .then(response => response.json())
            .then(data => {
                faultLinesLayerTurkey = L.geoJSON(data, {
                    style: function (feature) {
                        return {color: "red"};
                    },
                    onEachFeature: function (feature, layer) {
                        layer.bindPopup("Fay Hattı: " + (feature.properties.Name || "Bilinmiyor"));
                    }
                }).addTo(map);
                faultLinesTurkeyShown = true;
            })
            .catch(error => {
                console.error('Fay hatları verisi çekilirken hata oluştu:', error);
            });
    } else {
        // Haritadan fay hattı katmanını kaldırma
        if (faultLinesLayerTurkey) {
            map.removeLayer(faultLinesLayerTurkey);
            faultLinesTurkeyShown = false;
        }
    }
}





var earthquakeMarkers = [];
var earthquakeDataVisible = false;

// Deprem verilerini çekmek için API çağrısı
function fetchEarthquakeData() {
    if (earthquakeDataVisible) {
        earthquakeMarkers.forEach(marker => map.removeLayer(marker));
        earthquakeMarkers = [];
        earthquakeDataVisible = false;
    } else {
        var apiUrl = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2022-01-01&endtime=2024-01-01&minlatitude=36&maxlatitude=42&minlongitude=26&maxlongitude=45';

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                var earthquakes = data.features;
                earthquakes.forEach(earthquake => {
                    var coords = earthquake.geometry.coordinates;
                    var magnitude = earthquake.properties.mag;
                    var place = earthquake.properties.place;
                    var date = new Date(earthquake.properties.time);

                    var marker = L.marker([coords[1], coords[0]])
                        .addTo(map)
                        .bindPopup(`<b>${place}</b><br>Magnitude: ${magnitude}<br>Date: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`);

                    earthquakeMarkers.push(marker);
                });
                earthquakeDataVisible = true;
            })
            .catch(error => console.error('Error fetching earthquake data:', error));
    }
}

async function addEarthquakeMarkers() {
    const earthquakes = await fetchEarthquakeData();

    earthquakes.forEach(earthquake => {
        const coords = earthquake.geometry.coordinates;
        const [longitude, latitude, depth] = coords;
        const magnitude = earthquake.properties.mag;
        const place = earthquake.properties.place;
        const date = new Date(earthquake.properties.time);

        const marker = L.marker([latitude, longitude]).addTo(map);
        marker.bindPopup(`
            <b>Deprem Büyüklüğü:</b> ${magnitude}<br>
            <b>Derinlik:</b> ${depth} km<br>
            <b>Konum:</b> ${place}<br>
            <b>Tarih:</b> ${date.toLocaleDateString()} ${date.toLocaleTimeString()}
        `);
    });
}




var searchLayerGroup = new L.FeatureGroup().addTo(map);

function displayCityInfo(cityName, lat, lon) {
    var popupContent = `<b>Şehir: </b>${cityName}<br><b>Enlem: </b>${lat}<br><b>Boylam: </b>${lon}`;
    return popupContent;
}
function searchCity(cityName) {
    // Eski sınırları kaldır
    searchLayerGroup.clearLayers();

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${cityName}&polygon_geojson=1`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                var result = data[0];
                var geojson = result.geojson;

                if (geojson && geojson.type === "Polygon") {
                    var layer = L.geoJSON(geojson).addTo(searchLayerGroup);
                    map.fitBounds(layer.getBounds());

                    // Popup ekleme
                    var lat = result.lat;
                    var lon = result.lon;
                    var popupContent = displayCityInfo(cityName, lat, lon);
                    layer.bindPopup(popupContent).openPopup();
                } else {
                    alert("Şehir sınırları bulunamadı.");
                }
            } else {
                alert("Şehir bulunamadı.");
            }
        })
        .catch(error => {
            console.error('Hata:', error);
            alert("Şehir arama işlemi sırasında bir hata oluştu.");
        });
}

function performSearch() {
    var cityName = document.getElementById('searchInput').value;
    searchCity(cityName);
}


function showWeatherInput() {
    var weatherInputContainer = document.getElementById('weather-input-container');
    weatherInputContainer.style.display = 'block';
}
function hideWeatherInput() {
    var weatherInputContainer = document.getElementById('weather-input-container');
    weatherInputContainer.style.display = 'none';
}

async function fetchWeatherData() {
    var latitude = document.getElementById('latitude').value;
    var longitude = document.getElementById('longitude').value;

    if (latitude && longitude) {
        try {
            var apiKey = '22d0532d9c2d8d35395612f7386792f2'; // Replace with your OpenWeatherMap API key
            var url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=tr`;

            var response = await fetch(url);
            var data = await response.json();

            var weatherInfo = `
                <div>
                    <h3>Hava Durumu</h3>
                    <p><b>Sıcaklık:</b> ${data.main.temp} °C</p>
                    <p><b>Hava:</b> ${data.weather[0].description}</p>
                    <p><b>Rüzgar Hızı:</b> ${data.wind.speed} m/s</p>
                </div>
            `;

            L.popup()
                .setLatLng([latitude, longitude])
                .setContent(weatherInfo)
                .openOn(map);
        } catch (error) {
            alert('Hava durumu bilgisi alınırken bir hata oluştu.');
        }
    } else {
        alert('Lütfen geçerli enlem ve boylam girin.');
    }
}

