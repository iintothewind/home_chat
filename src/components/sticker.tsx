import React from 'react'
import { Tooltip, Card, Input, Button, Switch, notification, message } from 'antd'
import { cfg } from '../util/config';
import { imageUrlRegex, makeImage } from '../util'
import { PlusOutlined } from '@ant-design/icons'
import db, { Sticker } from '../util/db'
import moment from 'moment'
import dodge001 from '../resources/stickers/dodge001.png'
import alu001 from '../resources/stickers/alu001.png'
import alu002 from '../resources/stickers/alu002.png'
import alu003 from '../resources/stickers/alu003.png'
import alu004 from '../resources/stickers/alu004.png'
import alu005 from '../resources/stickers/alu005.png'
import alu006 from '../resources/stickers/alu006.png'
import alu007 from '../resources/stickers/alu007.png'
import alu008 from '../resources/stickers/alu008.png'
import alu009 from '../resources/stickers/alu009.png'
import alu010 from '../resources/stickers/alu010.png'
import alu011 from '../resources/stickers/alu011.png'
import alu012 from '../resources/stickers/alu012.png'
import alu013 from '../resources/stickers/alu013.png'
import alu014 from '../resources/stickers/alu014.png'
import alu015 from '../resources/stickers/alu015.png'
import alu016 from '../resources/stickers/alu016.png'
import alu017 from '../resources/stickers/alu017.png'

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

const stickerIcons: { k: string, v: string }[] = [
  { k: 'dodge001', v: dodge001 },
  { k: 'alu001', v: alu001 },
  { k: 'alu002', v: alu002 },
  { k: 'alu003', v: alu003 },
  { k: 'alu004', v: alu004 },
  { k: 'alu005', v: alu005 },
  { k: 'alu006', v: alu006 },
  { k: 'alu007', v: alu007 },
  { k: 'alu008', v: alu008 },
  { k: 'alu009', v: alu009 },
  { k: 'alu010', v: alu010 },
  { k: 'alu011', v: alu011 },
  { k: 'alu012', v: alu012 },
  { k: 'alu013', v: alu013 },
  { k: 'alu014', v: alu014 },
  { k: 'alu015', v: alu015 },
  { k: 'alu016', v: alu016 },
  { k: 'alu017', v: alu017 },
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
      if (input.indexOf(' : ') > 0) {
        const [fst, snd] = input.split(' : ')
        if (fst.length < 1 || fst.length > cfg.stickerNameMaxLength) {
          void message.warning(`name is empty or exceeded length limit: ${cfg.stickerNameMaxLength}`)
        } else if (!imageUrlRegex.test(snd)) {
          void message.warning(`input url is invalid`)
        } else {
          return { name: fst, url: snd }
        }
      } else if (imageUrlRegex.test(input)) {
        const name = input.substr(input.lastIndexOf('/') + 1)
        return { name: name, url: input }
      } else {
        void message.warning(`input url is invalid`)
      }
    }
  }

  addSticker = () => {
    const parsedInput = this.parseInput(this.urlInput.current?.state.value)
    if (parsedInput) {
      if (this.state.stickers.length > cfg.maxSticker) {
        void message.warning(`stickers exceeded max allowed : ${cfg.maxSticker}`)
      } else if (this.state.stickers.find(sticker => sticker.url === parsedInput.url)) {
        void message.warning('this sticker has already been added')
      } else if (parsedInput.url) {
        const sticker: Sticker = { name: parsedInput.name, url: parsedInput.url }
        this.urlInput.current?.setState({ value: '' })
        this.setState({ stickers: this.state.stickers.concat(sticker) })
        this.saveSticker(this.props.sender, sticker)
        void message.success(`sticker ${sticker.name || ''} has been added`)
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
          description: 'failed to remove sticker: '.concat(error)
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
        description: 'failed to load stickers: '.concat(error)
      })
    })
  }

  loadDefaultStickers = () => {
    if (Array.isArray(this.state.stickers) && this.state.stickers.length <= 0) {
      stickerIcons.forEach(icon => {
        const sticker: Sticker = { name: icon.k, url: icon.v }
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
        description: 'failed to save sticker: '.concat(error)
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