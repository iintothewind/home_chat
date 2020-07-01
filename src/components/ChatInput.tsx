import React, { Component } from 'react'
import { Button, Drawer, notification } from 'antd'
import moment from 'moment'
import { Message } from '../util/db';
import { cfg } from '../util/config';
import '../styles/ChatInput.css'
import { SendOutlined, FileMarkdownOutlined } from '@ant-design/icons'
// import { createFromIconfontCN } from '@ant-design/icons'

// const Icon = createFromIconfontCN({
//   scriptUrl: [
//     '//at.alicdn.com/t/font_1916135_bbxcwszebon.js',
//   ],
// })

interface ChatInputProps {
  topic: string
  sender: string
  sendMessage: (message: Message) => void
}

interface ChatInputStates {
  inputText: string
  drawerVisible: boolean
  drawerPlacement: string
}

export default class ChatInput extends Component<ChatInputProps, ChatInputStates> {
  private textarea: React.RefObject<HTMLTextAreaElement>
  constructor(props: ChatInputProps) {
    super(props)
    this.textarea = React.createRef<HTMLTextAreaElement>()
    this.state = { drawerVisible: false, drawerPlacement: 'left', inputText: '' }
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
    this.setState({ inputText: e.target.value })
  }

  render() {
    const { inputText } = this.state
    return (
      <div className='chat-input-wrapper'>
        <Button
          type='primary'
          shape='circle'
          size='large'
          icon={<FileMarkdownOutlined />}
          className='text-render'
        />
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
      </div>
    )
  }
}