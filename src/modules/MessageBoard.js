import React from 'react';
import 'antd/dist/antd.css';
import { Input, List, Comment, Layout, notification } from 'antd';
import moment from 'moment';

const { TextArea } = Input;
const { Footer, Content } = Layout;

export class MessageBoard extends React.Component {
  constructor(props) {
    super(props)
    const params = new URLSearchParams(this.props.location.search)
    const client = require('mqtt').connect(params.get('mqtt_url'))
    const sender = params.get('name') || 'user'.concat(moment().format('X'))
    const topic = params.get('topic') || 'home'
    this.state = { client: client, topic: topic, sender: sender, messages: [] }
  }

  addMessage = message => {
    if (message.content.trim()) {
      this.state.client.publish(this.state.topic, JSON.stringify(message))
    }
  }

  componentDidMount() {
    this.state.client.on('connect', () => {
      this.state.client.subscribe(this.state.topic, error => {
        if (error) {
          notification['error'].open({
            message: 'MQTT Client',
            description: 'MQTT client subscription failed: '.concat(error.message)
          })
        }
      })
    })

    this.state.client.on('message', (topic, message) => {
      const msg = JSON.parse(message)
      this.setState({ messages: this.state.messages.concat({ sender: msg.sender, moment: msg.moment, content: msg.content }) })
    })

    this.state.client.on('error', error => {
      notification['error'].open({
        message: 'MQTT Client',
        description: 'MQTT client error: '.concat(error.message)
      });
    })
  }

  componentWillUnmount() {
    this.state.client.end()
  }

  componentDidUpdate() {
    this.bottom.scrollIntoView({ behavior: "smooth" });
  }

  render() {
    return (
      <div ref={ref => this.container = ref}>
        <Layout>
          <Content>
            <List
              size="small"
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
            <TextArea
              allowClear
              ref={ref => this.inputArea = ref}
              rows={4}
              onKeyPress={e => {
                if (e.ctrlKey && e.which === 13) {
                  const msg = e.target.value.trim()
                  if (msg) {
                    this.addMessage({ sender: this.state.sender, moment: moment().format('YYYY-MM-DD HH:mm:ss'), content: msg })
                    this.inputArea.setState({ value: '' })
                  }
                }
              }} />
          </Footer>
        </Layout>
        <div style={{ float: "left", clear: "both" }} ref={(el) => { this.bottom = el; }}>
        </div>
      </div >

    );
  }

}