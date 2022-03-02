const Game = require('../models/games');

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary');
module.exports.index = async (req, res) => {
	const games = await Game.find({});
	res.render('games/index', { games });
};

module.exports.renderNewForm = (req, res) => {
	res.render('games/new');
};

module.exports.addGame = async (req, res) => {
	const geoData = await geocoder
		.forwardGeocode({
			query: req.body.game.location,
			limit: 1
		})
		.send();
	const game = new Game(req.body.game);
	game.geometry = geoData.body.features[0].geometry;
	game.images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
	game.author = req.user._id;
	await game.save();
	console.log(game);
	req.flash('success', 'Successfully added a new game!');
	res.redirect(`/games/${game._id}`);
};

module.exports.showGame = async (req, res) => {
	const game = await Game.findById(req.params.id)
		.populate({
			path: 'reviews',
			populate: {
				path: 'author'
			}
		})
		.populate('author');
	if (!game) {
		req.flash('error', 'Cannot find game! ');
		return res.redirect('/games');
	}
	res.render('games/show', { game });
};

module.exports.updateGame = async (req, res) => {
	const { id } = req.params;
	console.log(req.body);
	const game = await Game.findByIdAndUpdate(id, { ...req.body.game });
	const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
	game.images.push(...imgs);
	await game.save();
	if (req.body.deleteImages) {
		for (let filename of req.body.deleteImages) {
			await cloudinary.uploader.destroy(filename);
		}
		await game.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
	}
	req.flash('success', 'Successfully updated game!');
	res.redirect(`/games/${game._id}`);
};

module.exports.renderEditForm = async (req, res) => {
	const game = await Game.findById(req.params.id);
	if (!game) {
		req.flash('error', 'Cannot find game! ');
		return res.redirect('/games');
	}
	res.render('games/edit', { game });
};

module.exports.deleteGame = async (req, res) => {
	const { id } = req.params;
	await Game.findByIdAndDelete(id);
	req.flash('success', 'Successfully deleted game');
	res.redirect('/games');
};
