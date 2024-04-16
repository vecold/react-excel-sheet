import { MoreOutlined } from "@ant-design/icons";
import { Form, InputNumber, Popover, Button } from "antd";
import React, { useEffect, useRef, useState } from "react";
import './index.less'

const RowPop: React.FC<{ handleBatchAdd?: (count: number) => void }> = (props) => {
  const { handleBatchAdd } = props
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    let interval = setInterval(() => {
      inputRef.current?.focus()
    }, 200)

    return () => {
      clearInterval(interval)
    }
  }, [])

  if (!handleBatchAdd) {
    return null
  }

  return <Form initialValues={{ count: 10 }} onFinish={(values) => {
    handleBatchAdd && handleBatchAdd(values.count)
  }}
  >
    <Form.Item style={{ marginBottom: 0 }} label="行数" name="count">
      <InputNumber style={{ width: 100 }} ref={inputRef} min={1} max={100}
        onClick={(e) => {
          e.stopPropagation()
        }}
      />
    </Form.Item>
  </Form>
}

export const AddButton: React.FC<{ handleAdd?: () => void, handleBatchAdd?: (count: number) => void }> = (props) => {
  const { handleAdd, handleBatchAdd } = props
  const [open, setOpen] = useState(false)


  if (!handleAdd && !handleBatchAdd) {
    return null

  }

  return <Button
    type="dashed"
    style={{ width: '100%', height: 32 }}
    onClick={(e) => {
      handleAdd && handleAdd()
    }}
  >
    + 添加
    {handleBatchAdd && <Popover open={open}
      onOpenChange={setOpen}
      trigger={['click']}
      destroyTooltipOnHide
      overlayClassName="batch-add-pop"
      content={
        <div className="batch-add-pop-content" onClick={(e) => e.stopPropagation()}>
          <RowPop handleBatchAdd={(value: number) => {
            handleBatchAdd && handleBatchAdd(value)
            setOpen(false)
          }} />
        </div>
      }>
      <MoreOutlined style={{ marginLeft: 0 }} onClick={(e) => {
        e.stopPropagation()
      }} />
    </Popover>}
  </Button>

}