const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Game = require('./models/games');
const methodOverride = require('method-override');
const exp = require('constants');

mongoose.connect('mongodb://localhost:27017/GameDB');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('Database connected');
});

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
	res.render('home');
});

app.get('/games', async (req, res) => {
	const games = await Game.find({});
	res.render('games/index', { games });
});

app.get('/games/new', (req, res) => {
	res.render('games/new');
});

app.post('/games', async (req, res) => {
	const game = new Game(req.body.game);
	await game.save();
	res.redirect(`/games/${game._id}`);
});

app.get('/games/:id', async (req, res) => {
	const game = await Game.findById(req.params.id);
	res.render('games/show', { game });
});

app.get('/games/:id/edit', async (req, res) => {
	const game = await Game.findById(req.params.id);
	res.render('games/edit', { game });
});

app.put('/games/:id', async (req, res) => {
	const { id } = req.params;
	const game = await Game.findByIdAndUpdate(id, { ...req.body.game });
	res.redirect(`/games/${game._id}`);
});

app.delete('/games/:id', async (req, res) => {
	const { id } = req.params;
	await Game.findByIdAndDelete(id);
	res.redirect('/games');
});

app.listen(3000, () => {
	console.log('Serving on port 3000');
});
