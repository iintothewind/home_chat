import React from 'react'
import { Button, Table } from 'antd'
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
      render: (_text: string, record: MarkDownSyntax) => (<Button shape="circle" icon={<CopyOutlined />} />)
    }
  ]

  const markdownDataSource: MarkDownSyntax[] = [
    {
      key: 1,
      syntax: 'plain text',
      output: 'plain text'
    },
    {
      key: 2,
      syntax: '![image tip](url)',
      output: 'insert image'
    },
    {
      key: 3,
      syntax: '[link text](url)',
      output: 'insert link'
    },
    {
      key: 4,
      syntax: '``` code lines ```',
      output: 'insert code'
    },
    {
      key: 5,
      syntax: '# heading 1',
      output: 'heading 1'
    },
    {
      key: 6,
      syntax: '## heading 2',
      output: 'heading 2'
    },
    {
      key: 7,
      syntax: '**bold**',
      output: 'bold text'
    },
    {
      key: 8,
      syntax: '- list text',
      output: 'add list'
    },
    {
      key: 9,
      syntax: '* list text',
      output: 'add list'
    },
    {
      key: 10,
      syntax: 'add \\ before `,*,-,{},[],(),#,+,-,.,~,|',
      output: 'excape character'
    },
  ]
  return <Table columns={markdownColumns} dataSource={markdownDataSource} />;
}