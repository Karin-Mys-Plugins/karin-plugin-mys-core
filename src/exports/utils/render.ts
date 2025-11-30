import karin, { config } from 'node-karin'
import path from 'node:path'

export interface RenderCfg {
  /** @description 插件名称 package.json 的 name */
  name: string
  /** @description 插件版本 package.json 的 version */
  version: string
  /** @description 根目录绝对路径 */
  pluginDir: string
  /** @description 插件资源目录 `@karinjs/karin-plugin-xxx/resources` */
  ResourcesDir: string
}

export class RenderTemplate<K extends string> {
  #renderCfg: RenderCfg
  constructor (cfg: RenderCfg) {
    this.#renderCfg = cfg
  }

  /** @description 渲染Html路径为：resources/template/${template}/index.html */
  async template (template: K, rendeDdata: Record<string, any>, options: { type?: 'png' | 'jpeg' | 'webp', plugin?: Record<string, any> } = {}) {
    const img = await karin.render({
      name: `${this.#renderCfg.name}/${template}`,
      data: {
        ...rendeDdata,
        plugin: {
          ...(options.plugin || {}),
          template,
          name: this.#renderCfg.name,
          version: this.#renderCfg.version,
          resources: {
            default: path.join(this.#renderCfg.pluginDir, 'resources').replace(/\\/g, '/'),
            download: this.#renderCfg.ResourcesDir.replace(/\\/g, '/'),
          },
          defaultLayout: path.join(this.#renderCfg.pluginDir, 'resources/template/layout/default.html'),
        },
        karin: {
          version: config.pkg().version
        }
      },

      type: options.type || 'jpeg',
      omitBackground: options.type === 'png',
      selector: 'container',
      file: path.join(this.#renderCfg.pluginDir, `resources/template/${template}/index.html`),
      setViewport: {
        deviceScaleFactor: 2
      }
    })

    if (!img) return null

    return 'base64://' + img
  }
}
