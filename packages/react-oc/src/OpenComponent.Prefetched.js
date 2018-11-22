import React from 'react';

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


                this.oc = context.oc;
                this.saveElements = context.saveElements;
                this.capturedElements = this.props.captureAs && context.getElements(this.props.captureAs);
                this.html = this.capturedElements ? '' : context.getHtml(prefetchKey);
                let suppressHydrationWarning = false;
                if (this.html === undefined) {
                    this.html = this.props.fallback || '';
                    suppressHydrationWarning = true;
                }

                const html = dangerousHtml(this.html);

                return <div ref={this.ref}
                    id={id} className={className} 
                    dangerouslySetInnerHTML={html}
                    suppressHydrationWarning={suppressHydrationWarning} />;
            }
        }</OCContext.Consumer>;
    }

    componentDidMount() {
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
        if (!div) {
            return;
        }

        const markupWasFromContext = this.html && div.innerHTML === this.html;
        if (markupWasFromContext) { // if not hydrating... TODO: DETECTION ALGORITHM
            const keepScripts = true;
            const elements = this.oc.$.parseHTML(this.html, keepScripts);
            this.oc.$(div).html(elements)
        }

        if (this.props.captureAs) {
            this.saveElements(this.props.captureAs, [...div.childNodes]);
        }

        const containsUnrenderedComponent = (
            div.childNodes.length === 1
            && div.childNodes[0].tagName
            && div.childNodes[0].tagName.toLowerCase() === 'oc-component' 
            && div.childNodes[0].getAttribute('data-rendered') !== 'true'
        );

        if (containsUnrenderedComponent) {
            const element = this.oc.$(div.childNodes[0]);
            this.oc.renderNestedComponent(element, () => {
                if (this.props.captureAs) {
                    this.saveElements(this.props.captureAs, [...div.childNodes]);
                }
            });
        }
    }
}