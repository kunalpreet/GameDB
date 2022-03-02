mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/dark-v10',
	center: game.geometry.coordinates, // starting position
	zoom: 11
});
map.addControl(new mapboxgl.NavigationControl());
new mapboxgl.Marker()
	.setLngLat(game.geometry.coordinates)
	.setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>${game.author.username}</h3>`))
	.addTo(map);
