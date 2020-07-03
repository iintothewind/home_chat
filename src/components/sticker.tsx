import React from 'react'
import { Tooltip, Card, Input, Button, Switch, notification } from 'antd'
import { cfg } from '../util/config';
import { imageUrlRegex, makeImage } from '../util'
import { PlusOutlined } from '@ant-design/icons'
import db, { Sticker } from '../util/db'
import moment from 'moment'
import alu001 from '../resources/alu001.png'
import alu002 from '../resources/alu002.png'
import alu003 from '../resources/alu003.png'
import alu004 from '../resources/alu004.png'
import alu005 from '../resources/alu005.png'
import alu006 from '../resources/alu006.png'
import alu007 from '../resources/alu007.png'
import alu008 from '../resources/alu008.png'
import alu009 from '../resources/alu009.png'
import alu010 from '../resources/alu010.png'
import alu011 from '../resources/alu011.png'
import alu012 from '../resources/alu012.png'
import alu013 from '../resources/alu013.png'
import alu014 from '../resources/alu014.png'
import alu015 from '../resources/alu015.png'
import alu016 from '../resources/alu016.png'
import alu017 from '../resources/alu017.png'
import alu018 from '../resources/alu018.png'

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

const aluFacePaths = [alu001, alu002, alu003, alu004, alu005, alu006, alu007, alu008, alu009,
  alu010, alu011, alu012, alu013, alu014, alu015, alu016, alu017, alu018]

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
      aluFacePaths.forEach(path => {
        const url = `${window.location.origin}${path}`
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