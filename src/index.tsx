import React from 'react';
import ReactDOM from 'react-dom';
import MessageList from './components/MessageList'
import { BrowserRouter, Route } from 'react-router-dom'
import { cfg } from './util/config'


ReactDOM.render((
  <BrowserRouter basename={cfg.appKey}>
    <Route path="/messageList" component={MessageList} />
  </BrowserRouter>
), document.getElementById('app'))