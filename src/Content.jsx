import { createEffect, createMemo, createSignal, onMount } from "solid-js";
import s from "./Content.module.css";

const Medium = (props) => {
  const [filepath, setFilepath] = createSignal(props.content.crb_files);
  const extension = createMemo(() =>
    filepath() ? filepath().split(".").pop().toLowerCase() : []
  );

  createEffect(() => {
    setFilepath(props.content.crb_files);
  });
  const getMedium = createMemo(() => {
    switch (extension()) {
      case "pdf":
        return (
          <iframe style={{ height: "500px" }} src={filepath()} {...props} />
        );
      case "mov":
        return <video src={filepath()} {...props} />;
      case "mp4":
        return <video src={filepath()} {...props} />;
      case "wav":
        return <audio src={filepath()} {...props} />;
      case "mp3":
        return <audio src={filepath()} {...props} />;
      case "jpg":
        return <img src={filepath()} {...props} />;
      case "jpeg":
        return <img src={filepath()} {...props} />;
      case "png":
        return <img src={filepath()} {...props} />;
      case "svg":
        return <img src={filepath()} {...props} />;
    }
  });

  return getMedium();
};

const Text = (props) => {
  return (
    <>
      <div class={s.Text} {...props}>
        <span>{props.content.crb_english}</span>
        <span>{props.content.crb_romana}</span>
      </div>
    </>
  );
};

const Content = (props) => {
  return (
    <>
      <Show when={props.content.type === "media"}>
        <Medium content={props.content} {...props} />
      </Show>
      <Show when={props.content.type === "text"}>
        <Text content={props.content} {...props} />
      </Show>
    </>
  );
};

export default Content;
