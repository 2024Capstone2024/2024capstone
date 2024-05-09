
var mapOptions = {
  center: new naver.maps.LatLng(37.5665, 126.9780), // 초기 지도 중심 좌표
  zoom: 10, // 초기 지도 확대 레벨
};

function searchPlaces() {
    var start = document.getElementById('start').value;
    if (!start) {
        
        return;
    }

    naver.maps.Service.geocode({
        start: start
    }, function(status, response) {
        if (status !== naver.maps.Service.Status.OK) {
            return alert('무언가 잘못되었습니다.');
        }

        var result = response.result, // 검색 결과의 컨테이너
            items = result.items; // 개별 검색 결과

        // 결과 출력을 위한 div를 불러옵니다.
        var resultDiv = document.getElementById('result');
        resultDiv.innerHTML = ''; // 이전 검색결과를 초기화합니다.

        // 검색된 장소의 좌표를 출력합니다.
        for (var i=0; i<items.length; i++) {
            // 검색 결과 항목 객체에서 주소와 좌표 정보를 추출합니다.
            var item = items[i],
                addr = item.address,
                point = item.point;

            center: new naver.maps.LatLng(point.y, point.x), // 초기 지도 중심 좌표
            zoom: 10, // 초기 지도 확대 레벨
        }
    });




var map = new naver.maps.Map('map', mapOptions);

function findPath() {
  var start = document.getElementById('start').value;
  var end = document.getElementById('end').value;

  if (start === '' || end === '') {
    alert('출발지와 도착지를 입력하세요.');
    return;
  }

  var url = `https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving?start=${start}&goal=${end}`;
  fetch(url, {
    method: 'GET',
    headers: {
      "X-NCP-APIGW-API-KEY-ID": "c0w8ndso09",
      "X-NCP-APIGW-API-KEY": "7h1PvSASmJtVvaWvYdI9aJj7hXEl0IcQ3B0JpaFB",
    },
  })
  .then(response => response.json())
  .then(data => {
    console.log(data);
    // 여기에서 data를 기반으로 지도에 경로를 그리는 로직을 구현합니다.
  })
  .catch(error => console.error('Error:', error));
}
