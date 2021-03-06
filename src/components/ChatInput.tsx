import React, { Component } from 'react'
import { Drawer, Tabs, message } from 'antd'
import moment from 'moment'
import { Message } from '../util/db';
import { removeExtraBlankLines, makeImage, makeLink, makeCode, makeBold, escapeMarkdown, imageMarkdownRegex } from '../util'
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
  markdownEnabled: boolean
}

export default class ChatInput extends Component<ChatInputProps, ChatInputStates> {
  private textarea: React.RefObject<HTMLTextAreaElement>
  constructor(props: ChatInputProps) {
    super(props)
    this.textarea = React.createRef<HTMLTextAreaElement>()
    this.state = { inputText: '', drawerVisible: false, markdownEnabled: false }
  }

  handleInput = () => {
    const text = this.textarea.current?.value?.trim()
    if (text) {
      const markdownImageNumber = text.split('![').length - 1
      if (this.state.markdownEnabled && markdownImageNumber > 1) {
        void message.warning('Only one markdown image is supported per each message')
      } else if (this.props.sendMessage) {
        const now = moment.now()
        const category = this.state.markdownEnabled ? 'markdown' : 'plain'
        const content = this.state.markdownEnabled ? text : removeExtraBlankLines(text)
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
      this.setState({ markdownEnabled: false, drawerVisible: false })
      void message.warning(`Input text is invalid for the selected operation`)
    } else {
      this.setState({ inputText: markdownText, markdownEnabled: true, drawerVisible: false })
    }
  }

  updateMarkdown = (operation: string) => {
    if ('mode change' === operation) {
      this.setState({ markdownEnabled: !this.state.markdownEnabled, drawerVisible: false })
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
      this.setState({ markdownEnabled: true, drawerVisible: false })
    } else if (imageMarkdown && imageMarkdownRegex.test(imageMarkdown)) {
      this.setState({ inputText: `${this.state.inputText}  ${imageMarkdown}`, markdownEnabled: true, drawerVisible: false })
    }
  }

  componentDidMount(): void {

  }

  render() {
    const { inputText, drawerVisible, markdownEnabled } = this.state
    return (
      <div className='chat-input-wrapper'>
        <div className='text-render-box' role='button' tabIndex={0} onKeyPress={this.showDrawer} onClick={this.showDrawer}>
          {markdownEnabled ? <RemoteIcon type='icon-file-markdown' className='text-render' /> : <RemoteIcon type='icon-file-text' className='text-render' />}
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
        <div className='send-button-box' role='button' tabIndex={0} onKeyPress={this.handleInput} onClick={this.handleInput}>
          <RemoteIcon type='icon-send' className='send-button' />
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