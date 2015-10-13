

export default function(image) {
  if (!image.location) {
    return false
  }
  // Check tags: #tbt, #latergram, #latagram, …
  return true
}
