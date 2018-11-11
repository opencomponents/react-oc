import React from 'react';
import ReactDOM from 'react-dom';

/**
 * based on: https://github.com/facebook/react/issues/11098#issuecomment-412682721
 * wraps the render method to suppress the error message from reaching the console
 * during the rendering process.
 * 
 * waiting for componentDidMount allows us to ensure we capture errors within
 * componentDidMount handlers.
 */

function reactRenderAsync(reactRenderFn, component, node) {
    const ctx = {};
    let unpause;
    const wait = new Promise((resolve) => { unpause = resolve; });
    class Wrapper extends React.Component {
        constructor(props) {
            super(props);
            this.state = {};
        }
        componentDidCatch(err) {
            this.setState({errored: true})
            ctx.err = err;
        }
        render() {
            return this.state.errored ? null : this.props.children;
        }

        componentDidMount() {
            unpause();
        }
    }

    const preventErrorLogs = (event) => {
        event.preventDefault();
        window.removeEventListener('error', this);
    };
    window.addEventListener('error', preventErrorLogs.bind(preventErrorLogs));
    return new Promise((resolve, reject) => {
        reactRenderFn(<Wrapper>{component}</Wrapper>, node, () => {
            wait.then(() => {
                if (ctx.err){
                    reject(ctx.err);
                } else {
                    resolve();
                }
            })
        });
    });  
}

export const renderAsync = (component, node) => {
    return reactRenderAsync(ReactDOM.render, component, node);
}

export const hydrateAsync = (component, node) => {
    return reactRenderAsync(ReactDOM.hydrate, component, node);
}