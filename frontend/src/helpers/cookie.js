export function updateCookie(key, value) {
  document.cookie = `${key}=${value}; expires=Sun, 1 Feb 2150 12:00:00 UTC`
}
export function getCookie(key) {
  var name = key + "="
  var decodedCookie = decodeURIComponent(document.cookie)

  var ca = decodedCookie.split(";")
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i]
    while (c.charAt(0) == " ") {
      c = c.substring(1)
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ""
}
