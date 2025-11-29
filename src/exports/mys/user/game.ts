import { BaseUserInfoTableType } from '@/exports/database'
import { RegisterGameBase } from '../types'

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
    for (const Game of this.#games.values()) {
      if (await fn(Game) === 'break') break
    }
  }
}()
