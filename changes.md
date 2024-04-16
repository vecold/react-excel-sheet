### 为什么要重写

#### 存在问题

1、表格选择逻辑与虚拟列表的冲突
2、表格的刷新机制： setRefresh（在多人开发的时候不便维护）
3、回调地狱
4、无法从 jll-portal 中剥离，有些地方与业务字段耦合

#### 后果

1、新增功能难度大
2、修改容易出 bug
3、不利于业务代码优化和重构

### 重写后的表格

#### 优点

1、维护性
2、扩展性
3、新的功能

#### 新的 API

1、TableProps

| 表头                                         | 表头                    | 表头 |
| -------------------------------------------- | ----------------------- | ---- |
| className                                    | container 类名 ｜ 无 ｜ |
| ｜ sheetInstance ｜ sheet 对外暴露的一些 API | 选中行，参与回滚等 ｜   |

｜ columns ｜ 表格列 ｜ 无 ，必填 ｜
| dataSource | 数据源 ｜ 无，必填 ｜
｜ virtualized ｜虚拟列表 ｜ false |
| draggable | 列宽可调整 ｜ false |
｜ rowClassName ｜ 行类名 ｜ 无 ｜
｜ rowKey ｜ 唯一标识字段 ｜ key , id |
| scroll | 同 antd table | {y:Math.min(400,row \* 40)} |
| rowSelection | 选中行的配置 ｜ 尚未完全实现 ｜
｜ groupConfig ｜ 表格分组 ｜ 表格内部自动支持，对外配置尚未完全实现 ｜
| onChange ｜ 表格 cell change handler ｜ 无 ｜
| eventHandler | 自定义事件 handler | Record<string,(value:unknown)=>void> |

2、 ColumnProps
