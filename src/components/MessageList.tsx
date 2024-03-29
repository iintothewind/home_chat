import React from 'react'
import Markdown from 'react-showdown'
import { List, Comment, Layout, notification, Tooltip, Affix, Button } from 'antd'
import * as moment from 'moment'
import ChatInput from './ChatInput'
import db, { Message } from '../util/db'
import { isJsonString, imageMarkdownRegex } from '../util'
// import { connect, MqttClient } from 'precompiled-mqtt'
import { connect, MqttClient } from 'mqtt'
import { cfg } from '../util/config'
import axios from 'axios'
import nprogress from 'nprogress'
import push from 'push.js'
import '../styles/global.css'
import '../styles/nprogress.css'
import logo from '../resources/logo70.png'
import { RemoteIcon } from '../util/icon'

const markdownOptions = {
  omitExtraWLInCodeBlocks: true,
  parseImgDimensions: true,
  simplifiedAutoLink: true,
  tables: true,
  tasklists: true,
  simpleLineBreaks: true,
  requireSpaceBeforeHeadingText: true,
  openLinksInNewWindow: true,
  backslashEscapesHTMLTags: true,
  ghMentions: false,
  ghMentionsLink: false,
}

const { Footer, Content } = Layout

interface MessageListProps {
  location?: { search?: string }
}

interface MessageListState {
  messages: Message[]
  images: Message[]
  allowNotify: boolean
  allowLoadHistory: boolean
}

export default class MessageList extends React.Component<MessageListProps, MessageListState> {
  private user: string
  private topic: string
  private mqtt: MqttClient
  private chatInput: React.RefObject<ChatInput>
  private bottom: React.RefObject<HTMLDivElement>
  constructor(props: MessageListProps) {
    super(props)
    this.chatInput = React.createRef<ChatInput>()
    this.bottom = React.createRef<HTMLDivElement>()
    const params = this.initParams(this.props?.location?.search)
    this.user = params.user
    this.topic = params.topic
    this.mqtt = this.initMqttConnection(this.user)
    this.state = { messages: [], images: [], allowNotify: false, allowLoadHistory: true }
  }

  initParams = (query: string | undefined) => {
    const params = new URLSearchParams(query)
    const user = params.get('user')?.trim() || `user_${moment.default().format('x')}`
    const topic = params.get('topic')?.trim() ? `${cfg.mqttTopicPrefx}${(params.get('topic') || '').trim()}` : `${cfg.mqttTopicPrefx}${cfg.mqttDefaultTopic}`
    return { user: user, topic: topic }
  }

  initMqttConnection = (sender: string) => {
    const mqttUrl = 'https:' === window.location.protocol ? cfg.mqttsUrl : cfg.mqttUrl
    const clean = sender.startsWith('user_') ? true : false
    const client = connect(mqttUrl, { clientId: this.user, clean: clean, rejectUnauthorized: false })
    return client
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
    nprogress.start()
  }

  cleanExpiredMessages = (owner: string) => {
    const localMessageExpirationTime: number = Number(moment.default().subtract(cfg.localTextMessageExpiration.amount, cfg.localTextMessageExpiration.unit).format('x'))
    db.transaction('rw', db.message, async () => {
      await db.message
        .where('owner').equalsIgnoreCase(owner)
        .and(message => message.moment < localMessageExpirationTime)
        .delete()
    }).catch(error => {
      notification['error']({
        message: 'IndexedDB',
        description: 'failed to clean message: '.concat(error)
      })
    })
  }

  cleanExpiredImages = (owner: string) => {
    const imageExpirationTime: number = Number(moment.default().subtract(cfg.localImageMessageExpiration.amount, cfg.localImageMessageExpiration.unit).format('x'))
    db.transaction('rw', db.message, async () => {
      await db.message
        .where('owner').equalsIgnoreCase(owner)
        .and(msg =>
          msg.category === 'markdown'
          && msg.moment < imageExpirationTime
          && imageMarkdownRegex.test(msg.content))
        .modify((msg: Message) => msg.category = 'plain')
    }).catch(error => {
      notification['error']({
        message: 'IndexedDB',
        description: 'failed to clean image: '.concat(error)
      })
    })
  }

  loadMessages = (owner: string) => {
    db.transaction('r', db.message, async () => {
      const messages: Message[] = await db.message.where('owner').equalsIgnoreCase(owner).sortBy('moment')
      const images: Message[] = messages.filter(msg => msg.category === 'markdown' && imageMarkdownRegex.test(msg.content))
      this.setState({ messages: messages.concat(this.state.messages), images: images.concat(this.state.images) })
    }).then(_ => {
      if (this.state.messages && this.state.messages.length === 0) {
        this.loadHistory().catch(error=>{
          notification['error']({
            message: 'loadHistory',
            description: 'failed to load history: '.concat(error)
          })
        })
      }
    }).catch(error => {
      notification['error']({
        message: 'IndexedDB',
        description: 'failed to load chat log: '.concat(error)
      })
    })
  }

