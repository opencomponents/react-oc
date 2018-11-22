# react-oc
This package allows you to use open components in a react application. It supports both server and client side rendering.
More details to follow soon.

## Installation

```bash
npm install react-oc
```

## Pre-requisites
Your application must use [oc-client-browser](https://github.com/opencomponents/oc-client-browser) to enable client side rendering,
and should use [oc-client-node](https://github.com/opencomponents/oc-client-node) to enable server side rendering.

The easiest setup would involve installing the `oc-client` npm package (`npm install oc-client`) and using it to server-side render the `oc-client` oc-component.

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
    ```jsx
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
    ```jsx
    export const MySubComponent1 = (props) => (
        <React.Fragment>
            <h1>Welcome to my application.</h1>
            <OpenComponent name='my-component' parameters={{name: 'Darth Vader'}} />
        </React.Fragment>
    )
    ```
    When called on the server-side, the react-component will render an empty div. Then when hydrated/rendered on the client side, the react-component will expect `clientOc` to be defined in the parent `<OpenComponentsContext />` react-component.

3. Use `<OpenComponent.Prefetched />` to render markup fetched on the server side.
    ```jsx
    export const MySubComponent2 = (props) => (
        <React.Fragment>
            <h1>Welcome to my application.</h1>
            <OpenComponent.Prefetched prefetchKey='footer' />
        </React.Fragment>
    )
    ```
    When called on the server-side, the react-component will expect `prefetchedComponents` to be defined in the parent `<OpenComponentsContext />` react-component which will be an object. The prefetchKey refers to the key in that object that holds the markup. On the client side, this react-component will preserve the markup when hydrating. Rendering prefetched oc-components exclusively on the client-side is not yet supported.

# `<OpenComponent />`
| prop | mandatory | description |
|---|---|---|
| name | yes | see [oc.build options](https://github.com/opencomponents/oc/wiki/Browser-client#ocbuild-options). |
| parameters | no | see [oc.build options](https://github.com/opencomponents/oc/wiki/Browser-client#ocbuild-options). |
| lang | no | see [oc.build options](https://github.com/opencomponents/oc/wiki/Browser-client#ocbuild-options). |
| version | no | see [oc.build options](https://github.com/opencomponents/oc/wiki/Browser-client#ocbuild-options). |
| id | no | this id is applied to the container `<div />` element. |
| className | no | this className is applied to the container `<div />` element. |
| captureAs | no | see [Capture Functionality](#capture-as). |

This react-component will use `oc.build` to render an `<oc-component />` tag within a div element. After being rendered, `oc.renderNestedComponent` is used to fetch and render the oc-component from the registry specified in `<OpenComponentsContext />`.

To mitigate the styling issues of wrapping an oc-component in a div element, there are two passthrough props that will be applied to the container div element: `id` and `className`.

This react-component expects the following props to be defined in the parent `<OpenComponentsContext />` react-component:

| prop | description |
|---|---|
| baseUrl | see [oc.build options](https://github.com/opencomponents/oc/wiki/Browser-client#ocbuild-options). |
| clientOc | the global oc library usually found at `window.oc`. |
| lang | this property is optional, but will be used as the default if no lang was specified on the `<OpenComponent />` node.  see [oc.build options](https://github.com/opencomponents/oc/wiki/Browser-client#ocbuild-options). |

**NOTE:** When server-side rendering, you may safely provide undefined for these properties.

# `<OpenComponent.Prefetched />`
**IMPORTANT:** This component was designed to support both universal and client-only react applications. It is expected that there will be no `prefetchedComponents` if hydrating on the client-side. If you provide prefetchedComponents on the client-side, any script tags provided will execute twice.

| prop | mandatory | description |
|---|---|---|
| prefetchKey | yes | the key that represents the prefetched html markup. |
| fallback | no | by default, in the case of failure to find the relevant html markup, the react-component will render an empty div. You may provide a string that will be interpreted as html and injected into the div instead. |
| captureAs | no | see [Capture Functionality](#capture-as). |

This react-component is designed to enable server-side rendering. Given a prefetchedComponents prop was provided to the parent `<OpenComponentsContext />` react-component, this react-component will render the markup. In the case where `oc-client` provides a failover `<oc-component />` tag (see: [disableFailoverRendering](https://github.com/opencomponents/oc-client-node#clientrendercomponentcomponentname--options-callback)), this react-component will call `oc.renderNestedComponent` on the client side to ensure that the oc-component loads correctly.

This react-component expects the following props to be defined in the parent `<OpenComponentsContext />` react-component:

| prop | description |
|---|---|
| prefetchedComponents | a hash table object `{key: value, ...}` where key will be matched with `prefetchKey`, and the value is a string containing the markup that was fetched using `oc-client`. |

**NOTE:** When hydrating over server-side rendered markup, you should provide undefined for prefetchedComponents. The react-component will not modify the markup provided by the server when hydrating.

# Capture As
By setting a `captureAs` prop on the `<OpenComponent />` and `<OpenComponent.Prefetched />` components, you enable the ability to remove and restore the oc application from the DOM without losing state or registered event handlers. This can be useful when creating an single page application where components that contain oc components may be removed and re-added as the user interacts with the application.

The value provided to `captureAs` is important; the value will be used as an identifier so that we can restore the appropriate captured oc-component. This also allows us to restore the oc-component to different places, effectively moving the oc-component around without losing state. Depending on how the self contained oc-component is, this may cause to unexpected side effects.

**Warning:** the oc-component is not cloned. This means that if multiple components with the same `captureAs` value exist on the same page at the same time, only one of the `<OpenComponent />` components will contain the oc-component, while the others will be empty. There could also be other unwanted side effects. Don't do this.
