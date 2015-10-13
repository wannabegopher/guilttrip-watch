
import instagramNode from 'instagram-node'

export default function() {
  const instagramID = process.env.INSTAGRAM_ID
  const instagramSecret = process.env.INSTAGRAM_SECRET
  if (!instagramID || !instagramSecret) {
    throw('Instagram client IDs not in environment. Sry.')
  }

  const ig = instagramNode.instagram()
  ig.use({client_id: instagramID, client_secret: instagramSecret})

  return ig
}
