import { useParams, useRouteData } from "solid-app-router";
import { createEffect, createSignal, Show } from "solid-js";

import s from "./Intro.module.css";

const Intro = () => {
  const params = useParams();
  const data = useRouteData();

  const [intro, setIntro] = createSignal();

  createEffect(() => {
    if (!data()) {
      console.log("no data");
      return;
    }
    console.log("yes data");
    const posts = data().pages[params.page];
    if (!posts) {
      console.error("no posts", params.page);
      return;
    }
    let post = posts.find((post) => {
      let post_url = params.post ? params.post : "Library";
      console.log(post.title.rendered, post_url);
      return post.title.rendered === post_url;
    });
    if (!post) {
      console.error("no post", post.title.rendered);
    }
    console.log("POST IS ", post);
    setIntro(post.crb_intro);
  });
  return (
    <Show when={intro()}>
      <div class={s.intro_container}>
        <span class="col_2" />
        <span class={`col_9 ${s.intro}`} innerHTML={intro()} />
      </div>
    </Show>
  );
};
export default Intro;
