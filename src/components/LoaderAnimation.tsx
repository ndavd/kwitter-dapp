interface Props {
  py: string;
}

const LoaderAnimation = ( { py }: Props ) => {
  return (
    <div className="flex justify-center gap-1"
      style={{ padding: py + " 0" }}
    >
      {
        [...Array(3)].map((_, i: number) => {
          return <div key={i}
            className={"w-3 h-3 bg-secondary-light rounded-full animate-bounce"}
            style={{ animationDelay: (i*100)+"ms" }}
          />
        })
      }
    </div>
  );
}

export default LoaderAnimation;
