import { dir } from '@/dir'
import { config } from 'node-karin'
import React from 'react'

export interface DefaultLayoutProps {
  children: React.ReactNode
  bgStyle: React.CSSProperties & {
    backgroundColor: React.CSSProperties['backgroundColor']
    width: React.CSSProperties['width']
  }
  mysPlugin?:{
    name: string
    version: string
    logoPath: string
  }
}

export const DefaultLayoutComponent: React.FC<DefaultLayoutProps> = ({
  children, bgStyle, mysPlugin
}) => {
  const karinVersion = config.pkg().version

  return (
    <div
      className='relative flex flex-col pb-10 font-hywh text-black'
      style={bgStyle}
      id='container'
    >
      {children}

      <div className='absolute bottom-0 left-0 flex w-full items-center justify-center gap-4 px-4 py-2.5 text-sm bg-black/20'>
        {mysPlugin && (
          <>
            <div className='flex items-center gap-2'>
              <img
                src={`${mysPlugin.logoPath}`}
                className='h-6 w-6 rounde'
              />
              <div className='flex flex-col'>
                <span className='text-[5px] font-bold leading-none text-black'>KARIN-MYS-PLUGIN</span>
                <div className={`flex ${mysPlugin.version.length > 8 ? 'flex-col' : 'items-baseline gap-0.5'}`}>
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
            src={`${dir.pluginDir}/resources/image/mys-core-logo.webp`}
            className='h-6 w-6 rounded-sm'
          />
          <div className='flex flex-col'>
            <span className='text-[5px] font-bold leading-none text-black'>KARIN-PLUGIN</span>
            <div className={`flex ${dir.version.length > 8 ? 'flex-col' : 'items-baseline gap-0.5'}`}>
              <span className='font-semibold'>MysCore</span>
              <strong className='text-xs font-bold text-[#f2c06f]'>v{dir.version}</strong>
            </div>
          </div>
        </div>

        <div className='h-8 w-px bg-gray-600' />

        <div className='flex items-center gap-2'>
          <img
            src={`${dir.pluginDir}/resources/image/frame-logo.webp`}
            className='h-6 w-6 rounded-sm'
          />
          <div className='flex flex-col'>
            <span className='text-[5px] font-bold leading-none text-black'>IS DRIVEN BY</span>
            <div className={`flex ${karinVersion.length > 8 ? 'flex-col' : 'items-baseline gap-1.5'}`}>
              <span className='font-semibold'>Karin</span>
              <strong className='text-[10px] font-bold text-[#f2c06f]'>v{karinVersion}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
