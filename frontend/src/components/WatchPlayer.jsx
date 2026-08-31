export default function WatchPlayer({ provider, videoId, embedUrl, title }) {
  if (provider === "youtube" && videoId) {
    return (
      <div className="absolute inset-0 bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={title || "STREAM player"}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0 bg-black"
        />
      </div>
    );
  }

  if ((provider === "vidsrc" || provider === "youtube") && embedUrl) {
    return (
      <div className="absolute inset-0 bg-black">
        <iframe
          src={embedUrl}
          title={title || "STREAM player"}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0 bg-black"
        />
      </div>
    );
  }

  return null;
}
