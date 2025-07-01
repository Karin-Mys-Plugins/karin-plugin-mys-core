import { ConfigType, CoreCommand, CoreCommandDescription } from '@/types'
import { Cfg, EnhancedArray } from '@/utils'
import { components, defineConfig } from 'node-karin'
import lodash from 'node-karin/lodash'
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
    components.accordion.create('accordion-config-key', {
      label: '基础设置',
      children: [
        components.accordion.createItem('accordion-device-item-key', {
          title: '如果不知道这是什么请勿修改',
          subtitle: '-- 默认设备信息 --',
          className: 'ml-4 mr-4',
          children: [
            components.input.number('device-androidVersion', {
              defaultValue: Cfg.get<string>('device.androidVersion'),
              label: 'androidVersion',
              isRequired: true,
            }),
            components.input.string('device-deviceName', {
              defaultValue: Cfg.get<string>('device.deviceName'),
              label: 'deviceName',
              isRequired: true,
            }),
            components.input.string('device-deviceBoard', {
              defaultValue: Cfg.get<string>('device.deviceBoard'),
              label: 'deviceBoard',
              isRequired: true,
            }),
            components.input.string('device-deviceModel', {
              defaultValue: Cfg.get<string>('device.deviceModel'),
              label: 'deviceModel',
              isRequired: true,
            }),
            components.input.string('device-deviceProduct', {
              defaultValue: Cfg.get<string>('device.deviceProduct'),
              label: 'deviceProduct',
              isRequired: true,
            }),
            components.input.string('device-deviceFingerprint', {
              defaultValue: Cfg.get<string>('device.deviceFingerprint'),
              label: 'deviceFingerprint',
              isRequired: true,
            }),
          ],
        }),
      ],
    }),
    components.divider.horizontal('divider-commands-key'),
    components.accordion.create('accordion-commands-key', {
      label: '触发指令配置（正在开发中暂不生效）',
      children: Object.entries(Cfg.get<ConfigType['commands']>('commands')).map(([key, value]) => {
        const cmdKey = key as CoreCommand

        return components.accordion.createItem(`accordion-command-${key}`, {
          title: CoreCommandDescription[cmdKey],
          subtitle: `默认指令: ${Cfg.getDef<string[]>(`commands.${key}.cmds`).join('、')}`,
          className: 'flex flex-wrap justify-center items-start',
          children: [
            components.input.group(`group-commands-${key}-cmds`, {
              label: '触发指令',
              data: value.cmds,
              template: components.input.string(`template-commands-${key}-cmds`, {
                label: '指令'
              })
            }),
            components.switch.create(`commands-${key}-default`, {
              defaultSelected: value.default,
              label: '强制保留默认指令',
              description: '开启后使用Web配置时无论如何都会保留默认指令',
            }),
            components.switch.create(`commands-${key}-end`, {
              defaultSelected: value.end,
              label: '是否需要结束锚点$',
              description: '一般无需修改，除非你知道自己在做什么',
            }),
            components.switch.create(`commands-${key}-flags`, {
              defaultSelected: value.flags,
              label: '忽略大小写',
            }),
          ],
        })
      })
    }),
  ],

  /** 前端点击保存之后调用的方法 */
  save: (config: any) => {
    const cmdList: { cmds: EnhancedArray<string>, key: string, value: string[] }[] = []

    lodash.forEach(config, (value1, key1) => {
      if (Array.isArray(value1)) {
        value1.forEach((children) => {
          lodash.forEach(children, (value2, key2) => {
            if (/^group-/.test(key2)) {
              cmdList.push({
                cmds: Cfg.get<string>(key2.replace(/^group-/, '').replace(/-/g, '.'), true).clear(),
                key: key2.replace(/^group-/, '').split('-')[1],
                value: value2
              })
            } else {
              Cfg.set(key2.replace(/-/g, '.'), value2, false)
            }
          })
        })
      } else {
        Cfg.set(key1.replace(/-/g, '.'), value1, false)
      }
    })

    cmdList.forEach(({ cmds, key, value }) => {
      value.forEach((cmd) => cmds.add(cmd, true, false))
      if (Cfg.get<boolean>(`commands.${key}.default`, false)) {
        const defCmds = Cfg.getDef<string[]>(`commands.${key}.cmds`)
        defCmds.forEach((defCmd) => cmds.add(defCmd, true, false))
      }
    })

    Cfg.save()

    // 在这里处理保存逻辑
    return {
      success: true,
      message: '保存成功',
    }
  },
})
