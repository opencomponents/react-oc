
const originals = {
    log: console.log,
    warn: console.warn,
    error: console.error
};
console.log = jest.fn(console.log);
console.warn = jest.fn(console.warn);
console.error = jest.fn(console.error);


global.suppress = {
    console: (method, regex, {always = false} = {}) => {
        if (!originals[method]) {
            throw new Error(`unable to suppress unmocked method console.${method}`);
        }


        console[method].mockImplementation((...args) => {
            if (regex.test(args[0])) {
                // bypass console.error call.
                // restore mock of original fn for any further calls.
                if (!always) {
                    console[method].mockImplementation(originals.error);
                }
            } else {
                originals[method](...args);
            }
        })
    }
}

console.error.suppressOnceMatching = (regex) => {
    console.error.mockImplementation((...args) => {
        if (regex.test(args[0])) {
            // bypass console.error call.
            // restore mock of original fn for any further calls.
            console.error.mockImplementation(originals.error);
        } else {
            originals.error(...args);
        }
    })
}
