import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { submitIcon } from './icon'
import './ChatInput.css'

export default class ChatInput extends Component {
  static propTypes = {
    sendMessage: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.state = { inputText: '' }
  }

  send = () => {
    this.setState({ inputText: '' })
  }

  onKeyPress = e => {
    if (e.ctrlKey && e.which === 13) {
      this.send()
    }
  }

  onTextChange = e => {
    const text = e.target.value
    if (text.trim()) {
      this.setState({ inputText: e.target.value })
    }
  }

  render() {
    const { inputText } = this.state
    return (
      <div className='chat-input-wrapper'>
        <div className='textarea-box' style={{ height: !inputText ? 32 : 'auto' }}>
          <p className='placeholder'>{inputText}</p>
          <textarea
            type='text'
            className='textarea'
            value={inputText}
            placeholder='input ctrl-enter to send'
            onChange={this.onTextChange}
            onKeyPress={this.onKeyPress}
            ref={(ref) => { this.textarea = ref }}
          />
        </div>
        <div className='send-button-box' onClick={this.send}>
          <img src={submitIcon} className='send-button' alt='send messge' />
        </div>
      </div>
    )
  }
}