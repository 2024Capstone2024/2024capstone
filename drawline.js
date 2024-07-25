// map.js

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
          return '#0000FF'; // 파란색
        case '숙박':
          return '#800080'; // 보라색
        case '관광명소':
          return '#008000'; // 초록색
        default:
          return '#808080'; // 회색
      }
    }

    function displayPlaces(places) {
      clearMap();
      const path = [];
      
      places.forEach(place => {
        const position = new kakao.maps.LatLng(place.y, place.x);
        const marker = new kakao.maps.Marker({
          position: position,
          map: map,
          title: place.place_name
        });

        // 마커 색상 설정
        const color = getColor(place.category_group_name);
        const markerImage = new kakao.maps.MarkerImage(
          `http://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
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
      fetch('https://www.2024capstoneaiplanner.site/api/processPlaces') // 여기에 실제 API 엔드포인트를 넣으세요
        .then(response => response.json())
        .then(data => {
          if (data.locations && data.locations.length > 0) {
            const sortedPlaces = data.locations.map(place => {
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

    // 페이지 로드 시 장소 자동 로드
    fetchPlaces();
  });
});
