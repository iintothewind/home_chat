import React from 'react'
import ReactDOM from 'react-dom'
import { Result, Button } from 'antd'
import MessageList from './components/MessageList'
import { Login } from './components/login'
import { BrowserRouter, Route, Switch, useHistory, useLocation } from 'react-router-dom'
import { cfg } from './util/config'
import { useEffect, useState } from 'react'

interface LocationState {
  from: {
    pathname: string
  }
}

const NotFound = () => {
  const history = useHistory()
  const location = useLocation<LocationState>()
  const { from } = location.state || { from: { pathname: '/' } }

  return <Result
    status='404'
    title='NotFound'
    subTitle='Sorry, the page you visited does not exist.'
    extra={<Button type='primary' onClick={() => history.replace(from)}>Back Home</Button>} />
}


function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}

ReactDOM.render((
  <BrowserRouter basename={cfg.baseName}>
    <Switch>
      <Route exact path='/' component={Login} />
      <Route exact path='/login' component={Login} />
      <Route exact path='/messageList' component={MessageList} />
      <Route exact path='/test' component={Example} />
      <Route path="*" component={NotFound} />
    </Switch>
  </BrowserRouter>
), document.getElementById('app'))