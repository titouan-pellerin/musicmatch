const axios = require('axios');
const express = require("express");
const router = express.Router();

const { client_id, client_secret } = require('../config/credentials');

router
    .route("/")
    .get(async (req, res) => {
        const refresh_token = req.query.refresh_token;
        axios({
            url: 'https://accounts.spotify.com/api/token',
            method: 'post',
            params: {
                grant_type: 'refresh_token',
                refresh_token
            },
            headers: {
                Authorization: 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')),
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(response => res.send(response.data)
        ).catch(error => res.send(error));
    });

module.exports = router;

