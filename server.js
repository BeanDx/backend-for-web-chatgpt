const http = require('http');
const dotenv = require('dotenv').config(); // for env
const bodyParser = require('body-parser');

const API_KEY = process.env.OPEN_AI_KEY;

async function sendRequest(prompt) {
    const fetch = await import('node-fetch');
    const response = await fetch.default("https://api.openai.com/v1/engines/text-davinci-003/completions?model=text-davinci-003", {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            prompt: prompt,
            max_tokens: 2000,
            n: 5,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0.6,
            stop: ["You"]
        })
    });
    if (!response.ok) {
        throw Error(`Ошибка HTTP: ${response.status}`);
    }
    const data = await response.json();
    return data;
};

http.createServer(function (req, res) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url == '/') {
        res.end('main page');
    }
    else if (req.url == '/req') {
        let body = '';

        req.on('data', function (chunk) {
            body += chunk;
        });

        req.on('end', function () {
            body = JSON.parse(body);
            sendRequest(body.prompt)
                .then(data => {
                    res.end(data.choices[0].text);
                })
                .catch(error => {
                    console.error(error);
                    res.statusCode = 500;
                    res.end('Ошибка сервера');
                });
        });
    }
}).listen(3000);