let dayData = []; // 각 날짜별 데이터를 저장할 배열
let polylines = []; // Polyline 객체들을 저장할 배열

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

// 지도 중심을 이동시키는 함수
function setCenter(lat, lng) {
    const moveLatLon = new kakao.maps.LatLng(lat, lng);
    map.panTo(moveLatLon);
}

// 지도에 마커를 추가하는 함수
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
            dayData[dayIndex][pointType].marker.setMap(null); // 기존 마커 제거
        }
        dayData[dayIndex][pointType] = { marker, lat, lng };
    }
    marker.setMap(map);
}

// 장소 이름으로 위도와 경도를 가져오는 함수
function getLatLngFromPlace(placeName) {
    return new Promise((resolve, reject) => {
        const ps = new kakao.maps.services.Places();
        ps.keywordSearch(placeName, (data, status) => {
            if (status === kakao.maps.services.Status.OK) {
                const lat = data[0].y;
                const lng = data[0].x;
                resolve({ lat, lng });
            } else {
                reject(new Error('Failed to find place'));
            }
        });
    });
}

// 장소 설정 함수 (출발지, 목적지, 경유지)
async function setPlace(pointType, dayIndex) {
    const placeName = document.getElementById(pointType === 'startPoint' ? `startPlace${dayIndex}` : (pointType === 'endPoint' ? `endPlace${dayIndex}` : `waypointPlace${dayIndex}`)).value;
    try {
        const { lat, lng } = await getLatLngFromPlace(placeName);
        setPoint(lat, lng, pointType, dayIndex);
    } catch (error) {
        console.error('Error:', error);
    }
}

// 경로 요청 및 표시 함수
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
            throw new Error(`HTTP error! Status: ${response.status}`);
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

        // 이전에 생성된 Polyline 제거
        if (polylines[dayIndex]) {
            polylines[dayIndex].setMap(null);
        }

        const polyline = new kakao.maps.Polyline({
            path: linePath,
            strokeWeight: 5,
            strokeColor: '#000000',
            strokeOpacity: 0.7,
            strokeStyle: 'solid'
        });
        
        // Polyline을 지도에 추가
        polyline.setMap(map);
        polylines[dayIndex] = polyline;

        // 체크 해제된 다른 경로는 지도에서 제거
        polylines.forEach((poly, index) => {
            if (index !== dayIndex && poly) {
                poly.setMap(null);
            }
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

// 체크박스 선택에 따라 경로 표시 제어
function showRouteForDay(dayIndex, isChecked) {
    if (isChecked) {
        if (polylines[dayIndex]) {
            polylines[dayIndex].setMap(map); // Polyline을 지도에 추가

            // 지도 중심을 출발지로 이동
            const startLatLng = new kakao.maps.LatLng(dayData[dayIndex].startPoint.lat, dayData[dayIndex].startPoint.lng);
            map.panTo(startLatLng);
        } else {
            getCarDirection(dayIndex); // Polyline이 없으면 경로를 새로 가져옴
        }
    } else {
        // Polyline을 지도에서 제거
        if (polylines[dayIndex]) {
            polylines[dayIndex].setMap(null);
        }
    }
}

// 날짜 추가 함수
function Day() {
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

    // 체크박스 추가
    const checkboxContainer = document.getElementById('checkboxContainer');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `dayCheckbox${dayIndex}`;
    checkbox.value = dayIndex;
    checkbox.onchange = () => showRouteForDay(dayIndex, checkbox.checked);
    checkboxContainer.appendChild(checkbox);
    const label = document.createElement('label');
    label.htmlFor = `dayCheckbox${dayIndex}`;
    label.innerText = `Day ${dayIndex + 1}`;
    checkboxContainer.appendChild(label);
}

// `Add Day` 버튼 클릭 이벤트 추가
document.getElementById('addDayBtn').addEventListener('click', Day);

// 초기적으로 첫 번째 날짜 폼을 추가
Day();
