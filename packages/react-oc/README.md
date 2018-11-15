# react-oc
This package allows you to use open components in a react application. It supports both server and client side rendering.
More details to follow soon.

## Installation

```js
npm install react-oc
```

## Pre-requisites
Your application must use [oc-client-browser](https://github.com/opencomponents/oc-client-browser) to enable client side rendering,
and should use [oc-client-node](https://github.com/opencomponents/oc-client-node) to enable server side rendering.

The easiest setup would involve installing the `oc-client` npm package (`npm install oc-client`) and using it to server-side render the `oc-client` component.

```js
const Client = require('oc-client');
const client = new Client(...);

// This will provide the script tag that loads the oc-client-browser code.
const ocClientMarkup = await new Promise((resolve, reject) => {
    client.renderComponent('oc-client', {}, function(err, html) {
        resolve(html); 
    });
});
```

```js
// if using express:
const serverRenderedReactApp = ReactDOMServer.renderToString(...);
res.send(`<!DOCTYPE html>
<html>
    <head>
        <title>My Website</title>
        ${ocClientMarkup}
    </head>
    <body>
        <div id="application">${serverRenderedReactApp}</div>
        <script src="/application.js"></script>
    </body>
</html>`);
```

## Usage

1. Wrap your application with `<OpenComponentsContext />`.
    ```js
    export async function main() {
        // pseudo code: This would typically run only server side and provide a
        // hash table: { header: '<div>my header</div>', footer: '<div>my footer</div>' }
        const components = await getComponents([{name: 'footer'}, {name: 'header'}]);

        return (
            <OpenComponentsContext 
                baseUrl='https://oc-registry.mydomain.com/'
                lang='en-GB'
                prefetchedComponents={components}

                // this allows oc to be defined in the browser, and falsy on the server.
                clientOc={typeof window === 'object' && window.oc}>
            
                <MyApp />
            </OpenComponentsContext>
        );
    }
    ```

2. Use `<OpenComponent />` to render a client-side only oc-component.
    ```js
    export const MySubComponent1 = (props) => (
        <React.Fragment>
            <h1>Welcome to my application.</h1>
            <OpenComponent name='my-component' parameters={{name: 'Darth Vader'}} />
        </React.Fragment>
    )
    ```
    When called on the server-side, the component will render an empty div. Then when hydrated/rendered on the client side, the component will expect `clientOc` to be defined in the parent `<OpenComponentsContext />` component.

3. Use `<OpenComponent.Prefetched />` to render markup fetched on the server side.
    ```js
    export const MySubComponent2 = (props) => (
        <React.Fragment>
            <h1>Welcome to my application.</h1>
            <OpenComponent.Prefetched prefetchKey='footer' />
        </React.Fragment>
    )
    ```
    When called on the server-side, the component will expect `prefetchedComponents` to be defined in the parent `<OpenComponentsContext />` component which will be an object. The prefetchKey refers to the key in that object that holds the markup. On the client side, this component will preserve the markup when hydrating. Rendering prefetched components exclusively on the client-side is not yet supported.

# Features
    Coming soon...