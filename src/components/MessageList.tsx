import React from 'react'
import ReactGA from 'react-ga'
import Markdown from 'react-showdown'
import { List, Comment, Layout, notification, Tooltip } from 'antd'
import moment from 'moment'
import ChatInput from './ChatInput'
import db, { Message } from '../util/db'
import { isJsonString, imageMarkdownRegex } from '../util'
import { connect, MqttClient } from 'mqtt'
import { cfg } from '../util/config'
import nprogress from 'nprogress'
import '../styles/global.css'
import '../styles/nprogress.css'


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
}

const { Footer, Content } = Layout

interface MessageListProps {
  location?: { search?: string }
}

interface MessageListState {
  messages: Message[]
  images: Message[]
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
    this.state = { messages: [], images: [] }
  }

  initParams = (query: string | undefined) => {
    const params = new URLSearchParams(query)
    const user = params.get('user')?.trim() || `user_${moment().format('x')}`
    const topic = params.get('topic')?.trim() ? `${cfg.mqttTopicPrefx}${(params.get('topic') || '').trim()}` : `${cfg.mqttTopicPrefx}${cfg.mqttDefaultTopic}`
    return { user: user, topic: topic }
  }

  initMqttConnection = (sender: string) => {
    const mqttUrl = 'https:' === window.location.protocol ? cfg.mqttsUrl : cfg.mqttUrl
    const clean = sender.startsWith('user_') ? true : false
    const client = connect(mqttUrl, { clientId: this.user, clean: clean })
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
    const localMessageExpirationTime: number = Number(moment().subtract(cfg.localTextMessageExpiration.amount, cfg.localTextMessageExpiration.unit).format('x'))
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
    const imageExpirationTime: number = Number(moment().subtract(cfg.localImageMessageExpiration.amount, cfg.localImageMessageExpiration.unit).format('x'))
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

  updateInListImages = (message: Message) => {
    if (message && message.category === 'markdown' && imageMarkdownRegex.test(message.content)) {
      this.setState({ images: this.state.images.concat(message) })
    }
  }

  loadMessages = (owner: string) => {
    db.transaction('r', db.message, async () => {
      const messages: Message[] = await db.message.where('owner').equalsIgnoreCase(owner).sortBy('moment')
      this.setState({ messages: messages })
      messages.forEach(message => this.updateInListImages(message))
    }).catch(error => {
      notification['error']({
        message: 'IndexedDB',
        description: 'failed to load chat log: '.concat(error)
      })
    })
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

  componentDidMount(): void {
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
          if (msg.sender && msg.moment && msg.content) {
            const message: Message = { topic: msg.topic, owner: this.user, moment: msg.moment, sender: msg.sender, category: msg.category, content: msg.content }
            this.setState({ messages: this.state.messages.concat(message) })
            this.updateInListImages(message)
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
        })
        nprogress.done()
      })

    ReactGA.initialize(cfg.gaTrackingId, {
      gaOptions: {
        userId: this.user
      }
    })
    ReactGA.pageview(`${window.location.pathname}${window.location.search}`)
  }

  componentWillUnmount(): void {
    this.mqtt.end()
    this.cleanExpiredImages(this.user)
    this.cleanExpiredMessages(this.user)
  }

  refreshState = () => {
    const imageExpirationTime: number = Number(moment().subtract(cfg.localImageMessageExpiration.amount, cfg.localImageMessageExpiration.unit).format('x'))
    const refreshedImages = this.state.images.slice(-cfg.maxInListImages).filter(msg => msg.moment > imageExpirationTime)
    const refreshedHeadImage = refreshedImages[0]
    const refreshedMessages = this.state.messages.map(message => {
      if (((refreshedHeadImage && message.moment < refreshedHeadImage.moment) || message.moment < imageExpirationTime) && message.category === 'markdown') {
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
                      <Tooltip title={moment(message.moment, 'x').fromNow()}>
                        <span>{moment(message.moment, 'x').format('YYYY-MM-DD HH:mm:ss')}</span>
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
