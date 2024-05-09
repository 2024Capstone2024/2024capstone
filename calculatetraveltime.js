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

                    // ��� �ӵ� 60km/h�� �����Ͽ� �̵� �ҿ� �ð� ���
                    var averageSpeed = 60; 
                    var travelTime = distance / averageSpeed; 
                    travelTime *= 60;

                    alert('cost time: about ' + Math.floor(travelTime) + 'minute');
                } else {
                    alert('�������� ã�� �� �����ϴ�.');
                }
            });
        } else {
            alert('������� ã�� �� �����ϴ�.');
        }
    });
}

// �� ���� ���� �����Ÿ� ��� �Լ�
function calculateDistance(startCoords, endCoords) {
    var latDiff = endCoords.getLat() - startCoords.getLat();
    var lngDiff = endCoords.getLng() - startCoords.getLng();

    var distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);

    return distance * 111; // 1���� ���� �Ǵ� �浵�� �� 111km
}

// �� ��° ��� �˻� ��ư Ŭ�� �̺�Ʈ �ڵ鷯 ���
$(document).ready(function() {
    $('#searchButton2').click(function() {
        calculateTravelTime();
    });
});
