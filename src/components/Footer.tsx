const Footer = () => {
  return (
    <footer
      className={
        'flex justify-center items-center h-20 w-full -mt-20 ' +
        'bg-secondary text-white font-semibold'
      }
    >
      <p>
        made by:{' '}
        <a
          target='_blank'
          rel='noopener noreferrer'
          href='https://ndavd.com'
          className='font-mono text-primary hover:underline'
        >
          ndavd
        </a>
      </p>
    </footer>
  )
}

export default Footer
