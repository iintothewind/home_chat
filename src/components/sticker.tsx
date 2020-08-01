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
        <div className='img-box' role='button' tabIndex={0} onKeyPress={() => this.props.handleClick && this.props.handleClick()} onClick={() => this.props.handleClick && this.props.handleClick()} >
          <img src={this.props.url} alt={this.props.name} />
        </div>
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
  { k: 'dodge001', v: 'https://bit-images.bj.bcebos.com/bit-new/file/20200714/8h1u.png' },
  { k: 'alu001', v: 'https://bit-images.bj.bcebos.com/bit-new/file/20200714/kewp.png' },
  { k: 'alu002', v: 'https://bit-images.bj.bcebos.com/bit-new/file/20200714/5rko.png' },
  { k: 'alu003', v: 'https://bit-images.bj.bcebos.com/bit-new/file/20200714/v49s.png' },
  { k: 'alu004', v: 'https://bit-images.bj.bcebos.com/bit-new/file/20200714/zjms.png' },
  { k: 'alu005', v: 'https://bit-images.bj.bcebos.com/bit-new/file/20200714/7px0.png' },
  { k: 'alu006', v: 'https://bit-images.bj.bcebos.com/bit-new/file/20200714/qpea.png' },
  { k: 'alu007', v: 'https://bit-images.bj.bcebos.com/bit-new/file/20200714/jo58.png' },
  { k: 'alu008', v: 'https://bit-images.bj.bcebos.com/bit-new/file/20200714/xmqb.png' },
  { k: 'alu009', v: 'https://bit-images.bj.bcebos.com/bit-new/file/20200714/g77d.png' },
  { k: 'alu010', v: 'https://bit-images.bj.bcebos.com/bit-new/file/20200714/kolz.png' },
  { k: 'alu011', v: 'https://bit-images.bj.bcebos.com/bit-new/file/20200714/edxt.png' },
  { k: 'alu012', v: 'https://bit-images.bj.bcebos.com/bit-new/file/20200714/l5c3.png' },
  { k: 'alu013', v: 'https://bit-images.bj.bcebos.com/bit-new/file/20200714/jcp7.png' },
  { k: 'alu014', v: 'https://bit-images.bj.bcebos.com/bit-new/file/20200714/jfd2.png' },
  { k: 'alu015', v: 'https://bit-images.bj.bcebos.com/bit-new/file/20200714/w1wx.png' },
  { k: 'alu016', v: 'https://bit-images.bj.bcebos.com/bit-new/file/20200714/69j4.png' },
  { k: 'alu017', v: 'https://bit-images.bj.bcebos.com/bit-new/file/20200714/tovo.png' },
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