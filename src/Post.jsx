import { Outlet, useParams, useRouteData } from "solid-app-router";
import { createEffect, createMemo, createSignal, onMount } from "solid-js";
import Content from "./Content";
import { array_shuffle } from "./helpers/Pure";

import Link from "./Link";
import Overlay from "./Overlay";
import Intro from "./Intro";

import s from "./Post.module.css";
import { useStore } from "./Store";
import getRandomClass from "./helpers/getRandomClass";

const ContentContainer = (props) => {
  const [store, setStore] = useStore();

  const params = useParams();
  let ref;

  const random = createMemo(() => getRandomClass(2, 5));

  const updatePageHeight = () => {
    setStore("page_height", document.body.offsetHeight);
  };

  const onLoad = () => {
    updatePageHeight();
  };

  let page_height;

  createEffect(() => {
    if (page_height !== store.page_height) {
      page_height = store.page_height;
      if (params.content === props.content.crb_title) {
        setStore("scroll_top", ref.getBoundingClientRect().top);
      }
    }
  });
  onMount(() => {
    updatePageHeight();
    setTimeout(() => {
      window.getSelection().empty();
    }, 0);
  });

  return (
    <>
      <Link
        classList={{
          [random()]: true,
          [s.content]: true,
          no_fx: true,
          hasContent: params.all,
          selected: params.content === props.content.url,
        }}
        href={props.content.crb_title}
        noScroll
        ref={ref}
      >
        <Content content={props.content} onLoad={onLoad} />
      </Link>
    </>
  );
};

const Post = () => {
  const params = useParams();
  const data = useRouteData();

  const [contents, setContents] = createSignal([]);

  createEffect(() => {
    if (!data()) return;

    const posts = data().pages[params.page];
    if (!posts) {
      console.error("no posts", params.page);
      return;
    }

    let post = posts.find((post) => {
      let post_url = params.post ? params.post : "Library";
      return post.title.rendered === post_url;
    });
    if (!post) {
      console.error("no post!");
      return;
    }

    let { crb_media, crb_texts } = post;
    crb_media = crb_media
      ? crb_media.map((m) => ({ ...m, type: "media" }))
      : [];
    crb_texts = crb_texts ? crb_texts.map((m) => ({ ...m, type: "text" })) : [];
    setContents(array_shuffle([...crb_media, ...crb_texts]));
  });

  createEffect(() => console.log("POST!", contents()));

  let ref;

  return (
    <>
      <Intro />

      <div ref={ref} class={s.content_container}>
        <For each={contents()}>
          {(content) => (
            <>
              <>{content}</>
              <Show when={Math.random() > 0.25}>
                <span class={getRandomClass(2, 5)} />
              </Show>
              {}
              <ContentContainer content={content} />

              <Show when={Math.random() > 0.5}>
                <span class={getRandomClass(3, 7)} />
              </Show>
            </>
          )}
        </For>
      </div>

      <Show when={params.content}>
        <Overlay />
      </Show>
    </>
  );
};

export default Post;
