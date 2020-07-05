import React from 'react'
import { Tooltip, Card, Input, Button, Switch, notification, message } from 'antd'
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
  'https://i.loli.net/2020/07/04/oDPeR9zT6IF3YXN.png',
  'https://i.loli.net/2020/07/04/jAlqDEIrQxa5NG1.png',
  'https://i.loli.net/2020/07/04/hnrQltb8dLPVXNj.png',
  'https://i.loli.net/2020/07/04/QwlXunsSiCELJyp.png',
  'https://i.loli.net/2020/07/04/xr8oLYWCgOGidSc.png',
  'https://i.loli.net/2020/07/04/OsoutpAxXi3RHLF.png',
  'https://i.loli.net/2020/07/04/fxPLbWNZG1yUVeI.png',
  'https://i.loli.net/2020/07/04/JzHAyxKsM3T8kXl.png',
  'https://i.loli.net/2020/07/04/YOdBPLCxn46Tgqh.png',
  'https://i.loli.net/2020/07/04/IgQviSmuDWYZ6R8.png',
  'https://i.loli.net/2020/07/04/QZwmFVujTi51pDq.png',
  'https://i.loli.net/2020/07/04/oOlthXgaUebIYSx.png',
  'https://i.loli.net/2020/07/04/gjOo95HnEuBUmb3.png',
  'https://i.loli.net/2020/07/04/wrFxtyNZ76WOjSk.png',
  'https://i.loli.net/2020/07/04/4g9QVWtYlhdoHjk.png',
  'https://i.loli.net/2020/07/04/hVDq9Ac2GNipzYf.png',
  'https://i.loli.net/2020/07/04/2ORkQ3BhvF1pEof.png',
  'https://i.loli.net/2020/07/04/3E8vGZxbQYVkTq5.png',
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
          message.warning(`name is empty or exceeded length limit: ${cfg.stickerNameMaxLength}`)
        } else if (!imageUrlRegex.test(snd)) {
          message.warning(`input url is invalid`)
        } else {
          return { name: fst, url: snd }
        }
      } else if (imageUrlRegex.test(input)) {
        const name = input.substr(input.lastIndexOf('/') + 1)
        return { name: name, url: input }
      } else {
        message.warning(`input url is invalid`)
      }
    }
  }

  addSticker = () => {
    const parsedInput = this.parseInput(this.urlInput.current?.state.value)
    if (parsedInput) {
      if (this.state.stickers.length > cfg.maxSticker) {
        message.warning(`stickers exceeded max allowed : ${cfg.maxSticker}`)
      } else if (this.state.stickers.find(sticker => sticker.url === parsedInput.url)) {
        message.warning('this sticker has already been added')
      } else if (parsedInput.url) {
        const sticker: Sticker = { name: parsedInput.name, url: parsedInput.url }
        this.urlInput.current?.setState({ value: '' })
        this.setState({ stickers: this.state.stickers.concat(sticker) })
        this.saveSticker(this.props.sender, sticker)
        message.success(`sticker ${sticker.name} has been added`)
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