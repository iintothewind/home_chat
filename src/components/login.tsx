import React, { useState } from 'react'
import { Layout, Tooltip, Alert } from 'antd'
import { GithubOutlined, LoginOutlined, LoadingOutlined } from '@ant-design/icons'
import { useLocation, Redirect } from 'react-router-dom'
import ReactGA from 'react-ga'
import { cfg } from '../util/config'
import axios from 'axios'
import '../styles/login.css'

if ('https' === window.location.protocol) {
  ReactGA.initialize(cfg.gaTrackingId)
  ReactGA.pageview(`${window.location.pathname}${window.location.search}`)
}

const { Footer, Content } = Layout

const useQuery = () => {
  return new URLSearchParams(useLocation().search)
}

interface User {
  login?: string
  name?: string
  avatarUrl?: string
}

interface Error {
  error?: string
  error_description?: string
}

interface LoginState {
  user?: User
  error?: Error
}

const renderState = (state: LoginState | null) => {
  if (state) {
    if (state.user) {
      return <Redirect exact to={{
        pathname: '/messageList',
        search: `?topic=${cfg.mqttDefaultTopic}&user=${state.user.login}`
      }} />
    } else if (state.error) {
      const error: Error = state.error
      return <Redirect exact to={{
        pathname: '/login',
        state: { error: error }
      }} />
    }
  }
  return <LoadingOutlined />
}

const Login = () => {
  const query = useQuery()
  const code = query.get('code')
  const [state, setState] = useState<LoginState | null>(null)

  if (code && !state) {
    const params = new URLSearchParams({ code: code })
    const headers = { 'Accept': 'application/json' }
    axios
      .get<User>('https://mqttchat.herokuapp.com/home_chat/user', { params: params, headers: headers })
      .then(response => {
        setState({ user: response.data })
      })
      .catch(error => {
        setState({ error: error as Error })
      })
  }

  return (
    <Layout className='login-layout'>
      <Content className='login-content'>
        <GithubOutlined className='login-github' />
      </Content>
      <Footer className='login-footer'>
        {code ?
          renderState(state)
          :
          <a href='https://github.com/login/oauth/authorize?client_id=d091146121f6eb144f83&scope=user:email'>
            <Tooltip title='click to login with github' placement='bottom'>
              <LoginOutlined className='login-guest' />
            </Tooltip>
          </a>
        }
        {state?.error ? <Alert type='error' showIcon message={state?.error.error} /> : <></>}
      </Footer>
    </Layout >
  )
}

export { Login }