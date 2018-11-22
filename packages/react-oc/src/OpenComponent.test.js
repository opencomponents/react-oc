import 'jest-plugin-console-matchers/setup';
import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import Promise from 'bluebird';
import jQuery from 'jquery';

import { renderAsync, hydrateAsync } from './__test__/react-helpers'
import { OpenComponentsContext } from "./OpenComponentsContext";
import { OCContext } from "./OCContext";
import { OpenComponent } from "./OpenComponent";

describe('<OpenComponent />', () => {
    
    describe('When not mounted within a <ComponentContext />', () => {
        it('throws an error', () => {
            const node = document.createElement('div');
            return expect(renderAsync(<OpenComponent name='my-component' />, node)).rejects
                .toThrow(/OpenComponent must be nested within a <ComponentContext \/>/);
        });
    });

    const oc = {};
    const fakeResponse = '<oc-component src="http://localhost/my-component"></oc-component>';
    const baseContext = { 
        oc,

        baseUrl: 'http://localhost/', 
        getElements: () => {}, 
        getHtml: () => {}, 
        saveElements: () => {},
    };

    beforeEach(() => {
        oc.build = jest.fn().mockImplementation(() => fakeResponse);
        oc.$ = jQuery;
        oc.renderNestedComponent = jest.fn((_, cb) => cb());
    });

    it('throws when no name is provided', () => {
        const node = document.createElement('div');
        return expect(renderAsync(
            <OCContext.Provider value={{...baseContext}}>
                <OpenComponent />
            </OCContext.Provider>, node)).rejects
            .toThrow(/Mandatory prop 'name' is missing./);
    });

    it('throws when no baseUrl is provided in context', () => {
        const node = document.createElement('div');
        const {baseUrl, ...rest} = baseContext;
        return expect(renderAsync(
            <OCContext.Provider value={{...rest}}>
                <OpenComponent name='my-component' />
            </OCContext.Provider>, node)).rejects
            .toThrow(/<OpenComponentsContext> must have a defined 'baseUrl' prop to use this component/);
    });

    it('should apply the given id to a container div', async () => {
        const node = document.createElement('div');
        await renderAsync(
            <OCContext.Provider value={{...baseContext}}>
                <OpenComponent id='my-unique-id' name='my-component' />
            </OCContext.Provider>, node);

        expect(node.childNodes[0].id).toBe('my-unique-id');
    });

    it('should apply the given className to a container div', async () => {
        const node = document.createElement('div');
        await renderAsync(
            <OCContext.Provider value={{...baseContext}}>
                <OpenComponent className='my-class' name='my-component' />
            </OCContext.Provider>, node);

        expect(node.childNodes[0].className).toBe('my-class');
    });

    it('should call oc.build with relevant parameters', async () => {
        const node = document.createElement('div');
        const parameters = {
            hello: 'world'
        };
        await renderAsync(
            <OCContext.Provider value={{...baseContext, oc, lang: 'en-GB'}}>
                <OpenComponent name='my-component' version='1.X.X' 
                    parameters={parameters}/>
            </OCContext.Provider>,
            node);

        expect(oc.build).toBeCalledWith({
            name: 'my-component',
            version: '1.X.X',
            baseUrl: 'http://localhost/',
            lang: 'en-GB',
            parameters,
        });
    });

    it('should call oc.build with lang from component over context', async () => {
        const node = document.createElement('div');
        await renderAsync(
            <OCContext.Provider value={{...baseContext, oc, lang: 'en-GB'}}>
                <OpenComponent name='my-component' lang='en-US'/>
            </OCContext.Provider>,
            node);

        expect(oc.build).toBeCalledWith(expect.objectContaining({
            lang: 'en-US',
        }));
    });

    it('should render the response of oc.build', async () => {
        const node = document.createElement('div');
        const parameters = {
            hello: 'world'
        };
        await renderAsync(
            <OCContext.Provider value={{...baseContext, oc}}>
                <OpenComponent name='my-component' version='1.X.X' 
                    lang='en-GB' parameters={parameters}/>
            </OCContext.Provider>,
            node);

        expect(node.innerHTML).toContain(fakeResponse);
    });

    it('should call oc.renderNestedComponent with a jquery element containing the response of oc.build', async () => {
        const node = document.createElement('div');
        const parameters = {
            hello: 'world'
        };
        await renderAsync(
            <OCContext.Provider value={{...baseContext, oc}}>
                <OpenComponent name='my-component' version='1.X.X' 
                    lang='en-GB' parameters={parameters} />
            </OCContext.Provider>, node);
        
        expect(oc.renderNestedComponent).toBeCalledWith(expect.objectContaining({
            0: expect.objectContaining({
                outerHTML: expect.stringContaining(fakeResponse)
            })}),
            expect.anything() //callback function
        );
    });

    describe('when a given a captureAs prop', () => {
        it('calls saveElements on context with the captureAs value and oc-component element after oc finishes rendering', async () => {
            const node = document.createElement('div');
            const saveElements = jest.fn()
            const getElements = jest.fn();
            const fakeResponse = '<oc-component src="http://localhost/my-component"></oc-component>';
            oc.build.mockImplementation(() => fakeResponse);
            
            await renderAsync(
                <OCContext.Provider value={{...baseContext, saveElements, getElements, oc}}>
                    <OpenComponent name='my-component' captureAs='my-component-1' />
                </OCContext.Provider>, node);
    
            expect(saveElements).toBeCalledWith('my-component-1', [expect.objectContaining({
                outerHTML: fakeResponse
            })]);
        });

        it('does not allow dangerouslySetInnerHtml remove existing markup', async () => {
            /**
             * This test protects a bug fix from regression.
             * 
             * Context: React may call the render function at any time, and in some cases, without
             * using the lifecycle methods (shouldComponentUpdate and componentDidUpdate).
             * This combined with the dangerouslySetInnerHtml property, if react detects that the
             * render method returned anything different, it may choose to update the browser DOM.
             * 
             * This test triggers the behaviour described and ensures that even though oc will modify 
             * the originally specified markup, the render method does not cause React to undo this.
             */
            const node = document.createElement('div');
            let elements;
            const saveElements = jest.fn((key, els) => elements = els);
            const getElements = jest.fn(() => elements);
            const fakeResponse = '<oc-component src="http://localhost/my-component"></oc-component>';
            const modifiedFakeResponse = '<oc-component src="http://localhost/my-component">hello world</oc-component>'
            oc.build.mockImplementation(() => fakeResponse);
            oc.renderNestedComponent.mockImplementation((component, cb) => {
                component[0].innerHTML = 'hello world';
                cb();
            });
            
            class RenderTwice extends React.Component {
                render() {
                    this.state = {};
                    setTimeout(() => {
                        this.setState({renderAgain: true});
                    }, 3);
                    return (
                        <OCContext.Provider value={{...baseContext, saveElements, getElements, oc}}>
                            {this.state.renderAgain}
                            <OpenComponent name='my-component' captureAs='my-component-1' />
                        </OCContext.Provider>
                    );
                }
            }

            await renderAsync(<RenderTwice />, node);
            await Promise.delay(5);

            expect(node.innerHTML).toContain(modifiedFakeResponse);
        })

        describe('when calling context.getElements with the captureAs prop returns a html element', () => {
            it('calls getElements with the captureAs key', async () => {
                const node = document.createElement('div');
                const element = document.createElement('span');
                const getElements = jest.fn().mockImplementation((key) => [element]);
                await renderAsync(
                    <OCContext.Provider value={{...baseContext, getElements, oc}}>
                        <OpenComponent name='my-component' captureAs='my-component-1' />
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
                    <OCContext.Provider value={{...baseContext, getElements, oc}}>
                        <OpenComponent name='my-component' captureAs='my-component-1' />
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

    it('should throw an error when context does not have an oc property', () => {
        const node = document.createElement('div');
        const {oc, ...rest} = baseContext;
        return expect(renderAsync(
            <OCContext.Provider value={{...rest}}>
                <OpenComponent name='header' />
            </OCContext.Provider>, node)).rejects
            .toThrow(/clientOc not defined/);
    });

    describe('universal support', () => {
        it('should not throw when no baseUrl is provided in context when server side rendering', () => {
            const node = document.createElement('div');
            const {baseUrl, ...rest} = baseContext;
            return expect(() => ReactDOMServer.renderToString(
                <OCContext.Provider value={{...rest}}>
                    <OpenComponent name='my-component' />
                </OCContext.Provider>))
                .not.toThrow();
        });

        it('should not throw an error when context does not have an oc property but using server side rendering', () => {
            const {oc, ...rest} = baseContext;
            const app = (
                <OCContext.Provider value={{...rest}}>
                    <OpenComponent name='header' />
                </OCContext.Provider>
            );
    
            expect(() => ReactDOMServer.renderToString(app)).not.toThrow();
        });
    
        it('should render an empty div when server side rendering without oc', () => {
            const node = document.createElement('div');
            node.innerHTML = ReactDOMServer.renderToString(
                <OCContext.Provider value={{...baseContext, oc: undefined }}>
                    <OpenComponent name='my-component' />
                </OCContext.Provider>);
    
            expect(node.innerHTML).toBe('<div></div>');
        });
    
        it('should change the empty div markup after hydrating over server rendered markup', async () => {
            const node = document.createElement('div');
            node.innerHTML = ReactDOMServer.renderToString(
                <OCContext.Provider value={{...baseContext, oc: undefined }}>
                    <OpenComponent name='my-component' />
                </OCContext.Provider>);
    
            const existingMarkup = node.innerHTML;
    
            await hydrateAsync(
                <OCContext.Provider value={{...baseContext}}>
                    <OpenComponent name='my-component' />
                </OCContext.Provider>, node);
    
            expect(node.innerHTML).not.toBe(existingMarkup);
        });
    
        it('should call oc.build with the correct parameters after hydrating', async () => {
            const node = document.createElement('div');
            node.innerHTML = ReactDOMServer.renderToString(
                <OCContext.Provider value={{...baseContext, oc: undefined, lang: 'en-GB' }}>
                    <OpenComponent name='my-component' />
                </OCContext.Provider>);
    
            await hydrateAsync(
                <OCContext.Provider value={{...baseContext, oc, lang: 'en-GB'}}>
                    <OpenComponent name='my-component' />
                </OCContext.Provider>, node);
            
            expect(oc.build).toHaveBeenLastCalledWith({
                baseUrl: baseContext.baseUrl,
                lang: 'en-GB',
                name: 'my-component',
            });
        });

        it('should call oc.renderNestedComponent with a jquery element containing the response of oc.build after hydrating', async () => {
            const node = document.createElement('div');
            node.innerHTML = ReactDOMServer.renderToString(
                <OCContext.Provider value={{...baseContext, oc: undefined }}>
                    <OpenComponent name='my-component' />
                </OCContext.Provider>);
    
            await hydrateAsync(
                <OCContext.Provider value={{...baseContext}}>
                    <OpenComponent name='my-component' />
                </OCContext.Provider>, node);
            
            expect(oc.renderNestedComponent).toBeCalledWith(expect.objectContaining({
                0: expect.objectContaining({
                    outerHTML: expect.stringContaining(fakeResponse)
                })}),
                expect.anything() //callback function
            );
        });
    });
});