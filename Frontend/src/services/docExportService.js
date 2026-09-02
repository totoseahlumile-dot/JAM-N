export const docExportService = {
  exportArtistResearchToDoc(artistData) {
    const formattedText = artistData.map(artist => {
      return `
ARTIST: ${artist.name}
Genre: ${artist.genre}
Type: ${artist.type}
Bio: ${artist.bio}
Streaming Links:
- Spotify: ${artist.streamingLinks.spotify}
- Apple Music: ${artist.streamingLinks.appleMusic}
- YouTube Music: ${artist.streamingLinks.youtubeMusic}
Tracks: ${artist.tracks.map(t => t.title).join(', ')}
----------------------------------------`
    }).join('\n')

    const blob = new Blob([formattedText], { type: 'text/plain;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'JAMN_Artist_Research_Export.txt'
    link.click()
  }
}