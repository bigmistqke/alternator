export default (move_callback = () => { }, end_callback = () => { }) => new Promise((resolve) => {
  const end = (e) => {
    window.removeEventListener("touchmove", move_callback);
    window.removeEventListener("touchend", end);
    end_callback(e);
    resolve(e);
  }
  window.addEventListener("touchmove", move_callback);
  window.addEventListener("touchend", end);
})