import React, { useState } from 'react'
import { Layout, Tooltip } from 'antd'
import { GithubOutlined, LoginOutlined } from '@ant-design/icons'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import nprogress from 'nprogress'
import '../styles/nprogress.css'
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

nprogress.configure({ showSpinner: false })

const fetchUser = (code: string) => {
  const params = new URLSearchParams({ code: code })
  const headers = { 'Accept': 'application/json' }
  return axios.get<User>('https://mqttchat.herokuapp.com/home_chat/user', { params: params, headers: headers })
}

const Login = () => {
  nprogress.start()

  const query = useQuery()
  const code = query.get('code')
  const [state, setState] = useState<LoginState | null>(null)

  if (code && !state) {
    fetchUser(code)
      .then(response => setState({ user: response.data }))
      .catch(error => setState({ error: error }))
  }

  if (state?.user) {
    nprogress.done()
  }

  return (
    <Layout className='login-layout'>
      <Content className='login-content'>
        <GithubOutlined className='login-github' />
      </Content>
      <Footer className='login-footer'>
        <a href='https://github.com/login/oauth/authorize?client_id=d091146121f6eb144f83&scope=user:emai'>
          {code ?
            <Tooltip title='click to login with github' placement='bottom'>
              <LoginOutlined className='login-guest' />
            </Tooltip>
            :
            <Tooltip title='click to login with github' placement='bottom'>
              <LoginOutlined className='login-guest' />
            </Tooltip>
          }
        </a>
      </Footer>
    </Layout>
  )
}

export { Login }