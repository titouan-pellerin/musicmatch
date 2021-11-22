const axios = require('axios');
const express = require("express");
const router = express.Router();

const { client_id, client_secret, redirect_uri } = require('../config/credentials');

router
    .route("/")
    .get(async (req, res) => {
        const code = req.query.code;
        const postHeaders = {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        };
        try {
            let response = await axios({
                url: 'https://accounts.spotify.com/api/token',
                method: 'post',
                params: {
                    client_id,
                    client_secret,
                    code,
                    redirect_uri,
                    grant_type: 'authorization_code'
                },
                postHeaders
            });
            if (response.status === 200) {
                const { access_token, expires_in, refresh_token } = response.data;
                res.send(`
            <!DOCTYPE html>
                <html>
                <head>
                <script>
                window.opener && window.opener.postMessage(JSON.stringify({
                    type:'access_token',
                    access_token: '${access_token}',
                    expires_in: '${expires_in}',
                    refresh_token: '${refresh_token}'
                }), '*');
                window.close();
                </script>
                </head>
                <body>
                <span style="padding:2em; font: Helvetica, Arial; font-size: 12px; color: #333">
                This page should close in a few seconds.
                </span>
                </body>
                </html>
            `);
            }
        } catch (err) {
            console.log(err);
        }
    });

module.exports = router;

