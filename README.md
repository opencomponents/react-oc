TLDR; react-oc docs can be found [here](packages/react-oc/README.md)

# Getting started
This repository uses `yarn`. You can install dependencies by simply typing:
```bash
yarn
```

To run tests:
```bash
yarn test
```

To start the demo application:
```bash
yarn workspace demo start
```

To publish changes:
```bash
yarn lerna publish
```

# Packages
## react-oc
[Documentation](packages/react-oc/README.md)

## demo
This project is private and should not be published. It hosts an oc-registry instance and a simple express + react application using `react-oc`. This project shows how a react app supporting server-side rendering can use `react-oc`. In the future, it may hold more examples, and also end to end tests.