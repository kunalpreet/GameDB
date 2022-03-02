const express = require('express');
const router = express.Router();
const games = require('../controllers/games');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, validateGame, isAuthor } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Game = require('../models/games');

router
	.route('/')
	.get(catchAsync(games.index))
	.post(isLoggedIn, upload.array('image'), validateGame, catchAsync(games.addGame));

router.get('/new', isLoggedIn, games.renderNewForm);

router
	.route('/:id')
	.get(catchAsync(games.showGame))
	.put(isLoggedIn, isAuthor, upload.array('image'), validateGame, catchAsync(games.updateGame))
	.delete(isLoggedIn, isAuthor, catchAsync(games.deleteGame));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(games.renderEditForm));

module.exports = router;
