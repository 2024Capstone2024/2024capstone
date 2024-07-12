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

  // 인포윈도우 객체 생성
  const infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

  // 검색된 장소를 지도에 표시하는 함수
  function showPlaceOnMap(place) {
    const placePosition = new kakao.maps.LatLng(place.y, place.x); // 장소의 좌표
    const marker = new kakao.maps.Marker({
      position: placePosition,
      map: map
    });

    // 지도 중심을 검색된 장소 위치로 이동 및 확대 레벨 설정
    map.setCenter(placePosition);
    map.setLevel(4); // 지도를 더 확대합니다

    // 마커 클릭 시 인포윈도우 표시
    kakao.maps.event.addListener(marker, 'click', () => {
      infowindow.setContent(`
        <div style="padding:5px;font-size:12px;">
          <strong>${place.place_name}</strong><br>
          ${place.address_name}<br>
          <a href="${place.place_url}" target="_blank">자세히 보기</a>
        </div>
      `);
      infowindow.open(map, marker);
    });
  }

  // 장소 검색 함수
  function searchPlace(keyword) {
    fetch(`https://www.2024capstoneaiplanner.site/api/searchPlace?keyword=${encodeURIComponent(keyword)}`)
      .then(response => response.json())
      .then(data => {
        if (data.length === 0) {
          alert('장소를 찾을 수 없습니다.');
          return;
        }
        showPlaceOnMap(data[0]); // 검색 결과의 첫 번째 장소를 지도에 표시
      })
      .catch(error => {
        console.error('Error searching place:', error);
        alert('장소 검색에 실패했습니다.');
      });
  }

  // 검색 버튼 클릭 이벤트 처리
  const searchBtn = document.getElementById('searchBtn');
  searchBtn.addEventListener('click', () => {
    const keyword = document.getElementById('keyword').value;
    searchPlace(keyword);
  });
});
