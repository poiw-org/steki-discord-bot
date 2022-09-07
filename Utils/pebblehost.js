const axios = require("axios");
const querystring = require('querystring');
const crypto = require("crypto");

module.exports = async function(method, content = {}, user, key) {
    let keystr = "";
    let params = content ? content : {};

    // Add API method & user
    params["_MulticraftAPIMethod"] = method;
    params["_MulticraftAPIUser"] = user;

    // Generate string to then HMAC it
    for (var param in params) {
        if (!params.hasOwnProperty(param)) continue;
        keystr += param + params[param].toString();
    }

    // Creates HMAC of parameters, using Multicraft API key as message key
    let hmac = crypto.createHmac('sha256', key);
    hmac.update(keystr);
    let digest = hmac.digest('hex');

    // Add generated digest to parameters
    params["_MulticraftAPIKey"] = digest;

    try {
        // Use library to encode parameters into querystring body
        const encodedParams = querystring.stringify(params);

        // Make request to panel API
        const { data } = await axios.post("https://panel.pebblehost.com/api.php", encodedParams, {
            // Encourage Cloudflare to allow the request
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0',
                'Referer': 'https://panel.pebblehost.com'
            }
        });
        return data;
    } catch (e) {
        throw new Error("API responded with error status " + e.status);
    }
}