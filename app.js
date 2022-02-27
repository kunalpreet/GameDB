const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const { gameSchema } = require('./validationSchema');
const catchAsync = require('./utils/catchAsync');
const Game = require('./models/games');
const methodOverride = require('method-override');
const expressError = require('./utils/expressError');
const req = require('express/lib/request');
const exp = require('constants');

mongoose.connect('mongodb://localhost:27017/GameDB');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Database connected');
});

const app = express();
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateGame = (req, res, next) => {
	const { error } = gameSchema.validate(req.body);
	if (error) {
		const msg = error.details.map((el) => el.message).join(',');
		throw new expressError(msg, 400);
	} else {
		next();
	}
};

app.get('/', (req, res) => {
	res.render('home');
});

app.get(
	'/games',
	catchAsync(async (req, res) => {
		const games = await Game.find({});
		res.render('games/index', { games });
	})
);

app.get('/games/new', (req, res) => {
	res.render('games/new');
});

app.post(
	'/games',
	validateGame,
	catchAsync(async (req, res) => {
		// if (!req.body.game) throw new expressError('Invalid Game Data', 400);
		const game = new Game(req.body.game);
		await game.save();
		res.redirect(`/games/${game._id}`);
	})
);

app.get(
	'/games/:id',
	catchAsync(async (req, res) => {
		const game = await Game.findById(req.params.id);
		res.render('games/show', { game });
	})
);

app.get(
	'/games/:id/edit',
	catchAsync(async (req, res) => {
		const game = await Game.findById(req.params.id);
		res.render('games/edit', { game });
	})
);

app.put(
	'/games/:id',
	validateGame,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const game = await Game.findByIdAndUpdate(id, { ...req.body.game });
		res.redirect(`/games/${game._id}`);
	})
);

app.delete(
	'/games/:id',
	catchAsync(async (req, res) => {
		const { id } = req.params;
		await Game.findByIdAndDelete(id);
		res.redirect('/games');
	})
);

app.all('*', (req, res, next) => {
	next(new expressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
	const { scode = 500 } = err;
	if (!err.mes) err.mes = 'something went wrong';
	res.status(scode).render('errors', { err });
});

app.listen(3000, () => {
	console.log('Serving on port 3000');
});
