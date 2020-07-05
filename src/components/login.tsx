import React from 'react'
import { Layout, notification, message, Tooltip } from 'antd'
import { GithubOutlined, LoginOutlined } from '@ant-design/icons'
import { useHistory, useLocation } from 'react-router-dom'
import '../styles/login.css'

const { Footer, Content } = Layout

const Login = () => {

  return (
    <Layout className='login-layout'>
      <Content className='login-content'>
        <Tooltip title='click to sign in with github'>
          <a href='https://github.com/login/oauth/authorize?client_id=b60569827b30c0e7e58e&scope=user:emai'><GithubOutlined className='login-github' /></a>
        </Tooltip>
      </Content>
      <Footer className='login-footer'>
        <Tooltip title='click to login in as guest'>
          <LoginOutlined className='login-guest' />
        </Tooltip>
      </Footer>
    </Layout>
  )
}

export { Login }