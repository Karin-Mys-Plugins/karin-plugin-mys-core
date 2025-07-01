import { Cfg } from '@/utils'
import { components, defineConfig } from 'node-karin'
import { dir } from './dir'

export default defineConfig({
  /** 插件信息配置 */
  info: {
    id: dir.name,
    name: 'Mihoyo',
    version: dir.version,
    description: dir.pkg.description,
    author: [
      {
        name: dir.pkg.author,
        avatar: 'https://github.com/babanbang.png'
      }
    ]
  },
  /** 动态渲染的组件 */
  components: () => [
    // 基本调用方法
    components.accordion.create('accordion-device-key', {
      label: '默认设备信息',
      children: [
        components.accordion.createItem('accordion-device-item-key', {
          title: '默认设备信息',
          subtitle: '如果不知道这是什么请勿修改',
          children: Object.keys(Cfg.getDef('device'))
            .map(key => components.input.string(`device-${key}`, {
              defaultValue: Cfg.get<string>(`device.${key}`),
              label: key,
              isRequired: true,
            }))
        }),
      ],
    })
  ],

  /** 前端点击保存之后调用的方法 */
  save: (config: any) => {
    console.log('保存的配置:', config)
    // 在这里处理保存逻辑
    return {
      success: true,
      message: '保存成功',
    }
  },
})
