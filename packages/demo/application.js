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
    
    const ocClientMarkup = await new Promise((resolve, reject) => {
        client.renderComponent('oc-client', {}, function(err, html) {
            resolve(html);
        });
    });
     
    res.send(`<!DOCTYPE html>
<html>
    <head>
        <title>My Demo Application</title>
        ${ocClientMarkup}
    </head>
    <body>
        <div id="application">${reactApp}</div>
        <script src="/client/application.packed.js"></script>
    </body>
</html>
    `);
}