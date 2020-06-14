import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { submitIcon } from './icon'
import './ChatInput.css'

export default class ChatInput extends Component {
  static propTypes = {
    pushMessage: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.state = { inputText: '' }
  }

  handleInput = () => {
    if (this.textarea && this.textarea.value) {
      const inputValue = this.textarea.value
      if (inputValue && inputValue.trim()) {
        const content = inputValue.trim()
        this.props.pushMessage(content)
        this.setState({ inputText: '' })
      }
    }
  }

  onKeyPress = e => {
    if (e.ctrlKey && e.which === 13) {
      this.handleInput()
    }
  }

  onTextChange = e => {
    this.setState({ inputText: e.target.value })
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
            maxLength='5120'
            placeholder='press ctrl-enter to send'
            onChange={this.onTextChange}
            onKeyPress={this.onKeyPress}
            ref={ref => { this.textarea = ref }}
          />
        </div>
        <div className='send-button-box' onClick={this.handleInput}>
          <img src={submitIcon} className='send-button' alt='send messge' />
        </div>
      </div>
    )
  }
}