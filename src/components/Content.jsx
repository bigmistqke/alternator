import { createEffect, createMemo, createSignal, For, onMount } from "solid-js";
import s from "./Content.module.css";
import Player from "./Player";

const Video = (props) => {
  let video;

  console.log("PROPS.OVERLAY", props.overlay);
  return (
    <>
      <div class={s.video_container}>
        <video
          classList={props.classList}
          ref={video}
          src={props.src}
          muted
          autoplay={props.overlay}
          loop
        />
      </div>

      <Show when={props.overlay}>
        <Player media={video} autoplay={true} />
      </Show>
    </>
  );
};
const Audio = (props) => {
  let audio;
  onMount(() => {
    if (props.overlay) console.log(props.src);
  });
  return (
    <div class={s.audio_container}>
      <audio
        ref={audio}
        src={props.src}
        muted
        autoplay={props.overlay}
        loop
        hidden
      />
      <Player media={audio} autoplay={true} />
    </div>
  );
};

const File = (props) => {
  const filepath = createMemo(() => {
    const file = props.content.file;
    if (!file) return false;
    if (file.sizes.tablet && file.sizes.tablet.url)
      return file.sizes.tablet.url;
    return file.url;
  });
  const extension = createMemo(() =>
    filepath() ? filepath().split(".").pop().toLowerCase() : []
  );

  return createMemo(() => {
    switch (extension()) {
      case "pdf":
        setTimeout(props.onLoad, 0);
        return (
          <iframe
            style={{ height: "500px", width: "100%" }}
            src={filepath()}
            {...props}
          />
        );
      case "mov":
        return (
          <video
            src={filepath()}
            muted
            autoplay={props.overlay}
            onLoadedMetadata={props.onLoad}
            loop
          />
        );
      case "mp4":
        return <Video {...props} src={filepath()} />;
      case "wav":
        return <Audio {...props} src={filepath()} />;
      case "mp3":
        return <Audio {...props} src={filepath()} />;
      case "jpg":
        return <img src={filepath()} {...props} onLoad={props.onLoad} />;
      case "jpeg":
        return <img src={filepath()} {...props} onLoad={props.onLoad} />;
      case "png":
        return <img src={filepath()} {...props} onLoad={props.onLoad} />;
      case "svg":
        setTimeout(props.onLoad, 0);
        return <img src={filepath()} {...props} />;
    }
  });
};

/* const FileContainer = (props) => {
  return <File {...props} />;
}; */

const Text = (props) => {
  onMount(() => {
    setTimeout(() => {
      if (props.onLoad) {
        props.onLoad();
      }
    }, 50);
  });
  return (
    <>
      <div classList={{ [s.Text]: true, ...props.classList }}>
        <span>{props.content.english}</span>
        <span>{props.content.romanian}</span>
      </div>
    </>
  );
};

const Content = (props) => {
  return createMemo(() =>
    props.content.type === "file" ? (
      <>
        <File content={props.content} {...props} />
      </>
    ) : (
      <Text content={props.content} {...props} />
    )
  );
};

export default Content;
