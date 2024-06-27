        var map = null;
        var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

        // 지도 초기화
        function initMap() {
            var mapContainer = document.getElementById('map');
            var mapOptions = {
                center: new kakao.maps.LatLng(37.566826, 126.9786567), // 초기 중심 좌표 (서울시청)
                level: 3 // 초기 확대 레벨
            };
            map = new kakao.maps.Map(mapContainer, mapOptions);
        }

        // 장소 검색 및 표시
        function searchPlace() {
            var keyword = document.getElementById('keyword').value;

            // 백엔드 API 호출
            axios.get('http://localhost:8080/api/searchPlace', {
                params: {
                    keyword: keyword
                }
            })
            .then(response => {
                var place = response.data;

                // 장소 위치 정보
                var placePosition = new kakao.maps.LatLng(place.y, place.x);

                // 마커 생성
                var marker = new kakao.maps.Marker({
                    position: placePosition
                });

                // 마커를 지도에 표시
                marker.setMap(map);

                // 지도 중심을 선택한 장소 위치로 이동
                map.setCenter(placePosition);

                // 정보창에 장소 이름 표시
                infowindow.setContent('<div style="padding:10px;">' + place.place_name + '</div>');
                infowindow.open(map, marker);
            })
            .catch(error => {
                console.error('Error fetching data from backend:', error);
                alert('검색 결과를 가져오는 중 오류가 발생했습니다.');
            });
        }

        // 페이지 로드 시 지도 초기화
        document.addEventListener('DOMContentLoaded', function () {
            initMap();
        });