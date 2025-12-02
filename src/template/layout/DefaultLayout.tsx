import React from 'react'
import { Render } from '../render'

export interface DefaultLayoutProps {
  children: React.ReactNode
  bgColor: string
  mysPlugin?:{
    name: string
    version: string
    logoPath: string
  }
}

export const DefaultLayoutComponent: React.FC<DefaultLayoutProps> = ({
  children, bgColor, mysPlugin
}) => {
  const { plugin, karin } = Render

  return (
    <div
      className={`relative flex w-[600px] flex-col pb-10 font-hywh text-black ${bgColor}`}
      id='container'
    >
      {children}

      <div className='absolute bottom-0 left-0 flex w-full items-center justify-center gap-4 px-4 py-2.5 text-sm'>
        {mysPlugin && (
          <>
            <div className='flex items-center gap-2'>
              <img
                src={`${mysPlugin.logoPath}`}
                alt='Mys Plugin Logo'
                className='h-6 w-6 rounde'
              />
              <div className='flex flex-col'>
                <span className='text-[5px] font-bold leading-none text-black'>KARIN-MYS-PLUGIN</span>
                <div className='flex items-baseline gap-0.5'>
                  <span className='font-semibold'>{mysPlugin.name}</span>
                  <strong className='text-xs font-bold text-[#f2c06f]'>v{mysPlugin.version}</strong>
                </div>
              </div>
            </div>

            <div className='h-8 w-px bg-gray-600' />
          </>
        )}

        <div className='flex items-center gap-2'>
          <img
            src={`${plugin.resources.default}/image/mys-core-logo.png`}
            alt='MysCore Logo'
            className='h-6 w-6 rounded-sm'
          />
          <div className='flex flex-col'>
            <span className='text-[5px] font-bold leading-none text-black'>KARIN-PLUGIN</span>
            <div className='flex items-baseline gap-0.5'>
              <span className='font-semibold'>MysCore</span>
              <strong className='text-xs font-bold text-[#f2c06f]'>v{plugin.version}</strong>
            </div>
          </div>
        </div>

        <div className='h-8 w-px bg-gray-600' />

        <div className='flex items-center gap-2'>
          <img
            src={`${plugin.resources.default}/image/frame-logo.png`}
            alt='Karin Logo'
            className='h-6 w-6 rounded-sm'
          />
          <div className='flex flex-col'>
            <span className='text-[5px] font-bold leading-none text-black'>IS DRIVEN BY</span>
            <div className='flex items-baseline gap-1.5'>
              <span className='font-semibold'>Karin</span>
              <strong className='text-[10px] font-bold text-[#f2c06f]'>v{karin.version}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
