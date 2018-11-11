import React from 'react';
import ReactDOM from 'react-dom';
import Promise from 'bluebird';

import { renderAsync } from './__test__/helpers'
import { OpenComponentsContext } from "./OpenComponentsContext";
import { OCContext } from './OCContext';

describe('<OpenComponentsContext></OpenComponentsContext>', () => {
    describe('when not present', () => {
        it('OCContext gives false as context', async () => {
            const node = document.createElement('div');
            let context;
            await renderAsync(<OCContext.Consumer>{
                (ctx)=>{context = ctx; return ''}
            }</OCContext.Consumer>, node);

            expect(context).toBe(false);
        })
    });

    it('renders its children', async () => {
        const node = document.createElement('div');
        await renderAsync(
            <OpenComponentsContext
                baseUrl='http://localhost/'>
                {'hello world'}
            </OpenComponentsContext>, node)

        expect(node.innerHTML).toBe('hello world');
    });

    it('adds oc, baseUrl and lang to OCContext', async () => {
        const node = document.createElement('div');
        const oc = {};
        let context;
        await renderAsync(
            <OpenComponentsContext
                clientOc={oc}
                baseUrl='http://localhost/'
                lang='en-GB'>
                <OCContext.Consumer>
                    {(ctx) => {
                        context = ctx;
                    }}
                </OCContext.Consumer>
            </OpenComponentsContext>, node);

        expect(context).toMatchObject({
            baseUrl: 'http://localhost/',
            lang: 'en-GB',
            oc,
        });
    });

    it('adds a getHtml method to OCContext', async () => {
        const node = document.createElement('div');
        let context;
        await renderAsync(
            <OpenComponentsContext
                baseUrl='http://localhost/'>
                <OCContext.Consumer>
                    {(ctx) => {
                        context = ctx;
                    }}
                </OCContext.Consumer>
            </OpenComponentsContext>, node);

        expect(typeof context.getHtml).toBe('function');
    });

    it('adds a saveElement method to OCContext', async () => {
        const node = document.createElement('div');
        let context;
        await renderAsync(
            <OpenComponentsContext
                baseUrl='http://localhost/'>
                <OCContext.Consumer>
                    {(ctx) => {
                        context = ctx;
                    }}
                </OCContext.Consumer>
            </OpenComponentsContext>, node);

        expect(typeof context.saveElements).toBe('function');
    });

    it('adds a getElement method to OCContext', async () => {
        const node = document.createElement('div');
        let context;
        await renderAsync(
            <OpenComponentsContext
                baseUrl='http://localhost/'>
                <OCContext.Consumer>
                    {(ctx) => {
                        context = ctx;
                    }}
                </OCContext.Consumer>
            </OpenComponentsContext>, node);

        expect(typeof context.getElements).toBe('function');
    });

    it('getHtml returns undefined when prefetchedComponents was not provided', async () => {
        const node = document.createElement('div');
        let context;
        await renderAsync(
            <OpenComponentsContext baseUrl='http://localhost/'>
                <OCContext.Consumer>
                    {(ctx) => { context = ctx; }}
                </OCContext.Consumer>
            </OpenComponentsContext>, node);

        expect(context.getHtml('key1')).toBeUndefined();
    });

    describe('when prefetchedComponents has been supplied', () => {
        const prefetchedComponents = {
            'key1': `<h1>Key1</h1>`,
            'key2': `<h1>Key2</h1>`,
            'key3': `<h1>Key3</h1>`,
        };
        
        it('getHtml returns the relevant markup based on key', async () => {
            const node = document.createElement('div');
            let context;
            await renderAsync(
                <OpenComponentsContext baseUrl='http://localhost/' 
                    prefetchedComponents={prefetchedComponents}>
                    <OCContext.Consumer>
                        {(ctx) => { context = ctx; }}
                    </OCContext.Consumer>
                </OpenComponentsContext>, node);

            expect(context.getHtml('key2')).toBe(`<h1>Key2</h1>`)
        });

        it('getHtml returns undefined when the provided key is unknown', async () => {
            const node = document.createElement('div');
            let context;
            await renderAsync(
                <OpenComponentsContext baseUrl='http://localhost/'
                    prefetchedComponents={prefetchedComponents}>
                    <OCContext.Consumer>
                        {(ctx) => { context = ctx; }}
                    </OCContext.Consumer>
                </OpenComponentsContext>, node);

            expect(context.getHtml('keyUnknown')).toBeUndefined();
        });
    });

    describe('when saveElement is called in componentDidMount', () => {
        let elements;
        let elementsInContext;
        class Dummy extends React.Component {
            constructor(props) {
                super(props)
                this.count = 0;
            }
            render() {
                return <OCContext.Consumer>
                    {(ctx) => {
                        this.ctx = ctx;
                        elementsInContext = ctx.getElements('myKey');
                        return `rendered ${++this.count} times`;
                    }}
                </OCContext.Consumer>
            }

            componentDidMount() {
                this.ctx.saveElements('myKey', elements);
            }
        }

        beforeEach(() => {
            elements = [{}]
        });

        it('causes a re-render after saveElement was called', async () => {
            const node = document.createElement('div');
            
            await renderAsync(
                <OpenComponentsContext baseUrl='http://localhost/'>
                    <Dummy />
                </OpenComponentsContext>, node);

            await Promise.delay(5) // give React time to re-render
    
            expect(node.textContent).toContain('rendered 2 times');
        });

        it('gets the saved element when calling getElement', async () => {
            const node = document.createElement('div');
            
            await renderAsync(
                <OpenComponentsContext baseUrl='http://localhost/'>
                    <Dummy />
                </OpenComponentsContext>, node);

            await Promise.delay(5) // give React time to re-render
    
            expect(elementsInContext).toBe(elements);
        });
    })
});
