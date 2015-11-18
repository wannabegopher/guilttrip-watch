export default function(instagramImage) {
  return {
    latitude: instagramImage.location.latitude,
    longitude: instagramImage.location.longitude
  }
}
