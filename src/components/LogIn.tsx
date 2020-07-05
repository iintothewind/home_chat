import React from 'react'
import { Layout, notification, message, Tooltip } from 'antd'
import { GithubOutlined, LoginOutlined } from '@ant-design/icons'
import '../styles/login.css'

const { Footer, Content } = Layout


const Login = () => {

  return (
    <Layout className='login-layout'>
      <Content className='login-content'>
        <Tooltip title='click to sign in with github'>
          <GithubOutlined className='login-github' />
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