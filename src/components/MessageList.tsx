import React from 'react'
import { List, Comment, Layout, notification } from 'antd'
import moment from 'moment'
import ChatInput from './ChatInput'
import db, { Message } from '../util/db'
import { isJsonString } from '../util/util';
import { connect, MqttClient } from 'mqtt'
import { cfg } from '../util/config';
import '../styles/global.css'

const { Footer, Content } = Layout

interface Location {
  readonly search?: string
}

interface MessageListProps {
  readonly location?: Location
}

interface MessageListStates {
  readonly messages: Message[]
}


export default class MessageList extends React.Component<MessageListProps, MessageListStates> {
  private chatInput: React.RefObject<ChatInput>
  private bottom: React.RefObject<HTMLDivElement>
  private user: string
  private topic: string
  private mqtt: MqttClient
  constructor(props: MessageListProps) {
    super(props)
    this.chatInput = React.createRef<ChatInput>()
    this.bottom = React.createRef<HTMLDivElement>()
    const params = this.initParams(this.props?.location?.search)
    this.user = params.user
    this.topic = params.topic
    this.mqtt = this.initMqttConnection(this.user)
    this.state = { messages: [] }
  }

  initParams = (query: string | undefined) => {
    const params = new URLSearchParams(query)
    const user = params.get('user')?.trim() || `user_${moment().format('x')}`
    const topic = params.get('topic')?.trim() ? `${cfg.appKey}/${params.get('topic')?.trim()}` : cfg.mqttDefaultTopic
    return { user: user, topic: topic }
  }

  initMqttConnection = (sender: string) => {
    const mqttUrl = 'https:' === window.location.protocol ? cfg.mqttsUrl : cfg.mqttUrl
    const clean = sender.startsWith('user_') ? true : false
    const client = connect(mqttUrl, { clientId: this.user, clean: clean })
    return client;
  }

  sendMessage = (message: Message) => {
    this.mqtt.publish(message.topic, JSON.stringify(message), { qos: 2 }, error => {
      if (error) {
        notification['error']({
          message: 'MQTTClient',
          description: 'failed to send message: '.concat(error.message)
        })
      }
    })
  }

  loadMessages = (owner: string) => {
    db.transaction('r', db.message, async () => {
      const messages = await db.message.where('owner').equalsIgnoreCase(owner).sortBy('moment')
      this.setState({ messages: messages })
    }).catch(error => {
      notification['error']({
        message: 'IndexedDB',
        description: 'failed to load chat log: '.concat(error.message)
      })
    })
  }

  logMessage = (message: Message) => {
    db.transaction('rw', db.message, async () => {
      await db.message.add(message)
    }).catch(error => {
      notification['error']({
        message: 'IndexedDB',
        description: 'failed to log message: '.concat(error.message)
      })
    })
  }

  componentDidMount(): void {
    this.loadMessages(this.user)
    this.mqtt
      .on('connect', () => {
        this.mqtt.subscribe(this.topic, { qos: 2 }, error => {
          if (error) {
            notification['error']({
              message: 'MQTTClient',
              description: `Topic ${this.topic} subscription failed: ${error.message}`
            })
          }
        })
      })
      .on('message', (_topic, buffer) => {
        const payload = buffer.toString()
        console.log(payload)
        if (isJsonString(payload)) {
          const msg: Message = JSON.parse(payload) as Message
          if (msg.sender && msg.moment && msg.content) {
            const message: Message = { topic: msg.topic, owner: this.user, moment: msg.moment, sender: msg.sender, content: msg.content }
            this.setState({ messages: this.state.messages.concat(message) })
            this.logMessage(message)
          }
        } else {
          notification['warning']({
            message: 'MQTTClient',
            description: 'Invalid message received: '.concat(payload)
          })
        }
      })
      .on('error', error => {
        notification['error']({
          message: 'MQTTClient',
          description: 'MQTTClient error: '.concat(error.message)
        });
      })
  }

  componentWillUnmount(): void {
    this.mqtt.end()
  }

  componentDidUpdate(): void {
    this.bottom.current?.scrollIntoView({ behavior: 'smooth' });
  }

  render() {
    return (
      <div>
        <Layout>
          <Content>
            <List
              size='small'
              dataSource={this.state.messages}
              renderItem={message => (
                <List.Item>
                  <Comment
                    author={message.sender}
                    datetime={moment(message.moment, 'x').format('YYYY-MM-DD HH:mm:ss')}
                    content={<div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>} />
                </List.Item>
              )}
            />
          </Content>
          <Footer>
            <ChatInput ref={this.chatInput} topic={this.topic} sender={this.user} sendMessage={this.sendMessage} />
          </Footer>
        </Layout>
        <div style={{ float: 'left', clear: 'both' }} ref={this.bottom} />
      </div >
    )
  }

}
