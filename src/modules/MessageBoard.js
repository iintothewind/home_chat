import React from 'react'
import 'antd/dist/antd.css'
import './MessageBoard.css'
import { Button, Input, List, Comment, Layout, Row, Col, notification } from 'antd'
import PropTypes from 'prop-types'
import moment from 'moment'
import { isJsonString } from './util'

const _ = require('underscore')
const Barn = require('barn')
const maxLocalMessages = 100

const { TextArea } = Input
const { Footer, Content } = Layout

export class MessageBoard extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)
    const params = new URLSearchParams(this.props.location.search)
    const sender = params.get('name') || 'user'.concat(moment().format('X'))
    const topic = params.get('topic') || 'home'
    const url = params.get('mqtt_url') || 'mqtt://'.concat(window.location.hostname).concat(':1884')
    const client = require('mqtt').connect(decodeURIComponent(url), { clean: false, clientId: sender })
    this.state = { client: client, topic: topic, sender: sender, messages: [] }
  }

  pushMessage = message => {
    if (message.content.trim()) {
      this.state.client.publish(this.state.topic, JSON.stringify(message), { qos: 2 }, error => {
        if (error) {
          notification['error']({
            message: 'MQTT Client',
            description: 'MQTT client publish failed: '.concat(error.message)
          })
        }
      })
    }
  }

  removeStaleLocalMessages() {
    try {
      const barn = new Barn('home_chat', localStorage)
      const size = barn.llen('messages')
      if (size > maxLocalMessages) {
        _.range(size - maxLocalMessages).forEach(() => barn.lpop('messages'))
      }
    } catch (error) {
      console.warn('localStorage not supported: ', error)
    }
  }

  loadLocalMessages() {
    try {
      const barn = new Barn(localStorage)
      const size = barn.llen('messages')
      if (_.isNumber(size) && size > 0) {
        const localMsgs = barn.lrange('messages', (size - maxLocalMessages), (size - 1))
        this.setState({ messages: this.state.messages.concat(localMsgs) })
      }
    } catch (error) {
      console.warn('localStorage not supported: ', error)
    }
  }

  pushLocalMessage = msg => {
    try {
      const barn = new Barn(localStorage)
      barn.rpush('messages', msg)
    } catch (error) {
      console.warn('localStorage not supported: ', error)
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
    this.loadLocalMessages()

    this.state.client.on('connect', () => {
      this.state.client.subscribe(this.state.topic, { qos: 2 }, error => {
        if (error) {
          notification['error']({
            message: 'MQTT Client',
            description: 'MQTT client subscription failed: '.concat(error.message)
          })
        }
      })
    })

    this.state.client.on('message', (topic, message) => {
      if (isJsonString(message)) {
        const msg = JSON.parse(message)
        if (msg.sender && msg.moment && msg.content) {
          this.setState({ messages: this.state.messages.concat({ sender: msg.sender, moment: msg.moment, content: msg.content }) })
          this.pushLocalMessage(msg)
          this.removeStaleLocalMessages()
        } else {
          notification['warning']({
            message: 'MQTT Client',
            description: 'invalid message: '.concat(message)
          })
        }
      } else {
        notification['warning']({
          message: 'MQTT Client',
          description: 'invalid message: '.concat(message)
        })
      }
    })

    this.state.client.on('error', error => {
      notification['error']({
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
                <Button type="primary" shape="round" size="default" onClick={() => this.handleInput()}>
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
