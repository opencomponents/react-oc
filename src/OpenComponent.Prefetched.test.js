import 'jest-plugin-console-matchers/setup';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import hasher from 'object-hash';

import { renderAsync } from './__test__/helpers'
import { OpenComponentsContext } from "./OpenComponentsContext";
import { OCContext } from "./OCContext";
import { OpenComponent } from "./OpenComponent";

describe('<OpenComponent />', () => {
    
    describe('When not mounted within a <ComponentContext />', () => {
        it('throws an error', () => {
            const node = document.createElement('div');
            return expect(renderAsync(<OpenComponent.Prefetched prefetchKey='my-component' />, node)).rejects
                .toThrow(/must be nested within a <ComponentContext \/>/);
        });
    });

    let baseContext;
    beforeEach(() => {
        baseContext = { 
            getElement: jest.fn(() => {}), 
            getHtml: jest.fn(() => {}),
            saveElement: jest.fn(() => {}),
        };
    });

    it('throws an error if prefetchKey prop was not defined', () => {
        const node = document.createElement('div');
        return expect(renderAsync(
            <OCContext.Provider value={{...baseContext}}>
                <OpenComponent.Prefetched />
            </OCContext.Provider>, node)
        ).rejects.toThrow(/Mandatory prop 'prefetchKey' was not provided/);
    });

    it('should apply the given id to a container div', async () => {
        const node = document.createElement('div');
        await renderAsync(
            <OCContext.Provider value={{...baseContext}}>
                <OpenComponent.Prefetched id='my-unique-id' prefetchKey='my-component' />
            </OCContext.Provider>, node);

        expect(node.childNodes[0].id).toBe('my-unique-id');
    });

    it('should apply the given className to a container div', async () => {
        const node = document.createElement('div');
        await renderAsync(
            <OCContext.Provider value={{...baseContext}}>
                <OpenComponent.Prefetched className='my-class' prefetchKey='my-component' />
            </OCContext.Provider>, node);

        expect(node.childNodes[0].className).toBe('my-class');
    });

    it('should render markup from context.getHtml with prefetchKey in container div', async () => {
        const node = document.createElement('div');
        const fakeHtml = `<h1>Hello world</h1>`;
        baseContext.getHtml.mockImplementation((key) => key === 'my-component' ? fakeHtml : undefined )
        await renderAsync(
            <OCContext.Provider value={{...baseContext}}>
                <OpenComponent.Prefetched prefetchKey='my-component' />
            </OCContext.Provider>, node);

        expect(node.innerHTML).toContain(fakeHtml);
    });

    // JSDOM does not support document.createRange()
    it.skip('should run scripts from markup in container div', async () => {
        const node = document.createElement('div');
        const fakeHtml = `<h1>Hello world</h1><script>window.hello = world</script>`;
        baseContext.getHtml.mockImplementation((key) => key === 'my-component' ? fakeHtml : undefined )
        await renderAsync(
            <OCContext.Provider value={{...baseContext}}>
                <OpenComponent.Prefetched prefetchKey='my-component' />
            </OCContext.Provider>, node);

        expect(window.hello).toBe('world');
    });

    describe('when server side rendering', () => {
        it('should render markup from context.getHtml with prefetchKey in container div', () => {
            const fakeHtml = `<h1>Hello world</h1>`;
            baseContext.getHtml.mockImplementation((key) => key === 'my-component' ? fakeHtml : undefined )
            const render = ReactDOMServer.renderToString(
                <OCContext.Provider value={{...baseContext}}>
                    <OpenComponent.Prefetched prefetchKey='my-component' />
                </OCContext.Provider>);
    
            expect(render).toContain(fakeHtml);
        });
    });
    
    it('should not change markup when hydrating over server rendered markup', async () => {
        const node = document.createElement('div');
        node.innerHTML = ReactDOMServer.renderToString(<OCContext.Provider value={{
            ...baseContext, getHtml: () => '<h1>Hello</h1><p>World</p>' }}>
            <OpenComponent.Prefetched prefetchKey='my-component' />
        </OCContext.Provider>);
        const existingMarkup = node.innerHTML;

        await new Promise((resolve) => ReactDOM.hydrate(
            <OCContext.Provider value={{...baseContext, getHtml: () => '' }}>
                <OpenComponent.Prefetched prefetchKey='my-component' />
            </OCContext.Provider>, node, resolve));

        expect(node.innerHTML).toBe(existingMarkup);
    });

    describe('when a given a captureAs prop', () => {
        it('calls saveElements on context with the captureAs value and elements from getHtml', async () => {
            const node = document.createElement('div');
            const html = '<div>hello</div><h1>world</h1>';
            const saveElements = jest.fn();
            const getElements = jest.fn();
            
            await renderAsync(
                <OCContext.Provider value={{...baseContext, saveElements, getElements, getHtml: () => html}}>
                    <OpenComponent.Prefetched prefetchKey='my-component' captureAs='my-component-1' />
                </OCContext.Provider>, node);
    
            expect(saveElements).toBeCalledWith('my-component-1', [
                expect.objectContaining({
                    innerHTML: 'hello',
                    tagName: 'DIV'
                }),
                expect.objectContaining({
                    innerHTML: 'world',
                    tagName: 'H1'
                }),
            ]);
        });

        describe('when context.getElements returns a html element', () => {
            it('calls getElements with the captureAs key', async () => {
                const node = document.createElement('div');
                const element = document.createElement('span');
                const getElements = jest.fn().mockImplementation((key) => element);
                await renderAsync(
                    <OCContext.Provider value={{...baseContext, getElements}}>
                        <OpenComponent.Prefetched prefetchKey='my-component' captureAs='my-component-1' />
                    </OCContext.Provider>, node);
                
                expect(getElements).toBeCalledWith('my-component-1');
            });

            it('injects the elements into the container', async () => {
                const node = document.createElement('div');
                
                const prevNode = document.createElement('span');
                prevNode.innerHTML = '<span>span</span>hello<div>div</div>';
                const elements = [...prevNode.childNodes];

                const getElements = jest.fn().mockImplementation((key) => elements)
                await renderAsync(
                    <OCContext.Provider value={{...baseContext, getElements}}>
                        <OpenComponent.Prefetched prefetchKey='my-component' captureAs='my-component-1' />
                    </OCContext.Provider>, node);

                const div = node.childNodes[0];
                expect(div.childNodes.length).toBe(elements.length);
                for(var i = 0; i < elements.length; i++) {
                    // using toBe ensures that it is the same element with 
                    // all event handlers etc. in-tact.
                    expect(div.childNodes[i]).toBe(elements[i]);
                }
            });
        });
    });
});