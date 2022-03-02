const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Game = require('../models/games');

mongoose.connect('mongodb://localhost:27017/GameDB');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Database connected');
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
	await Game.deleteMany({});
	for (let i = 0; i < 200; i++) {
		const random1000 = Math.floor(Math.random() * 1000);
		const price = Math.floor(Math.random() * 100) + 5;
		const game = new Game({
			author: '621c31ce58e1e80b874f4e12',
			location: `${cities[random1000].city}, ${cities[random1000].state}`,
			title: `${sample(descriptors)} ${sample(places)}`,
			images: [
				{
					url:
						'https://res.cloudinary.com/deivax16v/image/upload/v1646184272/GameDB/e5lbmzocm0uzi8aimjbl.jpg',
					filename: 'GameDB/e5lbmzocm0uzi8aimjbl'
				}
			],
			description: 'dkjahfewfhwjfhwefhweofhweofhweofh',
			price,
			geometry: { type: 'Point', coordinates: [ cities[random1000].longitude, cities[random1000].latitude ] }
		});
		await game.save();
	}
};

seedDB().then(() => {
	mongoose.connection.close();
});
