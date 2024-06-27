// 카카오맵 API 초기화
const kakao = window.kakao;
kakao.maps.load(() => {
  const mapContainer = document.getElementById('map'); // 지도를 표시할 div
  const mapOption = {
    center: new kakao.maps.LatLng(37.566826, 126.9786567), // 지도 초기 중심 좌표 (서울)
    level: 7 // 지도 확대 레벨
  };

  // 지도 객체 생성
  const map = new kakao.maps.Map(mapContainer, mapOption);

  // 검색된 장소를 지도에 표시하는 함수
  function showPlaceOnMap(place) {
    const placePosition = new kakao.maps.LatLng(place.y, place.x); // 장소의 좌표
    const marker = new kakao.maps.Marker({
      position: placePosition,
      map: map
    });

    // 지도 중심을 검색된 장소 위치로 이동
    map.setCenter(placePosition);
  }

  // 장소 검색 함수
  function searchPlace() {
    const keyword = document.getElementById('keyword').value;

    // Axios를 이용한 백엔드 API 요청
    axios.get('http://Capstone2024-env.eba-dxm5trae.us-east-2.elasticbeanstalk.com/api/searchPlace', {
      params: { keyword: keyword }
    })
    .then(response => {
      showPlaceOnMap(response.data); // 검색 결과를 지도에 표시
    })
    .catch(error => {
      console.error('Error searching place:', error);
      alert('장소 검색에 실패했습니다.');
    });
  }
});
