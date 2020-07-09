import React, { useEffect, useState } from 'react'
import fetch from 'node-fetch'
import { Layout, Tooltip } from 'antd'
import { GithubOutlined, LoginOutlined } from '@ant-design/icons'
import { useLocation } from 'react-router-dom'
import '../styles/login.css'

const { Footer, Content } = Layout

const useQuery = () => {
  return new URLSearchParams(useLocation().search)
}

interface UserInfo {
  login?: string
  name?: string
  avatarUrl?: string
}

const fetchUser = async (code: string) => {
  const ac: AccessToken = await fetch(`https://gatekeeper-iintothewind.herokuapp.com/authenticate/${code}`)
    .then(resp => resp.json())
  console.log(`ac: ${ac.token}`)
  const user: UserInfo = await fetch(`https://api.github.com/user`, { headers: [['Authorization', `Bearer ${ac.token}`], ['Origin', 'http://localhost:3000'], ['Accept', 'application/json']] })
    .then(resp => resp.json())
  console.log(`user: ${user}`)
  if (user.login) {
    return user
  } {
    throw 'fetch user error';
  }
}

interface LoginState {
  code?: string
}

const Login = () => {
  const query = useQuery()
  const code = query.get('code')
  const [state, setState] = useState<UserInfo | null>(null)

  if (code && !state?.login) {
    fetchUser(code)
      .then(user => setState(user))
      .catch(error => console.log(error))
  }

  return (
    code ?
      <p>code: {code}, user: {JSON.stringify(state)}</p>
      :
      <>
        <Layout className='login-layout'>
          <Content className='login-content'>
            <a href='https://github.com/login/oauth/authorize?client_id=b60569827b30c0e7e58e&scope=user:emai'>
              <Tooltip title='click to sign in with github' placement='top'>
                <GithubOutlined className='login-github' />
              </Tooltip>
            </a>
          </Content>
          <Footer className='login-footer'>
            <Tooltip title='click to login in as guest' placement='bottom'>
              <LoginOutlined className='login-guest' />
            </Tooltip>
          </Footer>
        </Layout>
      </>
  )
}

export { Login }