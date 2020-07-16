import React, { Component } from 'react'
import { Drawer, Tabs, message } from 'antd'
import moment from 'moment'
import { Message } from '../util/db';
import { makeImage, makeLink, makeCode, makeBold, escapeMarkdown, imageMarkdownRegex } from '../util'
import { cfg } from '../util/config';
import '../styles/ChatInput.css'
import MarkDownTable from './markdown'
import StickerCard from './sticker';
import { RemoteIcon } from '../util/icon'

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
      const markdownImageNumber = inputValue.split('![').length - 1
      if (this.state.markDownEnabled && markdownImageNumber > 1) {
        void message.warning('Only one markdown image is supported per each message')
      } else if (inputValue && inputValue.trim() && this.props.sendMessage) {
        const now = moment.now()
        const category = this.state.markDownEnabled ? 'markdown' : 'plain'
        const content = inputValue.trim()
        this.props.sendMessage({ topic: this.props.topic, moment: now, sender: this.props.sender, category: category, content: content })
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
        void message.warning(`Input text exceeded max length : ${cfg.maxInputLength}`)
      } else {
        this.handleInput()
      }
    }
  }

  onTextChange: React.ChangeEventHandler<HTMLTextAreaElement> = e => {
    const input = e.target.value
    if (input === '' || input?.trim()) {
      this.setState({ inputText: e.target.value, drawerVisible: false })
    }
  }

  operate = (ops: (text: string) => string) => {
    const plainText = this.state.inputText
    const markdownText = ops(plainText)
    if (plainText === markdownText) {
      this.setState({ markDownEnabled: false, drawerVisible: false })
      void message.warning(`Input text is invalid for the selected operation`)
    } else {
      this.setState({ inputText: markdownText, markDownEnabled: true, drawerVisible: false })
    }
  }

  updateMarkdown = (operation: string) => {
    if ('mode change' === operation) {
      this.setState({ markDownEnabled: !this.state.markDownEnabled, drawerVisible: false })
    } else if ('insert image' === operation) {
      this.operate(makeImage)
    } else if ('insert link' === operation) {
      this.operate(makeLink)
    } else if ('insert code' === operation) {
      this.operate(makeCode)
    } else if ('bold text' === operation) {
      this.operate(makeBold)
    } else if ('escape characters' === operation) {
      this.operate(escapeMarkdown)
    }
  }

  updateSticker = (imageMarkdown: string) => {
    const existingText = this.state.inputText
    if (existingText && imageMarkdownRegex.test(existingText)) {
      void message.warning('Only one markdown image is supported per each message')
      this.setState({ markDownEnabled: true, drawerVisible: false })
    } else if (imageMarkdown && imageMarkdownRegex.test(imageMarkdown)) {
      this.setState({ inputText: `${this.state.inputText}  ${imageMarkdown}`, markDownEnabled: true, drawerVisible: false })
    }
  }

  componentDidMount(): void {

  }

  render() {
    const { inputText, drawerVisible, markDownEnabled } = this.state
    return (
      <div className='chat-input-wrapper'>
        <div className='text-render-box'>
          {markDownEnabled ? <RemoteIcon type='icon-file-markdown' className='text-render' onClick={this.showDrawer} /> : <RemoteIcon type='icon-file-text' className='text-render' onClick={this.showDrawer} />}
        </div>
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
        <div className='send-button-box'>
          <RemoteIcon type='icon-send' className='send-button' onClick={this.handleInput} />
        </div>
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
              <MarkDownTable updateMarkdown={this.updateMarkdown} />
            </TabPane>
            <TabPane tab='sticker' key='2'>
              <StickerCard sender={this.props.sender} updateSticker={this.updateSticker} />
            </TabPane>
          </Tabs>
        </Drawer>
      </div>
    )
  }
}