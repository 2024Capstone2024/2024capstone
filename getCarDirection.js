const getCarDirection = async () => {
  try {
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
};
