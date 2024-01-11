import { FC } from 'react'

interface Props {
  py: string
}

const LoaderAnimation: FC<Props> = ({ py }) => (
  <div className='flex justify-center gap-1' style={{ padding: py + ' 0' }}>
    {[...Array(3)].map((_, i: number) => {
      return (
        <div
          key={i}
          className={'h-3 w-3 animate-bounce rounded-full bg-secondary-light'}
          style={{ animationDelay: i * 100 + 'ms' }}
        />
      )
    })}
  </div>
)

export default LoaderAnimation
