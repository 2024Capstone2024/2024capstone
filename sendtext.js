document.addEventListener('DOMContentLoaded', () => {
    const kakao = window.kakao;
  
    kakao.maps.load(() => {
      const mapContainer = document.getElementById('map');
  
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
      let dayLayers = []; // 각 일차별 경로 및 마커를 저장하는 배열
      let dayPlaces = []; // 날짜별 장소 저장 배열
  
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
  
      function displayPlaces(placesData, dayIndex) {
        clearMap();
        const path = [];
  
        if (placesData.length > 0) {
          const firstPlace = placesData[0];
          map.setCenter(new kakao.maps.LatLng(firstPlace.y, firstPlace.x));
        }
  
        placesData.forEach(place => {
          const position = new kakao.maps.LatLng(place.y, place.x);
          const marker = new kakao.maps.Marker({
            position: position,
            map: map,
            title: place.place_name
          });
  
          let markerImageUrl;
          const color = getColor(place.category_group_name);
  
          if (color === 'red') {
            markerImageUrl = 'https://map.pstatic.net/resource/api/v2/image/maps/around-category/dining_category_pc.png?version=8';
          } else if (color === 'blue') {
            markerImageUrl = 'http://t1.daumcdn.net/localimg/localimages/07/2018/pc/img/marker_spot.png';
          } else if (color === 'green') {
            markerImageUrl = 'http://t1.daumcdn.net/localimg/localimages/07/2018/pc/img/marker_spot.png';
          } else if (color === 'purple') {
            markerImageUrl = 'https://map.pstatic.net/resource/api/v2/image/maps/around-category/pension_category_pc.png?version=8';
          } else {
            markerImageUrl = 'http://t1.daumcdn.net/localimg/localimages/07/2018/pc/img/marker_spot.png';
          }
  
          const markerImage = new kakao.maps.MarkerImage(
            markerImageUrl,
            new kakao.maps.Size(32, 32)
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
              strokeColor: getColor(placesData[0].category_group_name),
              strokeOpacity: 0.4,
              strokeStyle: 'solid'
            });
            polyline.setMap(map);
            polylines.push(polyline);
          }
        }
  
        dayLayers[dayIndex] = { markers, polylines };
      }
  
      function updateControlPanel() {
        const controlPanel = document.getElementById('controlPanel');
        controlPanel.innerHTML = '';
  
        dayPlaces.forEach((_, dayIndex) => {
          const dayLabel = document.createElement('label');
          const dayCheckbox = document.createElement('input');
          dayCheckbox.type = 'checkbox';
          dayCheckbox.checked = true;
          dayCheckbox.id = `day${dayIndex}`;
          dayCheckbox.addEventListener('change', (event) => {
            if (event.target.checked) {
              displayPlaces(dayPlaces[dayIndex], dayIndex);
            } else {
              clearMap();
              dayLayers[dayIndex].markers.forEach(marker => marker.setMap(null));
              dayLayers[dayIndex].polylines.forEach(polyline => polyline.setMap(null));
            }
          });
          dayLabel.appendChild(dayCheckbox);
          dayLabel.appendChild(document.createTextNode(`Day ${dayIndex + 1}`));
          controlPanel.appendChild(dayLabel);
  
          if (dayIndex === 0) {
            displayPlaces(dayPlaces[dayIndex], dayIndex);
          }
        });
      }
  
      function fetchPlaces(travelText) {
        fetch('/api/rag', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userRequest: travelText })
        })
        .then(response => response.json())
        .then(data => {
          if (data.sortedPlaces && data.sortedPlaces.length > 0) {
            dayPlaces = data.sortedPlaces;
            updateControlPanel();
          } else {
            alert('No places found');
          }
        })
        .catch(error => {
          console.error('Error fetching places:', error);
          alert('Failed to fetch places');
        });
      }
  
      // 유저 입력 폼 처리
      document.getElementById('submitTravelRequestBtn').addEventListener('click', function() {
        const travelInput = document.getElementById('travelInput');
        const travelText = travelInput.value.trim();
  
        if (travelText.length === 0) {
          alert('Please enter a travel request');
          return;
        }
  
        // RAG를 통해 장소 추천 요청
        fetchPlaces(travelText);
      });
    });
  });
  