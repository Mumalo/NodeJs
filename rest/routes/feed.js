const express = require('express');
const feedsController = require('../controllers/feed');

const router = express.Router();

router.get('/posts', feedsController.getPosts)
