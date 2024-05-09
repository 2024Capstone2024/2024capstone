
        var map;
        var geocoder = new kakao.maps.services.Geocoder();
        var polyline;

        // 지도 초기화
        function initMap() {
            var mapContainer = document.getElementById('map');
            var mapOptions = {
                center: new kakao.maps.LatLng(37.5665, 126.9780),
                level: 5
            };

            map = new kakao.maps.Map(mapContainer, mapOptions);
        }

        initMap();

        // 경로그리기
        function searchRoutes() {
            var startAddress = document.getElementById('startLocation').value;
            var endAddress = document.getElementById('endLocation').value;
            var places = new kakao.maps.services.Places();


            places.keywordSearch(startAddress, function(startResult, startStatus) {
                if (startStatus === kakao.maps.services.Status.OK && startResult.length > 0) {
                    var startCoords = new kakao.maps.LatLng(startResult[0].y, startResult[0].x);

                    places.keywordSearch(endAddress, function(endResult, endStatus) {
                        if (endStatus === kakao.maps.services.Status.OK && endResult.length > 0) {
                            var endCoords = new kakao.maps.LatLng(endResult[0].y, endResult[0].x);

                            deleteLines();

                            polyline = new kakao.maps.Polyline({
                                path: [startCoords, endCoords], 
                                strokeWeight: 3,
                                strokeColor: '#FF0000', 
                                strokeOpacity: 0.7, 
                                strokeStyle: 'solid' 
                            });

                            
                            polyline.setMap(map);

                            
                            var bounds = new kakao.maps.LatLngBounds();
                            bounds.extend(startCoords);
                            bounds.extend(endCoords);
                            map.setBounds(bounds);
                        } else {
                            alert('도착지를 찾을 수 없습니다.');
                        }
                    });
                } else {
                    alert('출발지를 찾을 수 없습니다.');
                }
            });
        }

        
        function deleteLines() {
            
            if (polyline) {
                polyline.setMap(null);
                polyline = null;
            }
        }

        
