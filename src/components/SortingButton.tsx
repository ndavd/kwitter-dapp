import classNames from 'classnames'
import { FC } from 'react'

export type SortBy = 'newest' | 'most voted'

interface Props {
  sortBy: SortBy
  setSortBy: (set: (sortBy: SortBy) => SortBy) => void
}

const SortingButton: FC<Props> = ({ sortBy, setSortBy }) => (
  <button
    className={classNames(
      'mb-2 self-end flex rounded-md sm:rounded-lg font-semibold',
      'border-2 border-primary-dark text-primary-dark'
    )}
    onClick={() => setSortBy((e) => (e == 'newest' ? 'most voted' : 'newest'))}
  >
    <span
      className={classNames('text-center w-24', {
        'bg-primary-dark text-white': sortBy == 'newest'
      })}
    >
      newest
    </span>
    <span
      className={classNames('text-center w-24', {
        'bg-primary-dark text-white': sortBy == 'most voted'
      })}
    >
      most voted
    </span>
  </button>
)

export default SortingButton
