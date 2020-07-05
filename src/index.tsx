import React from 'react'
import ReactDOM from 'react-dom'
import { Result, Button } from 'antd'
import MessageList from './components/MessageList'
import { Login } from './components/login'
import { BrowserRouter, Route, Switch, useHistory, useLocation } from 'react-router-dom'
import { cfg } from './util/config'

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
    status="404"
    title="404"
    subTitle="Sorry, the page you visited does not exist."
    extra={<Button type="primary" onClick={() => history.replace(from)}>Back Home</Button>} />
}

ReactDOM.render((
  <BrowserRouter basename={cfg.baseName}>
    <Switch>
      <Route exact path="/" component={Login} />
      <Route exact path="/messageList" component={MessageList} />
      <Route path="*" component={NotFound} />
    </Switch>
  </BrowserRouter>
), document.getElementById('app'))