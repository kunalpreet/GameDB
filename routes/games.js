const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const expressError = require('../utils/expressError');
const Game = require('../models/games');
const { gameSchema } = require('../validationSchema');
const { isLoggedIn } = require('../middleware');

const validateGame = (req, res, next) => {
	const { error } = gameSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(',');
		throw new expressError(msg, 400);
	} else {
		next();
	}
};

router.get(
	'/',
	catchAsync(async (req, res) => {
		const games = await Game.find({});
		res.render('games/index', { games });
	})
);

router.get('/new', isLoggedIn, (req, res) => {
	res.render('games/new');
});

router.post(
	'/',
	isLoggedIn,
	validateGame,
	catchAsync(async (req, res) => {
		const game = new Game(req.body.game);
		game.author = req.user._id;
		await game.save();
		req.flash('success', 'Successfully added a new game!');
		res.redirect(`/games/${game._id}`);
	})
);

router.get(
	'/:id',
	catchAsync(async (req, res) => {
		const game = await Game.findById(req.params.id).populate('reviews').populate('author');
		if (!game) {
			req.flash('error', 'Cannot find game! ');
			return res.redirect('/games');
		}
		res.render('games/show', { game });
	})
);

router.get(
	'/:id/edit',
	isLoggedIn,
	catchAsync(async (req, res) => {
		const game = await Game.findById(req.params.id);
		if (!game) {
			req.flash('error', 'Cannot find game! ');
			return res.redirect('/games');
		}
		res.render('games/edit', { game });
	})
);

router.put(
	'/:id',
	isLoggedIn,
	validateGame,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const game = await Game.findByIdAndUpdate(id, { ...req.body.game });
		req.flash('success', 'Successfully updated game!');
		res.redirect(`/games/${game._id}`);
	})
);

router.delete(
	'/:id',
	isLoggedIn,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		await Game.findByIdAndDelete(id);
		res.redirect('/games');
	})
);

module.exports = router;
