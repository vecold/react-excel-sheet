import { CloseOutlined, DownOutlined, UpOutlined } from '@ant-design/icons'
import { Divider, Input, InputRef } from 'antd'
import { CSSProperties, useEffect, useRef } from 'react'

interface SearchInputProps {
    open?: boolean
    style?: Partial<CSSProperties>;
    value?: string
    current?: number
    total?: number
    calledCount?: number
    goNext?: () => void
    goLast?: () => void
    onClose?: () => void
    onChange?: (value: string) => void
}



export const SearchInput: React.FC<SearchInputProps> = (props) => {
    const inputRef = useRef<InputRef | null>(null)
    const { current = 0, total = 0, value, onChange, open, onClose, goLast, goNext, calledCount = 0, style } = props

    useEffect(() => {
        if (calledCount > 0 && inputRef.current) {
            inputRef.current.focus()
        }
    }, [calledCount])

    if (!open) {
        return null
    }

    return <div className='harvest-search-text' style={style}>
        <Input
            ref={inputRef}
            placeholder='查找'
            autoFocus
            style={{ height: 40 }}
            value={value}
            onChange={(e) =>
                onChange && onChange(e.target.value)
            }
            onPressEnter={(e) => {
                if (e.shiftKey) goLast && goLast()
                else goNext && goNext()
                setTimeout(() => {
                    inputRef.current?.focus()
                }, 100)
            }}
            suffix={
                <span className="ant-input-suffix">
                    <span className="ant-input-show-count-suffix">{!total ? 0 : ((current || 0) + 1)}/{total || 0}</span>
                    <Divider type='vertical' />
                    <span className='search-text-suffix'>
                        <UpOutlined className={!total ? 'search-text-disabled' : ''} onClick={() => goLast && goLast()} />
                        <DownOutlined className={!total ? 'search-text-disabled' : ''} onClick={() => goNext && goNext()} />
                        <CloseOutlined onClick={() => onClose && onClose()} />
                    </span>
                </span>
            }
        />
    </div >

}