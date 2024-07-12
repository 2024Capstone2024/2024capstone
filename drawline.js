window.kakao.maps.load(() => {
  const mapContainer1 = document.getElementById('map1'); // 지도1을 표시할 div
  const mapContainer2 = document.getElementById('map2'); // 지도2를 표시할 div

  // 지도1 옵션
  const mapOption1 = {
    center: new window.kakao.maps.LatLng(37.566826, 126.9786567), // 서울시청 좌표
    level: 7 // 지도 확대 레벨
  };

  // 지도1 객체 생성
  const map1 = new window.kakao.maps.Map(mapContainer1, mapOption1);

  // 지도2 옵션
  const mapOption2 = {
    center: new window.kakao.maps.LatLng(37.566826, 126.9786567), // 서울시청 좌표
    level: 7 // 지도 확대 레벨
  };

  // 지도2 객체 생성
  const map2 = new window.kakao.maps.Map(mapContainer2, mapOption2);

  // 입력된 장소들을 저장할 배열
  let places = [];
  let markers = []; // 마커를 저장할 배열

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

    // 백엔드 서버로 POST 요청 보내기
    fetch('https://www.2024capstoneaiplanner.site/api/drawline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ places: places })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Received data:', data);
      showRouteOnMap(data); // 지도에 경로 표시 함수 호출
    })
    .catch(error => {
      console.error('Error fetching route:', error);
      alert('Failed to fetch route.');
    });
  });

  // 지도에 경로를 선으로 표시하는 함수
function showRouteOnMap(routeData) {
  // 경로 정보가 배열인지 확인
  if (!Array.isArray(routeData) || routeData.length === 0) {
    console.error('Invalid route data:', routeData);
    alert('No route data available.');
    return;
  }

  // 모든 마커를 지도에 추가하고 클릭 시 이벤트 추가
  const bounds = new window.kakao.maps.LatLngBounds(); // 모든 마커를 포함할 범위 객체

  // 경로 정보를 이용하여 지도에 선 그리기
  const path = routeData.map(point => new window.kakao.maps.LatLng(point.y, point.x));

  for (let i = 0; i < path.length; i++) {
    // 각 경로 지점에 마커 생성
    const marker = new window.kakao.maps.Marker({
      position: path[i],
      map: map2
    });
    markers.push(marker); // 마커 저장

    // 클릭 시 인포윈도우 표시
    const infowindow = new window.kakao.maps.InfoWindow({
      content: `<div style="padding:5px;font-size:12px;">Point ${i + 1}<br>Lat: ${path[i].getLat()}<br>Lng: ${path[i].getLng()}</div>`
    });

    kakao.maps.event.addListener(marker, 'click', () => {
      infowindow.open(map2, marker);
    });

    // 범위 객체에 마커 위치 추가
    bounds.extend(path[i]);
  }

  // 경로를 지도에 선으로 표시
  const polyline = new window.kakao.maps.Polyline({
    path: path,
    strokeWeight: 4,
    strokeColor: '#FF0000',
    strokeOpacity: 0.7,
    strokeStyle: 'solid'
  });
  polyline.setMap(map2);

  // 첫 번째 장소로 지도2 중심 이동 및 줌 레벨 설정
  map2.setCenter(bounds.getCenter()); // 중심을 경로의 중앙으로 설정
  map2.setLevel(6); // 경로가 잘 보이도록 줌 레벨 조정

  // 모든 마커가 보이도록 자동으로 확대/축소
  map2.setBounds(bounds);
}

