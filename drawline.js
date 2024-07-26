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

    function getColor(category) {
      switch (category) {
        case '음식점':
        case '카페':
          return 'red'; // 빨간색
        case '숙박':
          return 'purple'; // 보라색
        case '관광명소':
          return 'green'; // 초록색
        default:
          return 'blue'; // 파랑
      }
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
  
          // 마커 이미지 URL 설정
          let markerImageUrl;
  
          const color = getColor(place.category_group_name);
  
          if (color === 'red') {
              markerImageUrl = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png
          } else if (color === 'blue') {
              markerImageUrl = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_blue.png';
          } else if (color === 'green') {
              markerImageUrl = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_green.png';
          } else if (color === 'purple') {
              markerImageUrl = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_purple.png';
          } else {
              markerImageUrl = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_blue.png'; // 기본 파란색
          }
  
          const markerImage = new kakao.maps.MarkerImage(
              markerImageUrl,
              new kakao.maps.Size(32, 32)
          );
          marker.setImage(markerImage);
  
          markers.push(marker);
          path.push(position);
      });

      // 장소 간 선 그리기
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

    // 장소 추가 버튼 클릭 이벤트
    document.getElementById('addPlaceBtn').addEventListener('click', function() {
      const placeName = document.getElementById('placeInput').value;
      if (placeName) {
        places.push(placeName);
        document.getElementById('placeList').innerHTML += `<li>${placeName}</li>`;
        document.getElementById('placeInput').value = '';
      }
    });

    // 경로 표시 버튼 클릭 이벤트
    document.getElementById('showRouteBtn').addEventListener('click', function() {
      if (places.length < 2) {
        alert('Please enter at least 2 places.');
        return;
      }
      fetchPlaces(); // 서버에서 장소 정보를 받아와 지도에 표시
    });
  });
});
