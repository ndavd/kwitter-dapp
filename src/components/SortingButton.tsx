import classNames from 'classnames'
import { FC } from 'react'

import { SortBy } from '../types'

interface Props {
  sortBy: SortBy
  setSortBy: (set: (sortBy: SortBy) => SortBy) => void
}

const SortingButton: FC<Props> = ({ sortBy, setSortBy }) => (
  <button
    className={classNames(
      'mb-2 flex self-end rounded-md font-semibold sm:rounded-lg',
      'border-2 border-primary-dark text-primary-dark'
    )}
    onClick={() =>
      setSortBy((e) => (e == SortBy.NEWEST ? SortBy.MOST_VOTED : SortBy.NEWEST))
    }
  >
    <span
      className={classNames('w-24 text-center', {
        'bg-primary-dark text-secondary-light': sortBy == SortBy.NEWEST
      })}
    >
      {SortBy.NEWEST}
    </span>
    <span
      className={classNames('w-24 text-center', {
        'bg-primary-dark text-white': sortBy == SortBy.MOST_VOTED
      })}
    >
      {SortBy.MOST_VOTED}
    </span>
  </button>
)

export default SortingButton
