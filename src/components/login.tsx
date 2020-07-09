import React, { useState, useEffect } from 'react'
import { Layout, Tooltip, Spin, Alert } from 'antd'
import { GithubOutlined, LoginOutlined, LoadingOutlined } from '@ant-design/icons'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import '../styles/login.css'

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

const fetchUser = (code: string) => {
  const params = new URLSearchParams({ code: code })
  const headers = { 'Accept': 'application/json' }
  return axios.get<User>('https://mqttchat.herokuapp.com/home_chat/user', { params: params, headers: headers })
}

const Login = () => {
  const query = useQuery()
  const code = query.get('code')
  const [state, setState] = useState<LoginState | null>(null)

  console.log(`code: ${code}, state: ${state}`);
  if (code && !state) {
    fetchUser(code)
      .then(response => {
        console.log(`response: ${response.data}`);
        setState({ user: response.data })
      })
      .catch(error => {
        console.log(`response: ${error}`);
        setState({ error: error })
      })
  }


  return (
    <Layout className='login-layout'>
      <Content className='login-content'>
        <GithubOutlined className='login-github' />
      </Content>
      <Footer className='login-footer'>
        {code ?
          state?.user ?
            <Alert message={JSON.stringify(state.user)} />
            :
            <Spin />
          :
          <a href='https://github.com/login/oauth/authorize?client_id=d091146121f6eb144f83&scope=user:email'>
            <Tooltip title='click to login with github' placement='bottom'>
              <LoginOutlined className='login-guest' />
            </Tooltip>
          </a>
        }
      </Footer>
    </Layout>
  )
}

export { Login }