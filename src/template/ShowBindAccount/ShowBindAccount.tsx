import { DefaultLayoutComponent } from '@/exports/render'
import React from 'react'
import { Render } from '../render'

export interface UidInfo {
  uid: string
  perm: number
}

export interface BindUid {
  gameName: string
  uids: UidInfo[]
}

export interface AccountInfo {
  ltuid: string
  permission: number
  bindUids: BindUid[]
}

export interface User {
  userId: string
  avatar: string
  nickname: string
}

export interface ShowBindAccountProps {
  User: User
  AccountList: AccountInfo[]
}

/**
 * 显示用户绑定账号的组件 - 使用 Tailwind CSS
 */
export const ShowBindAccountComponent: React.FC<ShowBindAccountProps> = ({
  User, AccountList
}) => {
  const plugin = Render.plugin

  return (
    <DefaultLayoutComponent bgColor='bg-[#f6f0e6]'>
      <div className='px-[18px] pb-9 pt-5'>
        {/* 右上角装饰 logo */}
        <div
          className='absolute -top-2.5 right-0 z-[5] h-[72px] w-[150px] bg-contain bg-center bg-no-repeat opacity-50'
          style={{ backgroundImage: `url('${plugin.resources.default}/image/mys-logo.png')` }}
        />

        {/* 用户信息 */}
        <div className='mb-3 flex items-center gap-2.5'>
          <img className='h-10 w-10 flex-none rounded-full object-cover' src={User.avatar} alt='avatar' />
          <span className='min-w-0 overflow-anywhere break-words text-sm text-[#222]'>
            {User.nickname} ({User.userId})
          </span>
        </div>

        {/* 账号列表 */}
        {AccountList && AccountList.length > 0
          ? (
              AccountList.map((account, idx) => (
                <div
                  className='mb-3 flex flex-col gap-1.5 rounded-lg border border-black/[0.06] bg-white p-3 shadow-[0_2px_6px_rgba(0,0,0,0.04)]'
                  key={account.ltuid}
                >
                  {/* 标题栏 */}
                  <div className='relative flex items-center justify-between gap-2'>
                    <span className='flex text-sm font-semibold text-[#3f7dd1]'>
                      MYS UID ({idx + 1})：{account.ltuid}
                    </span>

                    <div className='flex items-center gap-2'>
                      {account.permission >= 1 && (
                        <span className='inline-block rounded-xl bg-gradient-to-b from-[#34bc5b] to-[#2ea94b] px-2 py-1 text-xs font-semibold text-white shadow-[0_1px_0_rgba(0,0,0,0.06)_inset]'>
                          cookie
                        </span>
                      )}
                      {account.permission >= 2 && (
                        <span className='inline-block rounded-xl bg-gradient-to-b from-[#f6d86a] to-[#f1c40f] px-2 py-1 text-xs font-semibold text-black/85'>
                          stoken
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 绑定的游戏 UID */}
                  {account.bindUids.map((bindUid, bindIdx) => (
                    <div
                      className={`flex items-center gap-3 rounded-md px-1 py-1.5 ${bindIdx > 0 ? 'relative pt-3 before:absolute before:left-[5%] before:right-0 before:top-0 before:h-px before:w-[90%] before:rounded-sm before:bg-[#3f7dd1]' : ''}`}
                      key={bindUid.gameName}
                    >
                      {/* 游戏图标 */}
                      <img
                        className='flex w-10 items-center justify-center rounded-[10px]'
                        src={`${plugin.resources.default}/image/launcher-icon/${bindUid.gameName}.png`}
                        alt={bindUid.gameName}
                      />

                      {/* UID 列表 */}
                      <div className='grid flex-auto grid-cols-3 gap-2'>
                        {bindUid.uids.map((info) => (
                          <span
                            key={info.uid}
                            className={`relative flex items-center justify-center overflow-visible break-all rounded-lg bg-black/[0.06] px-2 py-1.5 text-[13px] font-semibold text-[#111] ${
                              info.perm === 4
                                ? 'text-black/60 after:absolute after:left-[8%] after:right-[8%] after:top-1/2 after:h-px after:rounded-sm after:bg-[#d32f2f] after:-translate-y-1/2'
                                : ''
                            }`}
                          >
                            {info.uid}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )
          : (
            <div className='my-3 px-5 py-5 text-center font-semibold text-[#6b6b6b]'>
              暂未绑定账号
            </div>
            )}
      </div>
    </DefaultLayoutComponent>
  )
}
