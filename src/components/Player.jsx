import { createEffect, createSignal, onMount } from "solid-js";
import s from "./Player.module.css";

const Player = (props) => {
  const [percentage, setPercentage] = createSignal(0);
  const [isPlaying, setIsPlaying] = createSignal(props.autoplay);
  // console.log("isPlaying", props.autoplay);

  const animateHead = () => {
    if (!isPlaying()) return;
    setPercentage((props.media.currentTime / props.media.duration) * 100);
    setTimeout(animateHead, 1000 / 25);
  };

  onMount(() => animateHead());

  createEffect(() => console.log(percentage()));

  const pause = () => {
    props.media.pause();
    setIsPlaying(false);
  };
  const play = () => {
    props.media.play();
    setIsPlaying(true);
    animateHead();
  };

  const togglePlay = () => {
    if (isPlaying()) pause();
    else play();
  };

  return (
    <div class={s.player_container}>
      <a onMouseDown={togglePlay} class={s.play_pause}>
        {isPlaying() ? "pause" : "play"}
      </a>
      <div class={s.player}>
        <div class={s.head} style={{ left: `${percentage()}%` }} />
        <div class={s.horizon} />
      </div>
    </div>
  );
};

export default Player;
