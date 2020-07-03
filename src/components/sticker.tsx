import React from 'react'
import { Tooltip, Card, Input, Button, Switch, notification } from 'antd'
import { cfg } from '../util/config';
import { imageUrlRegex, makeImage } from '../util'
import { PlusOutlined } from '@ant-design/icons'
import db, { Sticker } from '../util/db'
import moment from 'moment'

interface StickerProps {
  name?: string
  url: string
  handleClick?: () => void
}

class StickerGrid extends React.Component<StickerProps> {
  render() {
    return <Card.Grid>
      <Tooltip title={this.props.name}>
        <img src={this.props.url} alt={this.props.name} onClick={() => this.props.handleClick && this.props.handleClick()} />
      </Tooltip>
    </Card.Grid>;
  }
}

interface CardProps {
  sender: string
  updateSticker: (imageMarkdown: string) => void
}

interface CardState {
  stickers: StickerProps[]
  allowRemove: boolean
  inputUrl?: string
}

const aluFaceUrls = [
  'https://raw.githubusercontent.com/iintothewind/images/master/alu/alu001.png',
  'https://raw.githubusercontent.com/iintothewind/images/master/alu/alu002.png',
  'https://raw.githubusercontent.com/iintothewind/images/master/alu/alu003.png',
  'https://raw.githubusercontent.com/iintothewind/images/master/alu/alu004.png',
  'https://raw.githubusercontent.com/iintothewind/images/master/alu/alu005.png',
  'https://raw.githubusercontent.com/iintothewind/images/master/alu/alu006.png',
  'https://raw.githubusercontent.com/iintothewind/images/master/alu/alu007.png',
  'https://raw.githubusercontent.com/iintothewind/images/master/alu/alu008.png',
  'https://raw.githubusercontent.com/iintothewind/images/master/alu/alu009.png',
  'https://raw.githubusercontent.com/iintothewind/images/master/alu/alu010.png',
  'https://raw.githubusercontent.com/iintothewind/images/master/alu/alu011.png',
  'https://raw.githubusercontent.com/iintothewind/images/master/alu/alu012.png',
  'https://raw.githubusercontent.com/iintothewind/images/master/alu/alu013.png',
  'https://raw.githubusercontent.com/iintothewind/images/master/alu/alu014.png',
  'https://raw.githubusercontent.com/iintothewind/images/master/alu/alu015.png',
  'https://raw.githubusercontent.com/iintothewind/images/master/alu/alu016.png',
  'https://raw.githubusercontent.com/iintothewind/images/master/alu/alu017.png',
  'https://raw.githubusercontent.com/iintothewind/images/master/alu/alu018.png',
]


export default class StickerCard extends React.Component<CardProps, CardState> {
  private urlInput: React.RefObject<Input>
  constructor(props: CardProps) {
    super(props)
    this.urlInput = React.createRef<Input>()
    this.state = {
      stickers: [],
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
      this.saveSticker(this.props.sender, inputUrl)
    }
  }

  removeSticker = (key: number) => {
    const selected = this.state.stickers.find((_, i) => i === key)
    if (selected) {
      this.setState({ stickers: this.state.stickers.filter((_, i) => i !== key) })
      db.transaction('rw', db.sticker, async () => {
        await db.sticker
          .where('owner').equalsIgnoreCase(this.props.sender)
          .and(sticker => sticker.url === selected.url)
          .delete()
      }).catch(error => {
        notification['error']({
          message: 'IndexedDB',
          description: 'failed to remove sticker: '.concat(error.message)
        })
      })
    }
  }

  handleStickerClick = (key: number, url: string) => {
    if (this.state.allowRemove) {
      this.removeSticker(key)
    } else {
      this.props.updateSticker(makeImage(url))
    }
  }

  loadStickers = (owner: string) => {
    db.transaction('rw', db.sticker, async () => {
      const stickers: Sticker[] = await db.sticker.where('owner').equalsIgnoreCase(owner).sortBy('id')
      this.setState({ stickers: stickers })
      this.loadDefaultStickers()
    }).catch(error => {
      notification['error']({
        message: 'IndexedDB',
        description: 'failed to load stickers: '.concat(error.message)
      })
    })
  }

  loadDefaultStickers = () => {
    if (Array.isArray(this.state.stickers) && this.state.stickers.length <= 0) {
      aluFaceUrls.forEach(url => {
        this.setState({ stickers: this.state.stickers.concat({ url: url }) })
        this.saveSticker(this.props.sender, url)
      })
    }
  }

  saveSticker = (owner: string, url: string) => {
    db.transaction('rw', db.sticker, async () => {
      await db.sticker.add({ owner: owner, name: moment().format('x'), url: url })
    }).catch(error => {
      notification['error']({
        message: 'IndexedDB',
        description: 'failed to save sticker: '.concat(error.message)
      })
    })
  }

  componentDidMount(): void {
    this.loadStickers(this.props.sender)
  }

  render() {
    return <div className='sticker-card'>
      <div>
        <Switch checkedChildren='del' onClick={this.switchRemove} />
        <Input placeholder='input image url to add sticker' allowClear disabled={this.state.allowRemove} ref={this.urlInput} />
        <Tooltip title='add sticker'>
          <Button shape='circle' icon={<PlusOutlined />} disabled={this.state.allowRemove} onClick={this.addSticker} />
        </Tooltip>
      </div >
      <Card>
        {this.state.stickers.map((stickProps, index) => {
          return <StickerGrid
            key={index}
            name={String(index)}
            url={stickProps.url}
            handleClick={() => this.handleStickerClick(index, stickProps.url)} />
        })}
      </Card>
    </div>
  }
}