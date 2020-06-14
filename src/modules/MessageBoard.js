import React from 'react'
import 'antd/dist/antd.css'
import './MessageBoard.css'
import { List, Comment, Layout, notification } from 'antd'
import PropTypes from 'prop-types'
import moment from 'moment'
import { isJsonString } from '../service/util'
import ChatInput from './ChatInput'

const cfg = require('../../package.json')

const _ = require('underscore')
const Barn = require('barn')
const maxLocalMessages = 100

const { Footer, Content } = Layout

export class MessageBoard extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)
    const params = new URLSearchParams(this.props.location.search)
    const sender = params.get('name') || `user_${moment().format('X')}`
    const topic = params.get('topic') || `${cfg.name}/general`
    const url = params.get('mqtt_url') || `mqtt://${window.location.hostname}:1884`
    const client = require('mqtt').connect(decodeURIComponent(url), { clean: false, clientId: sender })
    this.state = { client: client, topic: decodeURIComponent(topic), sender: sender, messages: [] }
  }

  pushMessage = content => {
    if (content && content.trim()) {
      const message = { sender: this.state.sender, moment: moment().format('YYYY-MM-DD HH:mm:ss'), content: content }
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

  removeStaleLocalMessages = () => {
    try {
      const barn = new Barn(cfg.name, localStorage)
      const key = `${this.state.topic}_${this.state.sender}_messages`
      const size = barn.llen(key)
      if (size > maxLocalMessages) {
        _.range(size - maxLocalMessages).forEach(() => barn.lpop(key))
      }
    } catch (error) {
      console.warn('localStorage not supported: ', error)
    }
  }

  loadLocalMessages = () => {
    try {
      const barn = new Barn(cfg.name, localStorage)
      const key = `${this.state.topic}_${this.state.sender}_messages`
      const size = barn.llen(key)
      if (_.isNumber(size) && size > 0) {
        const localMsgs = barn.lrange(key, (size - maxLocalMessages), (size - 1))
        this.setState({ messages: this.state.messages.concat(localMsgs) })
      }
    } catch (error) {
      console.warn('localStorage not supported: ', error)
    }
  }

  pushLocalMessage = msg => {
    try {
      const barn = new Barn(cfg.name, localStorage)
      const key = `${this.state.topic}_${this.state.sender}_messages`
      barn.rpush(key, msg)
    } catch (error) {
      console.warn('localStorage not supported: ', error)
    }
  }

  componentDidMount() {
    this.removeStaleLocalMessages()
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
    this.bottom.scrollIntoView({ behavior: 'smooth' });
  }

  render() {
    return (
      <div ref={ref => this.container = ref}>
        <Layout>
          <Content>
            <List
              size='small'
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
          <Footer>
            <ChatInput ref={ref => this.chatInput = ref} pushMessage={this.pushMessage} />
          </Footer>
        </Layout>
        <div style={{ float: 'left', clear: 'both' }} ref={(ref) => { this.bottom = ref }} />
      </div >

    );
  }

}
