# TODO
These items are not prioritised or sorted in any particular order.

- ~~Support client side only rendering of pre-fetched components.\
Use [oc.$.parseHTML](https://api.jquery.com/jquery.parsehtml/) to `keepScripts`.~~

- Add warnings about missing context properties.

- What happens/should happen if you modify the OpenComponentsContext during runtime? -- eg: add more prefetchedComponents

- Implement end to end tests.

- Refactor common logic into functions.

- publish v1 stable once used in a real production application.

- Decide and test/build behaviour for when props change at runtime.
