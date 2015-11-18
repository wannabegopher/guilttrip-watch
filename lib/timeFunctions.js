


export function dateFromImage(image) {
  return new Date(image.created_time*1000)
}
