import { CoreCfg, DeviceCfg } from '@/core/config'
import { dir } from '@/dir'
import { components, defineConfig, logger } from 'node-karin'
import lodash from 'node-karin/lodash'
import { MysAccountType } from './exports/database'

const enum AccordionEnum {
  Config = 'accordion-config-key',
  Device = 'accordion-device-key'
}

type ConfigSaveEntry = { githubProxyUrl: string }

const FormatValue = (key: string, value: any) => {
  const { format } = key.match(/=(?<format>.*)$/)?.groups || {}

  switch (format) {
    case 'int':
      return { key: key.replace(/=(.*)$/, '').replace(/-/g, '.'), value: parseInt(value) }
    case 'float':
      return { key: key.replace(/=(.*)$/, '').replace(/-/g, '.'), value: parseFloat(value) }
    default:
      return { key: key.replace(/-/g, '.'), value }
  }
}

export default defineConfig({
  /** 插件信息配置 */
  info: {
    id: dir.name,
    name: 'Mys-Core',
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
    components.accordion.create(AccordionEnum.Config, {
      label: '基础设置',
      children: [
        components.accordion.createItem('accordion-proxy-item-key', {
          title: '代理设置',
          subtitle: '用于下载插件资源或api请求',
          children: [
            components.input.url('proxy-github', {
              label: 'GitHub 代理地址',
              defaultValue: CoreCfg.get('proxy.github'),
            }),
            components.input.url(`proxy-${MysAccountType.os}`, {
              label: 'Hoyolab 米游社 API 代理',
              defaultValue: CoreCfg.get(`proxy.${MysAccountType.os}`),
            })
          ]
        })
      ]
    }),
    components.divider.horizontal('divider-config-end'),

    components.accordion.create(AccordionEnum.Device, {
      label: '米游社设备信息设置',
      children: [
        components.accordion.createItem('accordion-device-item-key', {
          title: '如果不知道这是什么请勿修改',
          subtitle: '-- 默认设备信息 --',
          className: 'ml-4 mr-4',
          children: [
            components.input.number('version=int', {
              defaultValue: DeviceCfg.get('version') + '',
              label: 'androidVersion',
              rules: [
                { max: 15, min: 10 }
              ],
              isRequired: true,
            }),
            components.input.string('name', {
              defaultValue: DeviceCfg.get('name'),
              label: 'deviceName',
              isRequired: true,
            }),
            components.input.string('board', {
              defaultValue: DeviceCfg.get('board'),
              label: 'deviceBoard',
              isRequired: true,
            }),
            components.input.string('model', {
              defaultValue: DeviceCfg.get('model'),
              label: 'deviceModel',
              isRequired: true,
            }),
            components.input.string('product', {
              defaultValue: DeviceCfg.get('product'),
              label: 'deviceProduct',
              isRequired: true,
            }),
            components.input.string('fingerprint', {
              defaultValue: DeviceCfg.get('fingerprint'),
              label: 'deviceFingerprint',
              className: 'w-full',
              isRequired: true,
            }),
          ],
        }),
      ]
    })
  ],
  /** 前端点击保存之后调用的方法 */
  save: (changeConfig: {
    [AccordionEnum.Config]: ConfigSaveEntry[]
  }) => {
    const CfgMap = {
      [AccordionEnum.Config]: CoreCfg,
      [AccordionEnum.Device]: DeviceCfg
    }

    try {
      lodash.forEach(changeConfig, (childrenValue, accordionKey) => {
        switch (accordionKey) {
          case AccordionEnum.Config: {
            childrenValue.forEach(children => {
              lodash.forEach(children, (value, childrenKey) => {
                const { key, value: formatValue } = FormatValue(childrenKey, value)
                CfgMap[accordionKey].set(key as any, formatValue, false)
              })
            })
            break
          }
          case AccordionEnum.Device: {
            childrenValue.forEach(children => {
              lodash.forEach(children, (value, childrenKey) => {
                const { key, value: formatValue } = FormatValue(childrenKey, value)
                CfgMap[accordionKey].set(key as any, formatValue, false)
              })
            })
            break
          }
        }
      })

      Object.values(CfgMap).forEach(cfg => cfg.save())
    } catch (err: any) {
      logger.error(err)

      return {
        success: false, message: '保存失败：' + err.message
      }
    }

    return {
      success: true, message: '保存成功'
    }
  }
})
