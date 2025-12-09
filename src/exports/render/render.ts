import { dir } from '@/dir'
import karin, { absPath, config, existToMkdirSync, karinPathBase, Options } from 'node-karin'
import fs from 'node:fs'
import path from 'node:path'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { common } from '../utils'

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

export interface DefaultRenderPluginOptionsType {
  name: string
  version: string
  resources: {
    /** @description 插件内部资源 */
    default: string
    /** @description 插件外部资源 @karinjs/karin-plugin-xxx/resources */
    download: string
  }
}

export class ReactRender<P extends Record<string, any>, K extends string> {
  #renderCfg: RenderCfg
  #pluginOptions: Omit<P, 'name' | 'version' | 'resources'>

  constructor (cfg: RenderCfg, pluginOptions: Omit<P, 'name' | 'version' | 'resources'> = {} as any) {
    this.#renderCfg = cfg
    this.#pluginOptions = pluginOptions
  }

  get plugin (): Omit<P, 'name' | 'version' | 'resources'> & DefaultRenderPluginOptionsType {
    return {
      ...this.#pluginOptions,
      name: this.#renderCfg.name,
      version: this.#renderCfg.version,
      resources: {
        default: absPath(path.join(this.#renderCfg.pluginDir, 'resources')),
        download: absPath(this.#renderCfg.ResourcesDir),
      },
    }
  }

  get karin () {
    return {
      version: config.pkg().version
    }
  }

  async template<C extends React.ComponentType<any>> (
    template: K, component: C, props: React.ComponentProps<C>,
    options: { type?: 'png' | 'jpeg' | 'webp', plugin?: Record<string, any>, render?: Omit<Options, 'file' | 'data'> } = {}
  ) {
    const element = React.createElement(component, props)

    // 渲染 React 组件为 HTML 字符串
    const appHtml = renderToString(element)

    const coreCssPath = absPath(path.join(dir.pluginDir, 'resources', 'styles', `${dir.name}.css`))

    const cssPath = this.#renderCfg.name !== dir.name
      ? absPath(path.join(this.plugin.resources.default, 'styles', `${this.#renderCfg.name}.css`))
      : ''

    const Html = `
    <!DOCTYPE html>
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="${coreCssPath}">
        <link rel="stylesheet" href="${cssPath}">
      </head>
      <body>
        ${appHtml}
      </body>
    </html>
    `

    const saveDir = path.join(karinPathBase, 'temp', 'html', this.#renderCfg.name, template)
    existToMkdirSync(saveDir)

    const savePath = path.join(saveDir, `${options.render?.name || template}-${common.randomString(8, 'Lower')}.html`)
    fs.writeFileSync(savePath, Html, 'utf-8')

    const image = await karin.render({
      type: options.type || 'jpeg',
      omitBackground: options.type === 'png',
      selector: 'container',
      setViewport: {
        deviceScaleFactor: 3
      },
      ...(options.render || {}),

      file: absPath(savePath)
    })

    if (!image) return null

    return 'base64://' + image
  }
}
