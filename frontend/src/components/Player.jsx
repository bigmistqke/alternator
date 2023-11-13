import { createEffect, createSignal, onMount } from "solid-js"
import { useStore } from "../Store"
import s from "./Player.module.css"

const Player = (props) => {
  const [store] = useStore()
  const [percentage, setPercentage] = createSignal(0)
  const [isPlaying, setIsPlaying] = createSignal(props.autoplay)

  const animateHead = () => {
    if (!isPlaying()) return
    setPercentage((props.media.currentTime / props.media.duration) * 100)
    setTimeout(animateHead, 1000 / 25)
  }

  onMount(() => animateHead())

  const pause = () => {
    props.media.pause()
    setIsPlaying(false)
  }
  const play = () => {
    props.media.play()
    setIsPlaying(true)
    animateHead()
  }

  const togglePlay = () => {
    if (isPlaying()) pause()
    else play()
  }



  return (
    <div class={`${s.player_container} ${store.darkMode ? s.darkMode : ""}`}>
      <a onMouseDown={togglePlay} class={s.play_pause}>
        {isPlaying() ? "pause" : "play"}
      </a>
      <div class={s.player}>
        <div class={s.head} style={{ left: `${percentage()}%` }} />
        <div class={s.horizon} />
      </div>
    </div>
  )
}

export default Player
