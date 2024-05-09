function calculateTravelTime() {

    var startAddress = document.getElementById('startLocation2').value;
    var endAddress = document.getElementById('endLocation2').value;

    var places = new kakao.maps.services.Places();

    places.keywordSearch(startAddress, function(startResult, startStatus) {
        if (startStatus === kakao.maps.services.Status.OK && startResult.length > 0) {
            var startCoords = new kakao.maps.LatLng(startResult[0].y, startResult[0].x);

            places.keywordSearch(endAddress, function(endResult, endStatus) {
                if (endStatus === kakao.maps.services.Status.OK && endResult.length > 0) {
                    var endCoords = new kakao.maps.LatLng(endResult[0].y, endResult[0].x);

                    var distance = calculateDistance(startCoords, endCoords);

                    // 평균 속도 60km/h를 가정하여 이동 소요 시간 계산
                    var averageSpeed = 60; 
                    var travelTime = distance / averageSpeed; 
                    travelTime *= 60;

                    alert('cost time: about ' + Math.floor(travelTime) + 'minute');
                } else {
                    alert('도착지를 찾을 수 없습니다.');
                }
            });
        } else {
            alert('출발지를 찾을 수 없습니다.');
        }
    });
}

// 두 지점 간의 직선거리 계산 함수
function calculateDistance(startCoords, endCoords) {
    var latDiff = endCoords.getLat() - startCoords.getLat();
    var lngDiff = endCoords.getLng() - startCoords.getLng();

    var distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

    return distance * 111; // 1도의 위도 또는 경도는 약 111km
}

// 두 번째 경로 검색 버튼 클릭 이벤트 핸들러 등록
$(document).ready(function() {
    $('#searchButton2').click(function() {
        calculateTravelTime();
    });
});
