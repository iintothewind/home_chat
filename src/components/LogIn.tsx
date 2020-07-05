import React from 'react'
import { Layout, notification, message, Tooltip } from 'antd'
import { GithubOutlined } from '@ant-design/icons'
import '../styles/login.css'

const { Footer, Content } = Layout


const Login = () => {

  return (
    <Layout className='login-layout'>
      <Content className='login-content'>
        <GithubOutlined className='login-github' />
      </Content>
      <Footer>
        <GithubOutlined style={{ fontSize: '48px', color: '#08c' }} />
      </Footer>
    </Layout>
  )
}

export { Login }