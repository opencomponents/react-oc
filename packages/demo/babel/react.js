import React from 'react';
const { OpenComponent, OpenComponentsContext } = require('react-oc');


const oc = typeof window === 'object' && window.oc;

export const App = (prefetchedComponents) => (
    <OpenComponentsContext baseUrl='http://localhost:3000/oc/' clientOc={oc} prefetchedComponents={prefetchedComponents}>
        <h1>Hello World.</h1>
        <OpenComponent name='example' parameters={{name: 'Dipun'}} />
        <OpenComponent.Prefetched prefetchKey='example' />
    </OpenComponentsContext>
)