import React from 'react';
import objectHash from 'object-hash';

import { OCContext } from "./OCContext";
import { dangerousHtml } from "./lib/dangerousHtml";

export class Prefetched extends React.Component {

    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }

    render() {
        const { id, className, prefetchKey, captureAs } = this.props;
        if (!prefetchKey) {
            throw new Error(`Mandatory prop 'prefetchKey' was not provided.`);
        }

        return <OCContext.Consumer>{
            (context) => {
                if (!context) {
                    throw new Error('OpenComponent.Prefetched must be nested within a <ComponentContext />');
                }


                // this.oc = context.oc;
                this.saveElements = context.saveElements;
                // const baseUrl = context.baseUrl;
                // const lang = this.props.lang || context.lang;
                // let html = dangerousHtml('');
                this.capturedElements = this.props.captureAs && context.getElements(this.props.captureAs);
                // if (!this.capturedElement) {
                //     if (this.oc) {
                //         const innerHtml = this.oc ? this.oc.build({ 
                //             baseUrl, name, version, lang, parameters
                //         }) : '';
                //         html = dangerousHtml(innerHtml);
                //     } else {
                        this.html = this.capturedElements ? '' : context.getHtml(prefetchKey);
                        const html = dangerousHtml(this.html);
                //     }
                // }

                return <div ref={this.ref}
                    id={id} className={className} 
                    dangerouslySetInnerHTML={html}
                    suppressHydrationWarning={true} />;
            }
        }</OCContext.Consumer>;
    }

    componentDidMount() {
        //this.ref.container.innerHTML = '';
        //$.parseHTML(this.html, document, true).forEach(e => this.ref.container.appendChild(e));

        // const range = document.createRange()
        // range.setStart(this.ref.container, 0)
        // this.ref.current.appendChild(
        //     range.createContextualFragment(this.html)
        // );

        if (this.capturedElements) {
            this.ref.current.innerHTML = '';
            for(var i = 0; i < this.capturedElements.length; i++) {
                const el = this.capturedElements[i];
                this.ref.current.appendChild(el);
            }
            delete this.capturedElements;
            return;
        }

        const div = this.ref.current;
        // if (div.childNodes.length !== 1 ||
        //     div.childNodes[0].tagName.toLowerCase() !== 'oc-component') {
        //         // if (this.props.captureAs && process.env.NODE_ENV !== 'production') {
        //         //     console.warn('captureAs prop provided but the component was ' +
        //         //     'rendered without its <oc-component> container tag. Element:', div);
        //         // }
        //     return;
        // }

        // if (this.props.captureAs) {
        //     if (component.getAttribute('data-rendered') === 'true') {
        //         this.saveElement(this.props.captureAs, component);       
        //         return;
        //     }
        // }

        // if (!this.oc) { 
        //     // if (process.env.NODE_ENV !== 'production') {
        //     //     console.warn('Unrendered oc-component found, unable to render because ' +
        //     //         'clientOc was not provided. Element:', component());
        //     // }
        //     return; 
        // }

        // const element = this.oc.$(component());
        // this.oc.renderNestedComponent(element, () => {
            if (this.props.captureAs) {
                this.saveElements(this.props.captureAs, [...div.childNodes]);
            }
        // });
    }
}