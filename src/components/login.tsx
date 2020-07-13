import React, { useState } from 'react'
import { Layout, Alert } from 'antd'
import { LoginOutlined, LoadingOutlined } from '@ant-design/icons'
import { useLocation, Redirect } from 'react-router-dom'
import ReactGA from 'react-ga'
import { cfg } from '../util/config'
import axios from 'axios'
import { RemoteIcon } from '../util/icon'
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
  message?: string
  stack?: string
  description?: string
}

interface LoginProps {
  location?: { state: LoginState }
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
      console.log(`error: ${JSON.stringify(state.error)}`)
      return <Redirect exact to={{
        pathname: '/login',
        state: { error: { message: 'login failed, please retry', description: JSON.stringify(state.error) } }
      }} />
    }
  }
  return <LoadingOutlined className='login-github' />
}

const Login = (props: LoginProps) => {
  const query = useQuery()
  const code = query.get('code')
  const [state, setState] = useState<LoginState | null>(null)

  if (code && !state) {
    const params = new URLSearchParams({ code: code })
    const headers = { 'Accept': 'application/json' }
    axios
      .get<User>(`${cfg.backendUrl}/home_chat/user`, { params: params, headers: headers })
      .then(response => {
        setState({ user: response.data })
      })
      .catch(error => {
        setState({ error: error })
      })
  }

  return (
    <Layout className='login-layout'>
      <Content className='login-content'>
        <RemoteIcon type='icon-swallow' className='login-swallow' />
        <h1>welcome to home_chat</h1>
      </Content>
      <Footer className='login-footer'>
        {code ?
          renderState(state)
          :
          <a href={`https://github.com/login/oauth/authorize?client_id=${cfg.clientId}&scope=read:user`}>
            <LoginOutlined className='login-github' />
          </a>
        }
        {props.location?.state?.error ? <Alert type='error' showIcon message={props.location.state.error.message} /> : <></>}
      </Footer>
    </Layout >
  )
}

export { Login }