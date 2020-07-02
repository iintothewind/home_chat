import React, { Component } from 'react'
import { Button, Drawer, Tabs, notification } from 'antd'
import moment from 'moment'
import { Message } from '../util/db';
import { makeImage, makeLink, makeCode, makeBold, escapeMarkDown } from '../util'
import { cfg } from '../util/config';
import '../styles/ChatInput.css'
import { SendOutlined } from '@ant-design/icons'
import MarkDownTable from './markdown';

// const Icon = createFromIconfontCN({
//   scriptUrl: [
//     '//at.alicdn.com/t/font_1916135_bbxcwszebon.js',
//   ],
// })
const { TabPane } = Tabs

interface ChatInputProps {
  topic: string
  sender: string
  sendMessage: (message: Message) => void
}

interface ChatInputStates {
  inputText: string
  drawerVisible: boolean
  markDownEnabled: boolean
}

export default class ChatInput extends Component<ChatInputProps, ChatInputStates> {
  private textarea: React.RefObject<HTMLTextAreaElement>
  constructor(props: ChatInputProps) {
    super(props)
    this.textarea = React.createRef<HTMLTextAreaElement>()
    this.state = { inputText: '', drawerVisible: false, markDownEnabled: false }
  }

  handleInput = () => {
    if (this.textarea.current?.value) {
      const inputValue = this.textarea.current.value
      if (inputValue && inputValue.trim() && this.props.sendMessage) {
        const now = moment.now()
        const content = inputValue.trim()
        this.props.sendMessage({ topic: this.props.topic, moment: now, sender: this.props.sender, content: content })
        this.setState({ inputText: '' })
      }
    }
  }

  showDrawer = () => {
    this.setState({ drawerVisible: true });
  }

  onDrawerClose = () => {
    this.setState({ drawerVisible: false });
  }

  onKeyPress: React.KeyboardEventHandler<HTMLTextAreaElement> = e => {
    if (e.ctrlKey && e.which === 13) {
      const inputText = this.state.inputText || ''
      //  eslint-disable-next-line
      if (inputText.replace(/[^\x00-\xff]/g, '00').length > cfg.maxInputLength) {
        notification['warning']({
          message: 'Input TextArea',
          description: `Input text exceeded max length : ${cfg.maxInputLength}`
        })
      } else {
        this.handleInput()
      }
    }
  }

  onTextChange: React.ChangeEventHandler<HTMLTextAreaElement> = e => {
    this.setState({ inputText: e.target.value, drawerVisible: false })
  }

  operate = (ops: (text: string) => string) => {
    const plainText = this.state.inputText
    const markdownText = ops(plainText)
    if (plainText === markdownText) {
      this.setState({ markDownEnabled: false, drawerVisible: false })
      notification['warning']({
        message: 'Markdonw Text',
        description: `Input text is invalid for the selected operation`
      })
    } else {
      this.setState({ inputText: markdownText, markDownEnabled: true, drawerVisible: false })
    }
  }

  updateText = (operation: string, markDownEnabled: boolean) => {
    if ('plain text' === operation) {
      this.setState({ markDownEnabled: markDownEnabled, drawerVisible: false })
    } else if ('insert image' === operation) {
      this.operate(makeImage)
    } else if ('insert link' === operation) {
      this.operate(makeLink)
    } else if ('insert code' === operation) {
      this.operate(makeCode)
    } else if ('bold text' === operation) {
      this.operate(makeBold)
    } else if ('escape characters' === operation) {
      this.operate(escapeMarkDown)
    }
  }

  render() {
    const { inputText, drawerVisible, markDownEnabled } = this.state
    return (
      <div className='chat-input-wrapper'>
        <Button
          type='primary'
          shape='circle'
          size='large'
          // icon={markDownEnabled ? <FileMarkdownOutlined /> : <FileTextOutlined />}
          className='text-render'
          onClick={this.showDrawer}
        >
          {markDownEnabled ? 'M' : 'T'}
        </Button>
        <div className='textarea-box' style={{ height: !inputText ? 32 : 'auto' }}>
          <p className='placeholder'>{inputText}</p>
          <textarea
            className='textarea'
            value={inputText}
            maxLength={cfg.maxInputLength}
            placeholder='press ctrl-enter to send'
            onChange={this.onTextChange}
            onKeyPress={this.onKeyPress}
            ref={this.textarea}
          />
        </div>
        <Button
          type='primary'
          shape='circle'
          size='large'
          icon={<SendOutlined />}
          className='send-button'
          onClick={this.handleInput}
        />
        <Drawer
          placement='top'
          height={350}
          closable={true}
          onClose={this.onDrawerClose}
          visible={drawerVisible}
          key='bottom'
        >
          <Tabs defaultActiveKey='1' >
            <TabPane tab='markdown' key='1'>
              <MarkDownTable updateText={this.updateText} />
            </TabPane>
            <TabPane tab='emoji' key='2'>
              <p>Some contents...</p>
              <p>Some contents...</p>
              <p>Some contents...</p>
              <p>Some contents...</p>
              <p>Some contents...</p>
              <p>Some contents...</p>
              <p>Some contents...</p>
              <p>Some contents...</p>
              <p>Some contents...</p>
              <p>Some contents...</p>
              <p>Some contents...</p>
              <p>Some contents...</p>
            </TabPane>
          </Tabs>
        </Drawer>
      </div>
    )
  }
}