  // load last n messages in redis stream from start to 1 second before the moment of the first message in the list
  loadHistory = async () => {
    this.setState({ allowLoadHistory: false })
    const momentOfHeadMessage: number = this.state.messages && this.state.messages.length > 0 ? this.state.messages[0].moment : Number(moment.default().format('x'))
    const before: string = moment.default(momentOfHeadMessage, 'x').subtract(1, 'second').format('x')
    const params = new URLSearchParams({ topic: this.topic, before: before })
    const headers = { 'Accept': 'application/json' }
    const historyMessages: Message[] = await axios
      .get<{ messages: Message[] }>(`${cfg.backendUrl}/home_chat/history`, { params: params, headers: headers, timeout: 30000 })
      .then(response => this.state.messages && this.state.messages.length > 0 ? response.data.messages.filter(_ => _.moment < this.state.messages[0].moment) : response.data.messages)
      .catch(_ => [])
    if (historyMessages && historyMessages.length > 0) {
      await db
        .message
        .bulkAdd(historyMessages.map(msg => ({ topic: msg.topic, owner: this.user, moment: msg.moment, sender: msg.sender, category: msg.category, content: msg.content } as Message)))
        .catch(error => notification['error']({
          message: 'IndexedDB',
          description: 'failed to log message: '.concat(error)
        }))
      const historyImages = historyMessages.filter(msg => msg.category === 'markdown' && imageMarkdownRegex.test(msg.content))
      this.setState({
        messages: this.state.messages.concat(historyMessages).sort((l, r) => l.moment - r.moment),
        images: this.state.images.concat(historyImages).sort((l, r) => l.moment - r.moment),
        allowLoadHistory: true
      })
    } else {
      this.setState({ allowLoadHistory: false })
    }
  }

  logMessage = (message: Message) => {
    db.transaction('rw', db.message, async () => {
      await db.message.add(message)
    }).catch(error => {
      notification['error']({
        message: 'IndexedDB',
        description: 'failed to log message: '.concat(error)
      })
    })
  }

  handleDocVisibilityChange = () => {
    if (document.visibilityState === 'hidden' && push.Permission.has()) {
      this.setState({ allowNotify: true })
    } else {
      this.setState({ allowNotify: false })
    }
  }

  pushNotification = (message: Message) => {
    if (this.state.allowNotify) {
      void push.create(`${message.sender}: `, {
        tag: `msg${message.moment}`,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        icon: logo,
        body: message.content,
        timeout: 5000,
        onClick: () => {
          push.close(`msg${message.moment}`)
        }
      })
    }
  }

  componentDidMount(): void {
    push.Permission.request()
    document.addEventListener('visibilitychange', this.handleDocVisibilityChange)
    nprogress.configure({ showSpinner: false })
    this.cleanExpiredImages(this.user)
    this.cleanExpiredMessages(this.user)
    this.loadMessages(this.user)
    this.mqtt
      .on('connect', () => {
        this.mqtt.subscribe({ [this.topic]: { qos: 2 } }, error => {
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
        if (isJsonString(payload)) {
          const msg: Message = JSON.parse(payload) as Message
          if (msg.sender && msg.moment && msg.content
            && !this.state.messages.find(_ => _.moment === msg.moment && _.sender === msg.sender)) {
            const message: Message = { topic: msg.topic, owner: this.user, moment: msg.moment, sender: msg.sender, category: msg.category, content: msg.content }
            if (msg.category === 'markdown' && imageMarkdownRegex.test(message.content)) {
              this.setState({ messages: this.state.messages.concat(message), images: this.state.images.concat(message) })
            } else {
              this.setState({ messages: this.state.messages.concat(message) })
            }
            this.logMessage(message)
            this.pushNotification(message)
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
        })
        nprogress.done()
      })
  }

  componentWillUnmount(): void {
    this.mqtt.end()
    this.cleanExpiredImages(this.user)
    this.cleanExpiredMessages(this.user)
  }

  refreshState = () => {
    const imageExpirationTime: number = Number(moment.default().subtract(cfg.localImageMessageExpiration.amount, cfg.localImageMessageExpiration.unit).format('x'))
    const refreshedImages = this.state.images.slice(-cfg.maxInListImages).filter(msg => msg.moment > imageExpirationTime)
    const refreshedHeadImage = refreshedImages[0]
    const refreshedMessages = this.state.messages.map(message => {
      if ((message.category === 'markdown'
        && imageMarkdownRegex.test(message.content)
        && ((refreshedHeadImage && message.moment < refreshedHeadImage.moment) || message.moment <= imageExpirationTime))) {
        const plainMessage: Message = { owner: message.owner, topic: message.topic, moment: message.moment, sender: message.sender, category: 'plain', content: message.content }
        return plainMessage
      } else {
        return message
      }
    })

    if (this.state.images.length !== refreshedImages.length) {
      this.setState({ messages: refreshedMessages, images: refreshedImages })
    }
  }

  componentDidUpdate(): void {
    this.refreshState()
    this.bottom.current?.scrollIntoView({ behavior: 'smooth' })
    nprogress.done()
  }

  render() {
    return (
      <div className='message-list-wrapper'>
        {this.state.allowLoadHistory ?
          <Affix offsetTop={10} style={{ position: 'absolute', left: '80%' }}>
            <Button shape='circle' icon={<RemoteIcon type='icon-history' />} onClick={this.loadHistory} />
          </Affix>
          :
          <div />
        }
        <Layout>
          <Content>
            <List
              size='small'
              dataSource={this.state.messages}
              renderItem={message => (
                <List.Item>
                  <Comment
                    author={
                      <Tooltip title={`${message.sender}@${message.topic}`}>
                        <b>{message.sender}</b>
                      </Tooltip>
                    }
                    datetime={
                      <Tooltip title={moment.default(message.moment, 'x').fromNow()}>
                        <span>{moment.default(message.moment, 'x').format('YYYY-MM-DD HH:mm:ss')}</span>
                      </Tooltip>
                    }
                    content={'markdown' === message.category ?
                      <Markdown markdown={message.content} options={markdownOptions} flavor='github' />
                      :
                      <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
                    }
                  />
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
