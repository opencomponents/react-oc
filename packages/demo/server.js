require('@babel/register');
const path = require('path');
const oc = require('oc');
const Local = require('oc/src/cli/domain/local');
const application = require('./application');


const local = new Local();
local.package({
    componentPath: path.resolve(__dirname, 'components/example'),
    minify: false,
    verbose: false,
    production: false
}, err => {
    if (err) {
        console.log('Could not package components: ', err);
        process.exit(1);
    }
    
    const registry = oc.Registry({
        baseUrl: 'http://localhost:3000/oc/',
        prefix: '/oc/',
        port: 3000,
        local: true,
        path: path.resolve(__dirname, 'components'),
        routes: [
            { route: '/app', method: 'get', handler: application },
            { route: '/client/application.packed.js', method: 'get', handler: (req, res) => res.sendFile(path.resolve(__dirname, 'client/application.packed.js')) },
        ]
    });
    
    registry.start(function(err, app) {
        if (err) {
            console.log('Registry not started: ', err);
            process.exit(1);
        } else {
            console.log('Application started at http://localhost:3000/app');
        }
    });
});