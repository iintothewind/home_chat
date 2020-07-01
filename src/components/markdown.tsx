import React from 'react'
import { Button, Tooltip, Table } from 'antd'
import { CopyOutlined } from '@ant-design/icons'

interface MarkDownSyntax {
  key: number
  syntax: string
  output: string
}


interface Props {
  updateText: (text: string, markDownEnabled: boolean) => void
}

export default function MarkDownTable(props: Props) {
  const onButtonClick = (record: MarkDownSyntax) => {
    if (record.key > 0) {
      props.updateText(record.output, true)
    } else {
      props.updateText(record.output, false)
    }
  }

  const markdownColumns = [
    {
      title: 'syntax',
      dataIndex: 'syntax',
      key: 'syntax'
    },
    {
      title: 'output',
      dataIndex: 'output',
      key: 'output',
    },
    {
      title: 'action',
      dataIndex: 'action',
      key: 'action',
      render: (_text: string, record: MarkDownSyntax) => (
        <Tooltip title='copy'>
          <Button shape='circle' icon={<CopyOutlined />} onClick={() => onButtonClick(record)} />
        </Tooltip>
      )
    }
  ]

  const markdownDataSource: MarkDownSyntax[] = [
    {
      key: 0,
      syntax: 'plain text',
      output: 'plain text'
    },
    {
      key: 1,
      syntax: '![image tooltip](url)',
      output: 'insert image'
    },
    {
      key: 2,
      syntax: '[link text](url)',
      output: 'insert link'
    },
    {
      key: 3,
      syntax: '``` code lines ```',
      output: 'insert code'
    },
    {
      key: 4,
      syntax: '# heading 1',
      output: 'heading 1'
    },
    {
      key: 5,
      syntax: '## heading 2',
      output: 'heading 2'
    },
    {
      key: 6,
      syntax: '**bold**',
      output: 'bold text'
    },
    {
      key: 7,
      syntax: '- list text',
      output: 'add list'
    },
    {
      key: 8,
      syntax: '* list text',
      output: 'add list'
    },
    {
      key: 9,
      syntax: 'add \\ before `,*,-,{},[],(),#,+,-,.,~,|',
      output: 'excape character'
    },
  ]
  return <Table columns={markdownColumns} dataSource={markdownDataSource} />;
}