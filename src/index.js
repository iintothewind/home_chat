import React from 'react';
import ReactDOM from 'react-dom';
import { MessageBoard } from './modules/MessageBoard'
import { BrowserRouter, Route } from 'react-router-dom'

ReactDOM.render((
  <BrowserRouter>
    <Route path="/messageBoard" component={MessageBoard}/>
  </BrowserRouter>
), document.getElementById('app'))