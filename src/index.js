import React from 'react';
import ReactDOM from 'react-dom';
import { MessageBoard } from './modules/MessageBoard'
import { BrowserRouter, Route } from 'react-router-dom'

const cfg = require('../package.json')

ReactDOM.render((
  <BrowserRouter basename={cfg.name}>
    <Route path="/messageBoard" component={MessageBoard}/>
  </BrowserRouter>
), document.getElementById('app'))