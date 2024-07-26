document.addEventListener('DOMContentLoaded', () => {
  const kakao = window.kakao;

  kakao.maps.load(() => {
    const mapContainer = document.getElementById('map1');

    if (!mapContainer) {
      console.error('Map container not found!');
      return;
    }

    const mapOption = {
      center: new kakao.maps.LatLng(37.566826, 126.9786567),
      level: 7
    };
    const map = new kakao.maps.Map(mapContainer, mapOption);

    let markers = [];
    let polylines = [];
    let places = [];

    function clearMap() {
      markers.forEach(marker => marker.setMap(null));
      polylines.forEach(polyline => polyline.setMap(null));
      markers = [];
      polylines = [];
    }

    // 카테고리별 마커 이미지 URL
    const markerImageUrls = {
      '음식점': 'https://raw.githubusercontent.com/2024Capstone2024/image/bf36a819d509ac1f7f422e045673a328805e1ec1/food_marker.png',
      '카페': 'https://raw.githubusercontent.com/2024Capstone2024/image/bf36a819d509ac1f7f422e045673a328805e1ec1/cafe.png',
      '숙박': 'https://raw.githubusercontent.com/2024Capstone2024/image/bf36a819d509ac1f7f422e045673a328805e1ec1/accommodation_marker.png',
      '관광명소': 'https://raw.githubusercontent.com/2024Capstone2024/image/bf36a819d509ac1f7f422e045673a328805e1ec1/tourist_marker.png',
      'default': 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_blue.png'
    };

    function getMarkerImageUrl(category) {
      return markerImageUrls[category] || markerImageUrls['default'];
    }

    function displayPlaces(placesData) {
      clearMap();
      const path = [];

      placesData.forEach(place => {
        const position = new kakao.maps.LatLng(place.y, place.x);
        const marker = new kakao.maps.Marker({
          position: position,
          map: map,
          title: place.place_name
        });

        const markerImageUrl = getMarkerImageUrl(place.category_group_name);
        const markerImage = new kakao.maps.MarkerImage(
          markerImageUrl,
          new kakao.maps.Size(32, 32) // 이미지 크기 조정
        );
        marker.setImage(markerImage);

        markers.push(marker);
        path.push(position);
      });

      if (path.length > 1) {
        for (let i = 0; i < path.length - 1; i++) {
          const polyline = new kakao.maps.Polyline({
            path: [path[i], path[i + 1]],
            strokeWeight: 5,
            strokeColor: '#FF0000',
            strokeOpacity: 0.7,
            strokeStyle: 'solid'
          });
          polyline.setMap(map);
          polylines.push(polyline);
        }
      }
    }

    function fetchPlaces() {
      fetch('https://www.2024capstoneaiplanner.site/api/processPlaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ places: places })
      })
        .then(response => response.json())
        .then(data => {
          if (data.sortedPlaces && data.sortedPlaces.length > 0) {
            const sortedPlaces = data.sortedPlaces.map(place => {
              return {
                y: place.y,
                x: place.x,
                place_name: place.place_name,
                category_group_name: place.category_group_name || 'Unknown'
              };
            });
            displayPlaces(sortedPlaces);
          } else {
            alert('No places found');
          }
        })
        .catch(error => {
          console.error('Error fetching places:', error);
          alert('Failed to fetch places');
        });
    }

    document.getElementById('addPlaceBtn').addEventListener('click', function() {
      const placeName = document.getElementById('placeInput').value;
      if (placeName) {
        places.push(placeName);
        document.getElementById('placeList').innerHTML += `<li>${placeName}</li>`;
        document.getElementById('placeInput').value = '';
      }
    });

    document.getElementById('showRouteBtn').addEventListener('click', function() {
      if (places.length < 2) {
        alert('Please enter at least 2 places.');
        return;
      }
      fetchPlaces();
    });
  });
});
