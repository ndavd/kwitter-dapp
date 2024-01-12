import { FC } from 'react'

interface Props {
  msg: string
}

const Status: FC<Props> = ({ msg }) => (
  <div className='px-4 text-center font-mono text-lg font-bold'>{msg}</div>
)

export default Status
