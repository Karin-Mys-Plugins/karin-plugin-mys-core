import { DefaultLayoutComponent, React } from '@/exports/render'

export interface ShowBindDeviceProps {

}

/**
 * 显示设备绑定信息的组件（占位符）- 使用 Tailwind CSS
 */
export const ShowBindDeviceComponent: React.FC<ShowBindDeviceProps> = () => {
  return (
    <DefaultLayoutComponent bg='bg-[#f6f0e6]' width='w-[600px]'>
      <div className='w-full px-[18px] pb-9 pt-5'>
        <div className='rounded-lg bg-white p-4 text-center text-[#6b6b6b]'>
          {/* 设备信息将在此处显示 */}
          设备信息功能待实现
        </div>
      </div>
    </DefaultLayoutComponent>
  )
}
