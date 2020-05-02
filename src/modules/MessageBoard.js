import React from 'react'
import 'antd/dist/antd.css'
import './MessageBoard.css'
import { Button, Input, List, Comment, Layout, Row, Col, notification } from 'antd'
import moment from 'moment'

const { TextArea } = Input
const { Footer, Content } = Layout

export class MessageBoard extends React.Component {
  constructor(props) {
    super(props)
    const params = new URLSearchParams(this.props.location.search)
    const sender = params.get('name') || 'user'.concat(moment().format('X'))
    const topic = params.get('topic') || 'home'
    const url = decodeURIComponent(params.get('mqtt_url')) || 'mqtt://'.concat(window.location.hostname).concat(':1884')
    const client = require('mqtt').connect(url, { clean: false, clientId: sender })
    this.state = { client: client, topic: topic, sender: sender, messages: [] }
  }

  pushMessage = message => {
    if (message.content.trim()) {
      this.state.client.publish(this.state.topic, JSON.stringify(message), { qos: 2 }, error => {
        if (error) {
          notification['error'].open({
            message: 'MQTT Client',
            description: 'MQTT client publish failed: '.concat(error.message)
          })
        }
      })
    }
  }

  handleInput() {
    const msg = this.inputArea.state.value.trim()
    if (msg) {
      this.pushMessage({ sender: this.state.sender, moment: moment().format('YYYY-MM-DD HH:mm:ss'), content: msg })
      this.inputArea.setState({ value: '' })
    }
  }

  componentDidMount() {
    this.state.client.on('connect', () => {
      this.state.client.subscribe(this.state.topic, { qos: 2 }, error => {
        if (error) {
          notification['error'].open({
            message: 'MQTT Client',
            description: 'MQTT client subscription failed: '.concat(error.message)
          })
        }
      })
    })

    this.state.client.on('message', (topic, message) => {
      const msg = JSON.parse(message)
      this.setState({ messages: this.state.messages.concat({ sender: msg.sender, moment: msg.moment, content: msg.content }) })
    })

    this.state.client.on('error', error => {
      notification['error'].open({
        message: 'MQTT Client',
        description: 'MQTT client error: '.concat(error.message)
      });
    })
  }

  componentWillUnmount() {
    this.state.client.end()
  }

  componentDidUpdate() {
    this.bottom.scrollIntoView({ behavior: "smooth" });
  }

  render() {
    return (
      <div ref={ref => this.container = ref}>
        <Layout>
          <Content>
            <List
              size="small"
              //pagination={{ pageSize: 9 }}
              dataSource={this.state.messages}
              renderItem={message => (
                <List.Item>
                  <Comment
                    author={message.sender}
                    datetime={message.moment}
                    content={<div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>} />
                </List.Item>
              )}
            />
          </Content>
          <Footer style={{ padding: 0 }}>
            <Row>
              <Col span={20} push={0}>
                <TextArea
                  allowClear
                  ref={ref => this.inputArea = ref}
                  rows={4}
                  onKeyPress={e => {
                    if (e.ctrlKey && e.which === 13) {
                      this.handleInput()
                    }
                  }} />
              </Col>
              <Col span={1} push={0}>
                <Button type="primary" shape="round" size="large" onClick={e => this.handleInput()}>
                  Send
                </Button>
              </Col>
            </Row>
          </Footer>
        </Layout>
        <div style={{ float: "left", clear: "both" }} ref={(ref) => { this.bottom = ref }} />
      </div >

    );
  }

}