const Game = require('../models/games');

module.exports.index = async (req, res) => {
	const games = await Game.find({});
	res.render('games/index', { games });
};

module.exports.renderNewForm = (req, res) => {
	res.render('games/new');
};

module.exports.addGame = async (req, res) => {
	const game = new Game(req.body.game);
	game.author = req.user._id;
	await game.save();
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
	const game = await Game.findByIdAndUpdate(id, { ...req.body.game });
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
