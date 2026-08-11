const letters = ["S", "T", "R", "E", "A", "M"];

export default function Loader() {
  return (
    <div className="stream-loader">
      <div className="stream-loader-logo">
        {letters.map((letter, index) => (
          <span
            key={index}
            style={{ animationDelay: `${index * 0.12}s` }}
          >
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
}