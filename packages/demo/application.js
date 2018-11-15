const React = require('react');
const ReactDOMServer = require('react-dom/server');
const Client = require('oc-client');

const { App } = require('./react');

module.exports = async function (req, res, next) {

    const client = new Client({
        registries: { serverRendering: 'http://localhost:3000/oc/'},
        components: {
          example: 'X.X.X'
        }
    });
    const prefetched = await new Promise((resolve, reject) => {
        client.renderComponent('example', { 
            parameters: {name: 'Joey'}, 
            timeout: 2, 
            headers: {
                'accept-language': 'en-GB'
            }
        }, function(err, html, details) {
            resolve({example: html});
        });
    })

    const reactApp = ReactDOMServer.renderToString(App(prefetched));
    
    const ocClientMarkup = `<script>window.oc=window.oc||{};oc.conf=oc.conf||{};oc.conf.templates=(oc.conf.templates||[]).concat([{"type":"oc-template-es6","version":"1.0.1","externals":[]},{"type":"oc-template-jade","version":"6.0.12","externals":[{"global":"jade","url":"https://unpkg.com/jade-legacy@1.11.1/runtime.js","name":"jade"}]},{"type":"oc-template-handlebars","version":"6.0.13","externals":[{"global":"Handlebars","url":"https://unpkg.com/handlebars@4.0.11/dist/handlebars.runtime.min.js","name":"handlebars"}]}]);</script><script src="http://localhost:3000/oc/oc-client/0.45.0/static/src/oc-client.min.js" type="text/javascript"></script>`
    
    res.send(`<!DOCTYPE html>
<html>
    <head>
        <title>My Demo Application</title>
        ${ocClientMarkup}
    </head>
    <body>
        <div id="application">${reactApp}</div>
        <script src="/application.client.js"></script>
    </body>
</html>
    `);
}