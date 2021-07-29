const express = require('express');
const bodyParser = require('body-parser');
const favoriteRouter = express.Router();

const Favorite = require('../models/favorites');
const cors = require('./cors');

const authenticate = require('../authenticate');

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        Favorite.find({})
            .populate('user')
            .populate('dishes')
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({})
            .then((favorites) => {
                if (favorites.length > 0) {
                    if (req.body.length > 0) {
                        for (dish of req.body) {
                            if (favorites[0].dishes.indexOf(dish._id) == -1) {
                                favorites[0].dishes.push(dish._id);
                            }
                        }
                    }
                    favorites[0].save()
                        .then((favorite) => {
                            Favorite.findById(favorite._id)
                                .then((favorite) => {
                                    console.log('favorite Created ', favorite);
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                })

                        })


                } else {
                    Favorite.create(new Favorite())
                        .then((favorite) => {
                            favorite.user = req.user._id;
                            if (req.body.length > 0) {
                                for (dish of req.body) {
                                    favorite.dishes.push(dish._id);
                                }
                            }

                            favorite.save()
                                .then((favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                })

                        }, (err) => next(err))
                        .catch((err) => next(err));
                }
            })


    })

    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('put operation not supported on /favorites');
    })

    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });


favoriteRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        Favorite.findById(req.params.favoriteId)
            .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err))
            .catch((err) => next(err));
    })

    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({})
            .then((favorites) => {
                if (favorites.length > 0) {
                    if (favorites[0].dishes.indexOf(req.params.dishId) == -1) {
                        favorites[0].dishes.push(req.params.dishId);
                    }
                    favorites[0].save()
                        .then((favorite) => {
                            Favorite.findById(favorite._id)
                                .then((favorite) => {
                                    console.log('favorite Created ', favorite);
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                })

                        })


                }
            })

    })


    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {

        res.statusCode = 403;
        res.end('POST operation not supported on /favorites/' + req.params.favoriteId);
    })

    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({})
            .then((favorites) => {
                for (let i = 0; i < favorites[0].dishes.length; i++) {
                    if (favorites[0].dishes[i]._id == req.params.dishId) {
                        favorites[0].dishes.splice(i, 1);
                    }
                }
                favorites[0].save()
                    .then((resp) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(resp);
                    })

            }, (err) => next(err))
            .catch((err) => next(err));
    });

module.exports = favoriteRouter;