import React from 'react';
import ReactDOM from 'react-dom';

import { App } from './react';

const node = document.getElementById('application');
ReactDOM.hydrate(App(), node);