// 카카오맵 API 초기화
const kakao = window.kakao;
kakao.maps.load(() => {
  const mapContainer1 = document.getElementById('map1'); // 지도를 표시할 div
  const mapOption = {
    center: new kakao.maps.LatLng(37.566826, 126.9786567), // 서울시청 좌표
    level: 7 // 지도 확대 레벨
  };

  // 지도 객체 생성
  const map1 = new kakao.maps.Map(mapContainer1, mapOption);

  // 입력된 장소들을 저장할 배열
  let places = [];

  // 장소 추가 버튼 클릭 이벤트
  $('#addPlaceBtn').on('click', function() {
    const placeName = $('#placeInput').val();
    if (placeName) {
      places.push(placeName);
      $('#placeList').append(`<li>${placeName}</li>`);
      $('#placeInput').val('');
    }
  });

  // 경로 표시 버튼 클릭 이벤트
  $('#showRouteBtn').on('click', function() {
    if (places.length < 2) {
      alert('2개 이상의 장소를 입력해주세요.');
      return;
    }

    // AJAX를 통해 백엔드 서버에 장소 목록 전송
    $.ajax({
      url: 'https://www.2024capstoneaiplanner.site/api/drawline', // 백엔드 엔드포인트
      type: 'POST', // POST 요청으로 전송
      contentType: 'application/json',
      data: JSON.stringify({ places: places }), // 입력된 장소들을 JSON 형식으로 전송
      success: function(data) {
        // 성공적으로 경로 정보를 받아왔을 때 처리
        console.log('Received data:', data);
        showRouteOnMap(data); // 지도에 경로 표시 함수 호출
      },
      error: function(xhr, status, error) {
        // 오류 발생 시 처리
        console.error('Error fetching route:', error);
        alert('경로 검색에 실패했습니다.');
      }
    });
  });

  // 지도에 경로를 선으로 표시하는 함수
  function showRouteOnMap(routeData) {
    // 경로 정보를 이용하여 지도에 선 그리기
    const path = routeData.map(point => new kakao.maps.LatLng(point.y, point.x));

    // 지도에 표시할 선 생성
    const polyline = new kakao.maps.Polyline({
      path: path,
      strokeWeight: 4,
      strokeColor: '#FF0000',
      strokeOpacity: 0.7,
      strokeStyle: 'solid'
    });

    // 지도에 선 표시
    polyline.setMap(map1);

    // 첫 번째 장소로 지도 중심 이동
    map1.setCenter(new kakao.maps.LatLng(path[0].getLat(), path[0].getLng()));
  }
});
