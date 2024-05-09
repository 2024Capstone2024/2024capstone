var mapOptions = {
    center: new naver.maps.LatLng(37.3595704, 127.105399),
    zoom: 10
};

var map = new naver.maps.Map('map', mapOptions);

function searchPlace() {
    var inputPlace = document.getElementById('test').value;

    console.log('장소 입력:', inputPlace);

    naver.maps.Service.geocode({
        query: inputPlace
    }, function(status, response) {

        console.log('서비스 응답 상태:', status);

        if (status !== naver.maps.Service.Status.OK) {
            return alert(inputPlace + '의 좌표를 찾을 수 없습니다.');
        }

        var result = response.result,
            items = result.items;

        // 검색된 장소의 첫 번째 결과의 좌표로 지도의 중심 이동
        var firstItem = items[0],
            coords = new naver.maps.LatLng(firstItem.point.y, firstItem.point.x);

        map.setCenter(coords); // 지도의 중심을 검색 결과로 이동
        map.setZoom(12); // 지도의 줌 레벨 조정

        // 검색된 위치에 마커 생성
        new naver.maps.Marker({
            position: coords,
            map: map
        });

        // 좌표를 콘솔에 출력
        console.log('검색 위치:', firstItem.address);
        console.log('위도:', firstItem.point.y);
        console.log('경도:', firstItem.point.x);
        
        // 사용자가 확인을 위해 alert 창으로도 출력
        alert('검색 위치: ' + firstItem.address + '\n위도: ' + firstItem.point.y + '\n경도: ' + firstItem.point.x);
    });
}
