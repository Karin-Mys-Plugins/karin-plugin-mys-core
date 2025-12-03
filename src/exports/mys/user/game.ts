import { BaseUserInfoTableType } from '@/exports/database'
import { BaseltuidInfoType, gameName, GameUserInfoBase, UserGameRoleItemType } from '../types'

export const MysGame = new class MysGame {
  #games = new Map<string, RegisterGameBase<any>>()

  get num () {
    return this.#games.size
  }

  match (prefix: string) {
    if (!prefix || this.#games.size === 0) return undefined

    for (const Game of this.#games.values()) {
      if (Game.prefix.test(prefix)) return Game
    }

    return undefined
  }

  RegisterGame<GameUserInfoTableType extends BaseUserInfoTableType> (Game: RegisterGameBase<GameUserInfoTableType>) {
    this.#games.set(Game.columnKey, Game)
  }

  async forEachGame<GameUserInfoTableType extends BaseUserInfoTableType> (
    fn: (Game: RegisterGameBase<GameUserInfoTableType>) => Promise<void | 'break'>
  ) {
    if (this.num === 0) return

    for (const Game of this.#games.values()) {
      if (await fn(Game) === 'break') break
    }
  }
}()

export class RegisterGameBase<GameUserInfoTableType extends BaseUserInfoTableType> {
  game: string
  columnKey: `${string}-uids`
  /** @description 游戏名称 */
  name: gameName

  /** @description 指令前缀 */
  prefixs: string[]

  refresh: (info: UserGameRoleItemType[], options: { userId: string, cookie: string } & BaseltuidInfoType) => Promise<string[]>

  UserInfo: typeof GameUserInfoBase<GameUserInfoTableType>

  constructor (
    game: string, name: gameName, prefixs: string[], userInfo: typeof GameUserInfoBase<GameUserInfoTableType>,
    refreshFuc: (info: UserGameRoleItemType[], options: { userId: string, cookie: string } & BaseltuidInfoType) => Promise<string[]>
  ) {
    this.game = game
    this.columnKey = `${game}-uids`

    this.name = name
    this.prefixs = prefixs

    this.UserInfo = userInfo

    this.refresh = refreshFuc
  }

  get prefix () {
    return new RegExp(`^(${this.prefixs.join('|')})$`, 'i')
  }
}
