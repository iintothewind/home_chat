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
  stickers: Sticker[]
  allowRemove: boolean
  inputUrl?: string
}

const aluFaceUrls = [
  'http://qcx9diakt.bkt.clouddn.com/sticker/alu/alu001.png',
  'http://qcx9diakt.bkt.clouddn.com/sticker/alu/alu002.png',
  'http://qcx9diakt.bkt.clouddn.com/sticker/alu/alu003.png',
  'http://qcx9diakt.bkt.clouddn.com/sticker/alu/alu004.png',
  'http://qcx9diakt.bkt.clouddn.com/sticker/alu/alu005.png',
  'http://qcx9diakt.bkt.clouddn.com/sticker/alu/alu006.png',
  'http://qcx9diakt.bkt.clouddn.com/sticker/alu/alu007.png',
  'http://qcx9diakt.bkt.clouddn.com/sticker/alu/alu008.png',
  'http://qcx9diakt.bkt.clouddn.com/sticker/alu/alu009.png',
  'http://qcx9diakt.bkt.clouddn.com/sticker/alu/alu010.png',
  'http://qcx9diakt.bkt.clouddn.com/sticker/alu/alu011.png',
  'http://qcx9diakt.bkt.clouddn.com/sticker/alu/alu012.png',
  'http://qcx9diakt.bkt.clouddn.com/sticker/alu/alu013.png',
  'http://qcx9diakt.bkt.clouddn.com/sticker/alu/alu014.png',
  'http://qcx9diakt.bkt.clouddn.com/sticker/alu/alu015.png',
  'http://qcx9diakt.bkt.clouddn.com/sticker/alu/alu016.png',
  'http://qcx9diakt.bkt.clouddn.com/sticker/alu/alu017.png',
  'http://qcx9diakt.bkt.clouddn.com/sticker/alu/alu018.png',
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

  parseInput = (input: string) => {
    if (input) {
      if (input.indexOf(' : ')) {
        const [fst, snd] = input.split(' : ')
        if (fst.length > cfg.stickerNameMaxLength) {
          notification['warning']({
            message: 'addSticker',
            description: `lenght of name exceeded limit: ${cfg.stickerNameMaxLength}`
          })
        } else if (!imageUrlRegex.test(snd)) {
          notification['warning']({
            message: 'addSticker',
            description: `input url is invalid`
          })
        } else {
          return { name: fst, url: snd }
        }
      } else if (imageUrlRegex.test(input)) {
        const name = input.substr(input.lastIndexOf('/') + 1)
        return { name: name, url: input }
      } else {
        notification['warning']({
          message: 'addSticker',
          description: `input url is invalid`
        })
      }
    }
  }

  addSticker = () => {
    const parsedInput = this.parseInput(this.urlInput.current?.state.value)
    if (parsedInput) {
      if (this.state.stickers.length > cfg.maxSticker) {
        notification['warning']({
          message: 'addSticker',
          description: `stickers exceeded max allowed : ${cfg.maxSticker}`
        })
      } else if (this.state.stickers.find(sticker => sticker.url === parsedInput.url)) {
        notification['warning']({
          message: 'addSticker',
          description: 'this sticker has already been added'
        })
      } else if (parsedInput.url) {
        const sticker: StickerProps = { name: parsedInput.name, url: parsedInput.url }
        this.setState({ stickers: this.state.stickers.concat(sticker) })
        this.saveSticker(this.props.sender, sticker)
      }
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
        const sticker: Sticker = { name: url.substr(url.lastIndexOf('/') + 1), url: url }
        this.setState({ stickers: this.state.stickers.concat(sticker) })
        this.saveSticker(this.props.sender, sticker)
      })
    }
  }

  saveSticker = (owner: string, sticker: Sticker) => {
    db.transaction('rw', db.sticker, async () => {
      await db.sticker.add({ owner: owner, name: sticker.name || moment().format('x'), url: sticker.url })
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
      <div className='sticker-control-wrapper'>
        <Switch checkedChildren='del' onClick={this.switchRemove} />
        <Input allowClear type='text' placeholder='input name : url' disabled={this.state.allowRemove} ref={this.urlInput} />
        <Tooltip title='add sticker'>
          <Button shape='circle' icon={<PlusOutlined />} disabled={this.state.allowRemove} onClick={this.addSticker} />
        </Tooltip>
      </div>
      <Card>
        {this.state.stickers.map((sticker, index) => {
          return <StickerGrid
            key={index}
            name={sticker.name || String(index)}
            url={sticker.url}
            handleClick={() => this.handleStickerClick(index, sticker.url)} />
        })}
      </Card>
    </div>
  }
}