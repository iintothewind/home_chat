import React from 'react'
import { Tooltip, Card } from 'antd'

interface StickerProps {
  name: string
  url: string
}

const Sticker = (props: StickerProps) => {
  return <Card.Grid>
    <Tooltip title={props.name}>
      <img src={props.url} alt={props.name} />
    </Tooltip>
  </Card.Grid>;
}

export default function StickerCard() {

  return <Card>
    <Sticker name='sticker' url='https://sorry.xuty.tk/cache/99af0aafd5091a947adca07b4307859b.gif' />
    <Sticker name='sticker' url='https://sorry.xuty.tk/cache/99af0aafd5091a947adca07b4307859b.gif' />
    <Sticker name='sticker' url='https://sorry.xuty.tk/cache/99af0aafd5091a947adca07b4307859b.gif' />
    <Sticker name='sticker' url='https://sorry.xuty.tk/cache/99af0aafd5091a947adca07b4307859b.gif' />
    <Sticker name='sticker' url='https://sorry.xuty.tk/cache/99af0aafd5091a947adca07b4307859b.gif' />
  </Card>
}