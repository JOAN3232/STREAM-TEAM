export const playableContent = [
  {
    id: "charade-1963",
    title: "Charade",
    year: 1963,
    mediaType: "movie",
    runtime: 113,

    description:
      "A woman becomes caught in a dangerous mystery after discovering that several men are searching for a fortune connected to her late husband.",

    source: "Wikimedia Commons",
    license: "Public Domain",

    commonsFile: "File:Charade (1963).webm",

    posterUrl:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Charade%20(1963%20poster).jpg",

    videoUrl: "",
  },
];

export const getPlayableContentById = (id) =>
  playableContent.find(
    (item) => item.id === id
  );

export async function getPlayableVideoUrl(
  commonsFile
) {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    prop: "imageinfo",
    iiprop: "url",
    titles: commonsFile,
  });

  const response = await fetch(
    `https://commons.wikimedia.org/w/api.php?${params}`
  );

  if (!response.ok) {
    throw new Error(
      "Could not load STREAM video."
    );
  }

  const data = await response.json();

  const pages = Object.values(
    data?.query?.pages || {}
  );

  const url =
    pages[0]?.imageinfo?.[0]?.url;

  if (!url) {
    throw new Error(
      "Playable video URL not found."
    );
  }

  return url;
}