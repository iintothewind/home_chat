import React from 'react'
import { Tooltip, Card, Input, Button, Switch, notification } from 'antd'
import { cfg } from '../util/config';
import { imageUrlRegex, makeImage } from '../util'
import { PlusOutlined } from '@ant-design/icons'


interface StickerProps {
  name?: string
  url: string
  handleClick?: () => void
}

class Sticker extends React.Component<StickerProps> {
  render() {
    return <Card.Grid>
      <Tooltip title={this.props.name}>
        <img src={this.props.url} alt={this.props.name} onClick={() => this.props.handleClick && this.props.handleClick()} />
      </Tooltip>
    </Card.Grid>;
  }
}

interface CardProps {
  updateSticker: (imageMarkdown: string) => void
}

interface CardState {
  stickers: StickerProps[]
  allowRemove: boolean
  inputUrl?: string
}


export default class StickerCard extends React.Component<CardProps, CardState> {
  private urlInput: React.RefObject<Input>
  constructor(props: CardProps) {
    super(props)
    this.urlInput = React.createRef<Input>()
    this.state = {
      stickers: [{ name: 'clicker1', url: 'https://sorry.xuty.tk/cache/99af0aafd5091a947adca07b4307859b.gif' }],
      allowRemove: false,
      inputUrl: ''
    }
  }

  switchRemove = () => {
    this.setState({ allowRemove: !this.state.allowRemove })
  }

  addSticker = () => {
    const inputUrl = this.urlInput.current?.state.value
    if (!inputUrl || !imageUrlRegex.test(inputUrl)) {
      notification['warning']({
        message: 'addSticker',
        description: `input url is invalid`
      })
    } else if (this.state.stickers.length > cfg.maxSticker) {
      notification['warning']({
        message: 'addSticker',
        description: `stickers exceeded max allowed : ${cfg.maxSticker}`
      })
    } else if (this.state.stickers.find(sticker => sticker.url === inputUrl)) {
      notification['warning']({
        message: 'addSticker',
        description: 'this sticker has already been added'
      })
    } else {
      const sticker = { url: inputUrl }
      this.setState({ stickers: this.state.stickers.concat(sticker) })
    }
  }

  removeSticker = (key: number) => {
    this.setState({ stickers: this.state.stickers.filter((_, i) => i !== key) })
  }

  handleStickerClick = (key: number, url: string) => {
    if (this.state.allowRemove) {
      this.removeSticker(key)
    } else {
      this.props.updateSticker(makeImage(url))
    }
  }

  render() {
    return <div className='sticker-card'>
      <div>
        <Switch checkedChildren="del" onClick={this.switchRemove} />
        <Input placeholder="image url" allowClear disabled={this.state.allowRemove} ref={this.urlInput} />
        <Tooltip title='add sticker'>
          <Button shape='circle' icon={<PlusOutlined />} disabled={this.state.allowRemove} onClick={this.addSticker} />
        </Tooltip>
      </div >
      <Card>
        {this.state.stickers.map((stickProps, index) => {
          return <Sticker
            key={index}
            name={String(index)}
            url={stickProps.url}
            handleClick={() => this.handleStickerClick(index, stickProps.url)} />
        })}
      </Card>
    </div>
  }
}