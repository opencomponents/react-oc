import React from 'react';

import { OCContext } from "./OCContext";
import { Prefetched } from "./OpenComponent.Prefetched";
import { dangerousHtml } from "./lib/dangerousHtml";

export class OpenComponent extends React.Component {

    constructor(props) {
        super(props);
        this.ref = React.createRef();
    }

    render() {
        const { id, className, name, parameters, version } = this.props;
        if (!name) {
            throw new Error(`Mandatory prop 'name' is missing.`);
        }
        return <OCContext.Consumer>{
            (context) => {
                if (!context) {
                    throw new Error('OpenComponent must be nested within a <ComponentContext />');
                }
                this.oc = context.oc;
                this.saveElements = context.saveElements;
                const baseUrl = this.baseUrl = context.baseUrl;
                const lang = this.lang = this.props.lang || context.lang;
                this.capturedElements = this.props.captureAs && context.getElements(this.props.captureAs);
                const innerHtml = this.oc ? this.oc.build({ 
                    baseUrl, name, version, lang, parameters
                }) : '';
                const html = dangerousHtml(innerHtml);

                return <div ref={this.ref}
                    id={id} className={className} 
                    dangerouslySetInnerHTML={html}
                    suppressHydrationWarning={true} />;
            }
        }</OCContext.Consumer>;
    }

    componentDidMount() {
        if (!this.oc) {
            throw new Error(
                'clientOc not defined. You must provide the oc library to '
                +'<OpenComponentsContext> on the client-side');
        }

        if (!this.baseUrl) {
            throw new Error(`<OpenComponentsContext> must have a defined 'baseUrl' prop to use this component.`);
        }

        if (this.capturedElements) {
            this.ref.current.innerHTML = '';
            for(var i = 0; i < this.capturedElements.length; i++) {
                const el = this.capturedElements[i];
                this.ref.current.appendChild(el);
            }
            delete this.capturedElements;
            return;
        }

        if (this.ref.current.innerHTML === '') {
            const { name, version, parameters } = this.props;
            const { baseUrl, lang } = this;
            this.ref.current.innerHTML = this.oc.build({ 
                baseUrl, name, version, lang, parameters
            });
        }

        const div = this.ref.current;
        if (div.childNodes.length !== 1 ||
            div.childNodes[0].tagName.toLowerCase() !== 'oc-component') {
            return;
        }

        const component = div.childNodes[0];
        const element = this.oc.$(component);
        this.oc.renderNestedComponent(element, () => {
            if (this.props.captureAs) {
                this.saveElements(this.props.captureAs, [component]);
            }
        });
    }
}

OpenComponent.Prefetched = Prefetched;