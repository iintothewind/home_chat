import React from 'react'
import { Button, Tooltip, Table } from 'antd'
import { CopyOutlined } from '@ant-design/icons'

interface MarkDownSyntax {
  key: number
  syntax: string
  operation: string
}


interface Props {
  updateMarkdown: (operation: string) => void
}

export default function MarkDownTable(props: Props) {
  const onButtonClick = (record: MarkDownSyntax) => props.updateMarkdown(record.operation)
  const markdownColumns = [
    {
      title: 'syntax',
      dataIndex: 'syntax',
      key: 'syntax'
    },
    {
      title: 'operation',
      dataIndex: 'operation',
      key: 'operation',
    },
    {
      title: 'action',
      dataIndex: 'action',
      key: 'action',
      render: (_text: string, record: MarkDownSyntax) => (
        <Tooltip title='apply'>
          <Button shape='circle' icon={<CopyOutlined />} onClick={() => onButtonClick(record)} />
        </Tooltip>
      )
    }
  ]

  const markdownDataSource: MarkDownSyntax[] = [
    {
      key: 0,
      syntax: 'switch between plain text and markdown',
      operation: 'mode change'
    },
    {
      key: 1,
      syntax: '![image tooltip](url)',
      operation: 'insert image'
    },
    {
      key: 2,
      syntax: '[link text](url)',
      operation: 'insert link'
    },
    {
      key: 3,
      syntax: '``` code lines ```',
      operation: 'insert code'
    },
    {
      key: 4,
      syntax: '**bold**',
      operation: 'bold text'
    },
    {
      key: 5,
      syntax: 'add \\ before `,*,-,{},[],(),#,+,-,.,~,|',
      operation: 'escape characters'
    },
  ]
  return <Table columns={markdownColumns} dataSource={markdownDataSource} />;
}