import { useParams, useRouteData } from "solid-app-router";
import { createEffect, createSignal, Show } from "solid-js";

import s from "./Intro.module.css";

const Intro = () => {
  const post = useRouteData();



  return (
    <Show when={post()?.description}>
      <div class={s.intro_container}>
        <span class="col_2" />
        <span class={`col_9 ${s.intro}`} innerHTML={post().description} />
      </div>
    </Show>
  );
};
export default Intro;
