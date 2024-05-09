
var mapOptions = {
  center: new naver.maps.LatLng(37.5665, 126.9780), // �ʱ� ���� �߽� ��ǥ
  zoom: 10, // �ʱ� ���� Ȯ�� ����
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
            return alert('���� �߸��Ǿ����ϴ�.');
        }

        var result = response.result, // �˻� ����� �����̳�
            items = result.items; // ���� �˻� ���

        // ��� ����� ���� div�� �ҷ��ɴϴ�.
        var resultDiv = document.getElementById('result');
        resultDiv.innerHTML = ''; // ���� �˻������ �ʱ�ȭ�մϴ�.

        // �˻��� ����� ��ǥ�� ����մϴ�.
        for (var i=0; i<items.length; i++) {
            // �˻� ��� �׸� ��ü���� �ּҿ� ��ǥ ������ �����մϴ�.
            var item = items[i],
                addr = item.address,
                point = item.point;

            center: new naver.maps.LatLng(point.y, point.x), // �ʱ� ���� �߽� ��ǥ
            zoom: 10, // �ʱ� ���� Ȯ�� ����
        }
    });




var map = new naver.maps.Map('map', mapOptions);

function findPath() {
  var start = document.getElementById('start').value;
  var end = document.getElementById('end').value;

  if (start === '' || end === '') {
    alert('������� �������� �Է��ϼ���.');
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
    // ���⿡�� data�� ������� ������ ��θ� �׸��� ������ �����մϴ�.
  })
  .catch(error => console.error('Error:', error));
}
