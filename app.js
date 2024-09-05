let map;
let pointObj = {
    startPoint: { marker: null, lat: null, lng: null },
    endPoint: { marker: null, lat: null, lng: null },
    waypoints: [] // 경유지 리스트
};

window.onload = function () {
    // 지도 초기화
    const mapContainer = document.getElementById('map');
    const mapOptions = {
        center: new kakao.maps.LatLng(33.452613, 126.570888),
        level: 3
    };
    map = new kakao.maps.Map(mapContainer, mapOptions);
};

// 지도 중심을 이동시키는 함수
function setCenter(lat, lng) {
    const moveLatLon = new kakao.maps.LatLng(lat, lng);
    map.panTo(moveLatLon);
}

// 지도에 마커를 추가하는 함수
function setPoint(lat, lng, pointType) {
    setCenter(lat, lng);
    let marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(lat, lng)
    });

    if (pointType === 'waypoint') {
        if (pointObj.waypoints.length >= 5) pointObj.waypoints.shift(); // 최대 5개 경유지 유지
        pointObj.waypoints.push({ marker, lat, lng });
    } else {
        if (pointObj[pointType].marker !== null) {
            pointObj[pointType].marker.setMap(null);
        }
        pointObj[pointType] = { marker, lat, lng };
    }
    marker.setMap(map);
}

// 장소 이름으로 위도와 경도를 가져오는 함수
function getLatLngFromPlace(placeName) {
    return new Promise((resolve, reject) => {
        const ps = new kakao.maps.services.Places();
        ps.keywordSearch(placeName, (data, status) => {
            if (status === kakao.maps.services.Status.OK) {
                const lat = data[0].y; // 위도
                const lng = data[0].x; // 경도
                resolve({ lat, lng });
            } else {
                reject(new Error('Failed to find place'));
            }
        });
    });
}

// 장소를 설정하는 함수
async function setPlace(pointType) {
    const placeName = document.getElementById(pointType === 'startPoint' ? 'startPlace' : (pointType === 'endPoint' ? 'endPlace' : 'waypointPlace')).value;
    try {
        const { lat, lng } = await getLatLngFromPlace(placeName);
        setPoint(lat, lng, pointType);
    } catch (error) {
        console.error('Error:', error);
    }
}

// 카카오 API로 경로를 구하는 함수
async function getCarDirection() {
    if (!pointObj.startPoint.lat || !pointObj.endPoint.lat) {
        console.error('출발지 또는 목적지가 설정되지 않았습니다.');
        return;
    }

    try {
        // 백엔드로 요청 보내기
        const response = await fetch('/api/getCarDirection', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                startPoint: pointObj.startPoint,
                endPoint: pointObj.endPoint,
                waypoints: pointObj.waypoints
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // 받아온 경로 데이터를 지도에 표시
        const linePath = [];
        data.routes[0].sections.forEach(section => {
            section.roads.forEach(road => {
                road.vertexes.forEach((vertex, index) => {
                    if (index % 2 === 0) {
                        linePath.push(new kakao.maps.LatLng(road.vertexes[index + 1], road.vertexes[index]));
                    }
                });
            });
        });

        const polyline = new kakao.maps.Polyline({
            path: linePath,
            strokeWeight: 5,
            strokeColor: '#000000',
            strokeOpacity: 0.7,
            strokeStyle: 'solid'
        });
        polyline.setMap(map);

    } catch (error) {
        console.error('Error:', error);
    }
}


// 장소 간 거리를 계산하는 함수
function calculateDistances() {
    const places = [
        pointObj.startPoint,
        ...pointObj.waypoints,
        pointObj.endPoint
    ].filter(point => point.lat && point.lng);

    const distanceList = document.getElementById('distanceList');
    distanceList.innerHTML = '';

    for (let i = 0; i < places.length; i++) {
        for (let j = i + 1; j < places.length; j++) {
            const distance = calculateDistance(
                places[i].lat, places[i].lng,
                places[j].lat, places[j].lng
            );
            const li = document.createElement('li');
            li.textContent = `${i === 0 ? '출발지' : i === places.length - 1 ? '목적지' : `경유지 ${i}`} - ${j === 0 ? '출발지' : j === places.length - 1 ? '목적지' : `경유지 ${j}`}: ${distance.toFixed(2)} km`;
            distanceList.appendChild(li);
        }
    }
}

// 두 좌표 간 거리를 계산하는 함수
function calculateDistance(lat1, lng1, lat2, lng2) {
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLng = (lng2 - lng1) * rad;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
              Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = 6371 * c; // 지구의 반지름 (킬로미터)
    return distance;
}
