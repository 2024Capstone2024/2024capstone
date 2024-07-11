document.addEventListener('DOMContentLoaded', () => {
    const kakao = window.kakao;
    kakao.maps.load(() => {
        const mapContainer = document.getElementById('map3');

        if (!mapContainer) {
            console.error('Map container not found!');
            return;
        }

        const mapOption = {
            center: new kakao.maps.LatLng(37.566826, 126.9786567),
            level: 7
        };
        const map = new kakao.maps.Map(mapContainer, mapOption);

        const placesList = document.getElementById('placesList1');
        const infowindow = new kakao.maps.InfoWindow({zIndex:1});

        function displayPlaces(places) {
            placesList.innerHTML = '';
            const markers = [];

            places.slice(0, 10).forEach((place, index) => {
                const placePosition = new kakao.maps.LatLng(place.y, place.x);
                const marker = new kakao.maps.Marker({
                    position: placePosition,
                    map: map
                });
                markers.push(marker);
                
                const li = document.createElement('li');
                li.innerText = `${index + 1}. ${place.place_name} - ${place.address_name}`;
                li.onclick = () => {
                    map.setCenter(placePosition);
                };
                placesList.appendChild(li);

                kakao.maps.event.addListener(marker, 'click', () => {
                    infowindow.setContent(`<div style="padding:5px;font-size:12px;">${place.place_name}<br>${place.address_name}</div>`);
                    infowindow.open(map, marker);
                });
            });

            return markers;
        }

        function searchPlacelist(keyword) {
            fetch(`https://www.2024capstoneaiplanner.site/api/placelist?keyword=${encodeURIComponent(keyword)}`)
                .then(response => response.json())
                .then(data => {
                    if (data.length === 0) {
                        alert('No places found');
                    } else {
                        displayPlaces(data);
                    }
                })
                .catch(error => {
                    console.error('Error searching place:', error);
                    alert('Failed to search for places');
                });
        }

        const searchBtn = document.getElementById('listsearchBtn');
        searchBtn.addEventListener('click', () => {
            const keyword = document.getElementById('keyword1').value;
            searchPlacelist(keyword);
        });
    });
});
