export * from './ShowBindAccount'
export * from './ShowBindDevice'

import { dir } from '@/dir'
import { ReactRender } from '@/exports/render'

export const Render = new ReactRender<{}, string>(dir, {})
