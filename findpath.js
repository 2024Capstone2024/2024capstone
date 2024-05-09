var mapOptions = {
    center: new naver.maps.LatLng(37.3595704, 127.105399),
    zoom: 10
};

var map = new naver.maps.Map('map', mapOptions);

function searchPlace() {
    var inputPlace = document.getElementById('test').value;

    console.log('��� �Է�:', inputPlace);

    naver.maps.Service.geocode({
        query: inputPlace
    }, function(status, response) {

        console.log('���� ���� ����:', status);

        if (status !== naver.maps.Service.Status.OK) {
            return alert(inputPlace + '�� ��ǥ�� ã�� �� �����ϴ�.');
        }

        var result = response.result,
            items = result.items;

        // �˻��� ����� ù ��° ����� ��ǥ�� ������ �߽� �̵�
        var firstItem = items[0],
            coords = new naver.maps.LatLng(firstItem.point.y, firstItem.point.x);

        map.setCenter(coords); // ������ �߽��� �˻� ����� �̵�
        map.setZoom(12); // ������ �� ���� ����

        // �˻��� ��ġ�� ��Ŀ ����
        new naver.maps.Marker({
            position: coords,
            map: map
        });

        // ��ǥ�� �ֿܼ� ���
        console.log('�˻� ��ġ:', firstItem.address);
        console.log('����:', firstItem.point.y);
        console.log('�浵:', firstItem.point.x);
        
        // ����ڰ� Ȯ���� ���� alert â���ε� ���
        alert('�˻� ��ġ: ' + firstItem.address + '\n����: ' + firstItem.point.y + '\n�浵: ' + firstItem.point.x);
    });
}
