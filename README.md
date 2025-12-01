<h1 align="center"><font color="#3f7dd1">karin-plugin-mys-core</font></h1>

## 📖 目录

- [前言](#前言)
- [快速安装](#快速安装)
- [游戏模块](#游戏模块)
- [API 文档](#api-文档)
  - [配置模块 (config)](#配置模块-config)
  - [数据库模块 (database)](#数据库模块-database)
  - [米游社模块 (mys)](#米游社模块-mys)
  - [工具模块 (utils)](#工具模块-utils)
- [贡献与反馈](#贡献与反馈)

---

## 快速安装

- 本插件已加入插件商店，可在插件商店中一键下载安装。

---

## 游戏模块
> [!TIP]
> 本插件并不直接提供完整的游戏功能

- 自行编写请查看[karin-plugin-mys-template](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-template)

---

## API 文档

### 配置模块 (config)

配置模块提供了强大的配置文件管理功能，包括配置类和增强数组类。

#### 导入方式

```typescript
import { Config } from 'karin-plugin-mys-core/config'
```

#### Config 类

用于管理 JSON 配置文件，支持自动补全、类型安全和实时监听。

**构造函数**

```typescript
const config = new Config<ConfigType>(
  'plugin-name:config-name',  // 配置名称
  '/path/to/config.json',      // 配置文件路径
  defaultConfig,               // 默认配置对象
  defineConfig                 // 配置定义对象
)
```

**主要方法**

```typescript
// 获取配置值
const value = config.get<T>('key.path')

// 设置配置值
config.set<T>('key.path', value, save?: boolean)

// 获取数组配置（返回 EnhancedArray）
const arr = config.getArray<T>('key.path')

// 监听配置变化（文件修改时触发）
config.watch((self, oldData, newData) => {
  console.log('配置已更新')
  console.log('旧配置:', oldData)
  console.log('新配置:', newData)
  
  // 可以在这里处理配置变化后的逻辑
  if (oldData.enable !== newData.enable) {
    console.log('功能启用状态已改变')
  }
})

// 手动保存配置
config.save()

// 重新加载配置
config.loadConfig()
```

**示例**

```typescript
interface MyConfig {
  enable: boolean
  users: string[]
  settings: {
    timeout: number
  }
}

const config = new Config<MyConfig>(
  'my-plugin:config',
  './config/config.json',
  {
    enable: true,
    users: [],
    settings: { timeout: 5000 }
  },
  {}
)

// 获取配置
const isEnabled = config.get<boolean>('enable')

// 设置配置
config.set('settings.timeout', 10000, true)

// 获取数组
const users = config.getArray<string>('users')
users.add('user1', true, true)

// 监听配置文件变化
config.watch((self, oldData, newData) => {
  console.log('配置文件已被外部修改')
  
  // 检查特定字段的变化
  if (oldData.enable !== newData.enable) {
    console.log(`功能状态变更: ${oldData.enable} -> ${newData.enable}`)
  }
  
  if (oldData.settings.timeout !== newData.settings.timeout) {
    console.log(`超时时间变更: ${oldData.settings.timeout}ms -> ${newData.settings.timeout}ms`)
  }
})
```

#### EnhancedArray 类

扩展的数组类，提供了更多便捷的操作方法。

**主要方法**

```typescript
// 检查元素是否存在
arr.has(element)

// 添加单个元素
arr.add(element, isEqual: boolean, save: boolean)

// 批量添加元素
arr.addSome(elements, isEqual: boolean, save: boolean)

// 删除元素
arr.remove(predicate, save: boolean)
arr.remove(index, save: boolean, true)  // 按索引删除

// 批量删除元素
arr.removeSome(elements, save: boolean)
```

**示例**

```typescript
const users = config.getArray<string>('users')

// 添加元素（去重）
users.add('user1', true, true)

// 批量添加
users.addSome(['user2', 'user3'], true, true)

// 删除元素
users.remove('user1', true)

// 按条件删除
users.remove(user => user.startsWith('test'), true)

// 按索引删除
users.remove(0, true, true)
```

---

### 数据库模块 (database)

数据库模块提供了统一的数据库访问接口，支持 SQLite 等多种数据库。

#### 导入方式

```typescript
import { Database } from 'karin-plugin-mys-core/database'
```

#### Database 对象

**主要方法**

```typescript
// 获取数据库实例
const db = Database.get<TableType, DatabaseType>()

// 设置默认数据库
Database.default(Dialect.Sqlite)

// 添加新的数据库支持
await Database.Add(DatabaseFn, StaticClass)

// 获取数据库列表
const dbList = Database.details

// 定义列
Database.Column(type, options)
Database.PkColumn(type, options)  // 主键列
Database.ArrayColumn(type)
Database.JsonColumn(type)
```

**数据库操作**

```typescript
// 初始化表
await db.init(dataDir, modelName, modelSchema, DatabaseType.Db)

// 查找记录（主键）
const record = await db.findByPk(pk, create?: boolean)

// 查找所有记录
const records = await db.findAllByPks(pks)

// 查找符合条件的记录
const results = await db.findAll(where, limit?)

// 保存记录
await record.save({ key: value })

// 删除记录
await record.destroy()
```

**示例**

```typescript
import { Database, DatabaseType } from 'karin-plugin-mys-core/database'

// 定义表结构
const schema = {
  userId: Database.PkColumn('STRING'),
  nickname: Database.Column('STRING', { allowNull: false }),
  level: Database.Column('INTEGER', { defaultValue: 1 }),
  data: Database.JsonColumn('TEXT')
}

// 初始化数据库
const db = Database.get<UserType, DatabaseType.Db>()
await db.init('./data', 'users', schema, DatabaseType.Db)

// 操作数据
const user = await db.findByPk('123456', true)
await user.save({ level: 10 })
```

**内置表**

```typescript
import { 
  MysUserInfoDB,      // 用户信息表
  MysAccountInfoDB,   // 账号信息表
  MysDeviceInfoDB     // 设备信息表
} from 'karin-plugin-mys-core/database'

// 使用内置表
const userDB = await MysUserInfoDB()
const user = await userDB.findByPk(userId, true)
```

---

### 米游社模块 (mys)

米游社模块提供了完整的米游社 API 调用和用户管理功能。

#### 导入方式

```typescript
import { 
  UserInfo,           // 用户信息类
  MysGame,            // 游戏注册管理
  DefineApi,          // API 定义类
  MysApp,             // 米游社应用配置
  MysHosts            // 米游社主机地址
} from 'karin-plugin-mys-core/mys'
```

#### UserInfo 类

管理用户的米游社账号信息。

**创建用户信息**

```typescript
// 创建用户信息实例
const userInfo = await UserInfo.create(userId, initAll?: boolean)

// 刷新 UID
const result = await UserInfo.refreshUid({
  userId: 'xxx',
  cookie: 'xxx',
  ltuid: 'xxx',
  type: MysAccountType.cn
}, UidPermission.Allow)
```

**属性和方法**

```typescript
// 获取 ltuid 列表
const ltuids = userInfo.ltuids

// 获取 stuid 列表
const stuids = userInfo.stuids

// 获取账号信息列表
const accounts = userInfo.LtuidInfoList

// 获取特定账号信息
const account = userInfo.getLtuidInfo(ltuid)

// 获取设备信息列表
const devices = await userInfo.getDeviceInfoList()

// 保存用户信息
await userInfo.saveUserInfo({ key: value })

// 保存米游社账号信息
await userInfo.saveMysAccountInfo(ltuid, { cookie: 'xxx' })

// 刷新用户信息
await userInfo.refresh()
```

#### MysGame 游戏管理

注册和管理游戏模块。

**注册游戏**

使用 `RegisterGameBase` 类注册新游戏：

```typescript
import { MysGame, RegisterGameBase } from 'karin-plugin-mys-core/mys'
import { GameUserInfo } from './GameUserInfo'  // 你的游戏用户信息类

// 创建游戏注册对象
const MyGame = new RegisterGameBase(
  'game_key',              // 游戏标识（如：gs, sr, zzz）
  '原神',                  // 游戏名称
  /^#?(原神|gs)/i,        // 指令前缀匹配正则
  GameUserInfo,            // 游戏用户信息类
  (info) => {              // UID 刷新函数
    return info.map(item => item.game_uid)
  }
)

// 注册到 MysGame
MysGame.RegisterGame(MyGame)
```

**游戏匹配**

```typescript
// 通过指令前缀匹配游戏
const game = MysGame.match('#原神角色')
if (game) {
  console.log('匹配到游戏:', game.name)
  console.log('游戏标识:', game.game)
  console.log('列键名:', game.columnKey)  // 'gs-uids'
}
```

**遍历游戏**

```typescript
// 遍历所有已注册的游戏
await MysGame.forEachGame(async (game) => {
  console.log(`游戏: ${game.name}`)
  console.log(`标识: ${game.game}`)
  
  // 如果需要中断遍历，返回 'break'
  if (someCondition) {
    return 'break'
  }
})

// 获取已注册游戏数量
console.log(`已注册 ${MysGame.num} 个游戏`)
```

**完整示例**

```typescript
import { 
  MysGame, 
  RegisterGameBase, 
  GameUserInfoBase 
} from 'karin-plugin-mys-core/mys'

// 1. 定义游戏用户信息类（继承自 GameUserInfoBase）
class GenshinUserInfo extends GameUserInfoBase<GenshinUserInfoTableType> {
  static async create(userId: string) {
    // 实现创建逻辑
    const userInfo = new GenshinUserInfo(userId)
    await userInfo.refresh()
    return userInfo
  }
  
  async refresh() {
    // 实现刷新逻辑
    return this
  }
}

// 2. 创建并注册游戏
const Genshin = new RegisterGameBase(
  'gs',                    // 游戏标识
  '原神',                  // 游戏名称
  /^#?(原神|gs|ys)/i,     // 匹配 #原神 #gs #ys
  GenshinUserInfo,         // 用户信息类
  (roleList) => {          // UID 提取函数
    return roleList
      .filter(role => role.game_biz === 'hk4e_cn')
      .map(role => role.game_uid)
  }
)

MysGame.RegisterGame(Genshin)

// 3. 使用游戏
const game = MysGame.match('#原神角色')
if (game) {
  // 创建用户信息
  const userInfo = await game.UserInfo.create(userId)
  
  // 获取主 UID
  console.log('主 UID:', userInfo.main_uid)
  
  // 获取所有绑定的 UID
  console.log('绑定 UID:', userInfo.bind_uids)
  
  // 获取 UID 信息
  const uidInfo = userInfo.getUIDInfo(uid)
}
```


#### DefineApi API 定义

定义和调用米游社 API。

```typescript
// 定义 API
const myApi = new DefineApi<ResponseType, RequestType>(
  (self, data) => ({
    Method: 'POST',
    Url: new URL('https://api.example.com/endpoint'),
    Body: data,
    HeaderFn: self.DefaultHeaders
  })
)

// 调用 API
const response = await myApi.request({
  ltuid: 'xxx',
  cookie: 'xxx',
  type: MysAccountType.cn,
  // 其他请求参数...
})
```

**内置 API**

```typescript
import {
  fetchQRcode,                    // 获取二维码
  queryQRcode,                    // 查询二维码状态
  getTokenByGameToken,            // 通过游戏 Token 获取 Token
  getCookieTokenBySToken,         // 通过 SToken 获取 CookieToken
  getUserGameRolesByCookie        // 获取用户游戏角色
} from 'karin-plugin-mys-core/mys'
```

#### 配置常量

```typescript
// 米游社应用配置
MysApp.version  // { cn: '2.70.1', os: '1.5.0' }
MysApp.appId    // 游戏 ID
MysApp.salt     // 签名盐值

// 米游社主机地址
MysHosts.bbs      // 社区 API
MysHosts.web      // Web API
MysHosts.record   // 记录 API
MysHosts.hk4e     // 原神 API
// 更多主机地址...
```

---

### 工具模块 (utils)

工具模块提供了常用的工具函数和渲染功能。

#### 导入方式

```typescript
import { common, RenderTemplate } from 'karin-plugin-mys-core/utils'
```

#### common 工具函数

```typescript
// 生成随机字符串
const str = common.randomString(10, 'All')  // 'Lower' | 'Upper' | 'All'

// 生成设备 GUID
const guid = common.getDeviceGuid()

// 字符串转对象
const obj = common.StrToObj<{ key: string }>('key=value&foo=bar', '&')

// 对象转字符串
const str = common.ObjToStr({ key: 'value', foo: 'bar' }, '&')
```

#### RenderTemplate 渲染模板

用于渲染 HTML 模板为图片。

**初始化**

```typescript
const render = new RenderTemplate<'template1' | 'template2'>({
  name: 'plugin-name',
  version: '1.0.0',
  pluginDir: '/path/to/plugin',
  ResourcesDir: '/path/to/resources'
}, {
  // 自定义插件参数
  customKey: 'customValue'
})
```

**渲染模板**

```typescript
// 渲染模板
const image = await render.template(
  'template1',           // 模板名称
  { data: 'value' },     // 渲染数据
  {
    type: 'jpeg',        // 图片格式: 'png' | 'jpeg' | 'webp'
    plugin: {},          // 额外插件参数
    render: {            // 渲染选项
      setViewport: {
        deviceScaleFactor: 2
      }
    }
  }
)

// 返回 base64 格式图片
console.log(image)  // 'base64://...'
```

**模板文件结构**

```
resources/
  template/
    template1/
      index.html
    template2/
      index.html
    layout/
      default.html
```

**模板数据**

模板中可使用以下数据：

```javascript
// 自定义数据
data.yourData

// 插件信息
data.plugin.name      // 插件名称
data.plugin.version   // 插件版本
data.plugin.template  // 当前模板名称
data.plugin.resources // 资源路径
data.plugin.defaultLayout  // 默认布局路径

// Karin 信息
data.karin.version    // Karin 版本
```

**示例**

```typescript
const render = new RenderTemplate<'profile' | 'stats'>({
  name: 'my-plugin',
  version: '1.0.0',
  pluginDir: __dirname,
  ResourcesDir: path.join(__dirname, 'resources')
})

// 渲染用户信息
const img = await render.template('profile', {
  nickname: '玩家昵称',
  level: 60,
  uid: '123456789'
}, {
  type: 'png'
})

// 发送图片
await e.reply(img)
```

---

## 贡献与反馈

- 有任何建议或问题，欢迎在 [Issues](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/issues) 提出。
- 也可加入官方交流群交流经验。
