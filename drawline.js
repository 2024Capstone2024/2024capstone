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

      // 처음 장소의 위치로 지도 중심 이동
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

        // 마커 이미지 URL 설정
        let markerImageUrl;
        const color = getColor(place.category_group_name);

        if (color === 'red') {
          markerImageUrl = 'https://map.pstatic.net/resource/api/v2/image/maps/around-category/dining_category_pc.png?version=8'; // 음식점, 카페
        } else if (color === 'blue') {
          markerImageUrl = 'http://t1.daumcdn.net/localimg/localimages/07/2018/pc/img/marker_spot.png'; // 그 외
        } else if (color === 'green') {
          markerImageUrl = 'http://t1.daumcdn.net/localimg/localimages/07/2018/pc/img/marker_spot.png'; // 명소
        } else if (color === 'purple') {
          markerImageUrl = 'https://map.pstatic.net/resource/api/v2/image/maps/around-category/pension_category_pc.png?version=8'; // 숙박
        } else {
          markerImageUrl = 'http://t1.daumcdn.net/localimg/localimages/07/2018/pc/img/marker_spot.png'; // 기본 파란색, 그 외
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
            strokeColor: getColor(placesData[0].category_group_name), // 선 색상
            strokeOpacity: 0.4,
            strokeStyle: 'solid'
          });
          polyline.setMap(map);
          polylines.push(polyline);
        }
      }

      // 각 일차별 경로 및 마커를 dayLayers에 저장
      dayLayers[dayIndex] = { markers, polylines };
    }

    function updateControlPanel() {
      const controlPanel = document.getElementById('controlPanel1');
      controlPanel.innerHTML = '';

      dayPlaces.forEach((_, dayIndex) => {
        const dayLabel = document.createElement('label');
        const dayCheckbox = document.createElement('input');
        dayCheckbox.type = 'checkbox';
        dayCheckbox.checked = true; // 기본적으로 체크됨
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

        // 첫 번째 일차별 데이터는 기본적으로 표시
        if (dayIndex === 0) {
          displayPlaces(dayPlaces[dayIndex], dayIndex);
        }
      });
    }

    function fetchPlaces() {
      fetch('https://www.2024capstoneaiplanner.site/api/processPlaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ places: dayPlaces })
      })
      .then(response => response.json())
      .then(data => {
        if (data.sortedPlaces && data.sortedPlaces.length > 0) {
          // 날짜별 경로를 추출하고 업데이트
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

    function addDaySection() {
      const daySections = document.getElementById('daySections');
      const dayIndex = daySections.children.length;

      const section = document.createElement('div');
      section.className = 'day-section';
      section.innerHTML = `
        <h2>Day ${dayIndex + 1}</h2>
        <input type="text" id="placeInput${dayIndex}" placeholder="Enter place name for Day ${dayIndex + 1}">
        <button id="addPlaceBtn${dayIndex}">Add Place for Day ${dayIndex + 1}</button>
        <ul id="placeList${dayIndex}"></ul>
      `;
      daySections.appendChild(section);

      document.getElementById(`addPlaceBtn${dayIndex}`).addEventListener('click', function() {
        const placeInput = document.getElementById(`placeInput${dayIndex}`);
        const placeName = placeInput.value;
        if (placeName) {
          if (!dayPlaces[dayIndex]) {
            dayPlaces[dayIndex] = [];
          }
          dayPlaces[dayIndex].push(placeName);
          document.getElementById(`placeList${dayIndex}`).innerHTML += `<li>${placeName}</li>`;
          placeInput.value = '';
        }
      });
    }

    // `Add Day` 버튼 클릭 이벤트 추가
    document.getElementById('addDayBtn').addEventListener('click', function() {
      addDaySection();
    });

    // 초기적으로 첫 번째 일차별 폼을 추가
    addDaySection();

    // 장소 제출 버튼 클릭 이벤트
    document.getElementById('submitPlacesBtn').addEventListener('click', function() {
      if (dayPlaces.length === 0 || dayPlaces.some(day => day.length < 2)) {
        alert('Please enter at least 2 places for each day.');
        return;
      }
      fetchPlaces(); // 서버에서 장소 정보를 받아와 지도에 표시
    });
  });
});
