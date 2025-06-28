import { defineConfig } from 'node-karin'
import { dir } from './dir'

export default defineConfig({
  /** 插件信息配置 */
  info: {
    id: dir.name,
    name: dir.name,
    version: dir.version,
  },
  /** 动态渲染的组件 */
  components: () => [
    // 在这里面 添加各种子组件
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
