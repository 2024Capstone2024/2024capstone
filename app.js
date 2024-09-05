let dayData = []; // 각 날짜의 데이터 저장
let currentDayIndex = 0; // 현재 날짜 인덱스

window.onload = function () {
    const kakao = window.kakao;
    kakao.maps.load(() => {
        const mapContainer = document.getElementById('map4');
        const mapOption = {
            center: new kakao.maps.LatLng(37.566826, 126.9786567),
            level: 7
        };

        map = new kakao.maps.Map(mapContainer, mapOption);
    });
};

// 지도 중심 이동 함수
function setCenter(lat, lng) {
    const moveLatLon = new kakao.maps.LatLng(lat, lng);
    map.panTo(moveLatLon);
}

// 지도에 마커 추가 함수
function setPoint(lat, lng, pointType, dayIndex) {
    setCenter(lat, lng);
    let marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(lat, lng)
    });

    if (!dayData[dayIndex]) dayData[dayIndex] = { startPoint: null, endPoint: null, waypoints: [] };

    if (pointType === 'waypoint') {
        if (dayData[dayIndex].waypoints.length >= 5) dayData[dayIndex].waypoints.shift(); // 최대 5개 경유지 유지
        dayData[dayIndex].waypoints.push({ marker, lat, lng });
    } else {
        if (dayData[dayIndex][pointType]) {
            dayData[dayIndex][pointType].marker.setMap(null);
        }
        dayData[dayIndex][pointType] = { marker, lat, lng };
    }
    marker.setMap(map);
}

// 장소 이름으로 위도와 경도 가져오기 함수
function getLatLngFromPlace(placeName) {
    return new Promise((resolve, reject) => {
        const ps = new kakao.maps.services.Places();
        ps.keywordSearch(placeName, (data, status) => {
            if (status === kakao.maps.services.Status.OK) {
                const lat = data[0].y;
                const lng = data[0].x;
                resolve({ lat, lng });
            } else {
                reject(new Error('장소를 찾을 수 없습니다.'));
            }
        });
    });
}

async function setPlace(pointType, dayIndex) {
    const placeName = document.getElementById(pointType === 'startPoint' ? 'startPlace' : (pointType === 'endPoint' ? 'endPlace' : 'waypointPlace')).value;
    try {
        const { lat, lng } = await getLatLngFromPlace(placeName);
        setPoint(lat, lng, pointType, dayIndex);
    } catch (error) {
        console.error('오류:', error);
    }
}

// 경로를 설정하고 표시하는 함수
async function getCarDirection(dayIndex) {
    if (!dayData[dayIndex] || !dayData[dayIndex].startPoint || !dayData[dayIndex].endPoint) {
        console.error('출발지 또는 목적지가 설정되지 않았습니다.');
        return;
    }

    try {
        const response = await fetch('https://www.2024capstoneaiplanner.site/api/getCarDirection', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                startPoint: {
                    lat: dayData[dayIndex].startPoint.lat,
                    lng: dayData[dayIndex].startPoint.lng
                },
                endPoint: {
                    lat: dayData[dayIndex].endPoint.lat,
                    lng: dayData[dayIndex].endPoint.lng
                },
                waypoints: dayData[dayIndex].waypoints.map(point => ({
                    lat: point.lat,
                    lng: point.lng
                }))
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP 오류! 상태: ${response.status}`);
        }

        const data = await response.json();

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
        console.error('오류:', error);
    }
}

// 날짜 추가 함수
function addDay() {
    const daySections = document.getElementById('daySections');
    const dayIndex = daySections.children.length;

    const section = document.createElement('div');
    section.className = 'day-section';
    section.innerHTML = `
        <h2>Day ${dayIndex + 1}</h2>
        <input type="text" id="startPlace${dayIndex}" placeholder="출발지 입력">
        <input type="text" id="endPlace${dayIndex}" placeholder="도착지 입력">
        <input type="text" id="waypointPlace${dayIndex}" placeholder="경유지 입력">
        <button onclick="setPlace('startPoint', ${dayIndex})">출발지 설정</button>
        <button onclick="setPlace('endPoint', ${dayIndex})">도착지 설정</button>
        <button onclick="setPlace('waypoint', ${dayIndex})">경유지 추가</button>
        <button onclick="getCarDirection(${dayIndex})">경로 표시</button>
        <ul id="waypointList${dayIndex}"></ul>
    `;
    daySections.appendChild(section);
}

// `Add Day` 버튼 클릭 이벤트 추가
document.getElementById('addDayBtn').addEventListener('click', addDay);

// 초기적으로 첫 번째 날짜 폼을 추가
addDay();
