window.kakao.maps.load(() => {
  const mapContainer1 = document.getElementById('map1'); // 지도1을 표시할 div
  const mapOption = {
    center: new window.kakao.maps.LatLng(37.566826, 126.9786567), // 서울시청 좌표
    level: 7 // 지도 확대 레벨
  };

  // 지도1 객체 생성
  const map1 = new window.kakao.maps.Map(mapContainer1, mapOption);

  // 입력된 장소들을 저장할 배열
  let places = [];

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
    const mapContainer2 = document.getElementById('map2'); // 지도2를 표시할 div

    // 지도2 객체 생성
    const map2 = new window.kakao.maps.Map(mapContainer2, mapOption);

    // 경로 정보를 이용하여 지도에 선 그리기
    const path = routeData.map(point => new window.kakao.maps.LatLng(point.y, point.x));

    for (let i = 0; i < path.length - 1; i++) {
      // 각 두 지점을 연결하는 선 생성
      const polyline = new window.kakao.maps.Polyline({
        path: [path[i], path[i + 1]],
        strokeWeight: 4,
        strokeColor: '#FF0000',
        strokeOpacity: 0.7,
        strokeStyle: 'solid'
      });

      // 지도2에 선 표시
      polyline.setMap(map2);
    }

    // 첫 번째 장소로 지도2 중심 이동
    map2.setCenter(new window.kakao.maps.LatLng(path[0].getLat(), path[0].getLng()));
  }
});