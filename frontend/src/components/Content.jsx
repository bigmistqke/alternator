import { createMemo, onMount } from "solid-js"
import s from "./Content.module.css"
import Player from "./Player"

const Video = (props) => {
  let video
  return (
    <>
      <div class={s.video_container}>
        <video
          ref={video}
          classList={props.classList}
          src={import.meta.env.VITE_API_URL + props.src}
          muted
          autoplay={props.autoplay}
          loop
        />
      </div>

      <Show when={props.player}>
        <Player media={video} autoplay={true} />
      </Show>
    </>
  )
}

const Audio = (props) => {
  let audio
  return (
    <div class={s.audio_container}>
      <audio
        ref={audio}
        src={props.src}
        muted
        autoplay={props.autoplay}
        loop
        hidden
      />
      <Player media={audio} autoplay={true} />
    </div>
  )
}

const File = (props) => {
  const filepath = () => {
    const file = props.content.file
    if (!file) return false
    return file.sizes?.tablet?.url || file.url
  }
  const extension = filepath()?.split(".").pop().toLowerCase() || false

  switch (extension) {
    case "pdf":
      setTimeout(props.onLoad, 0)
      return (
        <iframe
          style={{ height: "500px", width: "100%" }}
          src={filepath()}
          {...props}
        />
      )
    case "mov":
      return (
        <video
          src={filepath()}
          muted
          autoplay={props.autoplay}
          onLoadedMetadata={props.onLoad}
          loop
        />
      )
    case "mp4":
      return <Video {...props} src={filepath()} />
    case "wav":
      return <Audio {...props} src={filepath()} />
    case "mp3":
      return <Audio {...props} src={filepath()} />
    case "jpg":
      return <img src={filepath()} {...props} onLoad={props.onLoad} />
    case "jpeg":
      return <img src={filepath()} {...props} onLoad={props.onLoad} />
    case "png":
      return <img src={filepath()} {...props} onLoad={props.onLoad} />
    default:
      return <></>
  }
}

const Text = (props) => {
  onMount(() => {
    setTimeout(() => {
      if (props.onLoad) {
        props.onLoad()
      }
    }, 50)
  })
  return (
    <>
      <div classList={{ [s.Text]: true, ...props.classList }}>
        <span>{props.content.english}</span>
        <span>{props.content.romanian}</span>
      </div>
    </>
  )
}

const Content = (props) => {
  return createMemo(() =>
    props.content.type === "file" ? (
      <>
        <File content={props.content} {...props} />
      </>
    ) : (
      <Text content={props.content} {...props} />
    )
  )
}

export default Content
