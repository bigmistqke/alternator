import { Outlet, useParams, useRouteData } from "solid-app-router";
import { createEffect, createSignal, onMount } from "solid-js";
import Content from "./Content";
import { array_shuffle } from "../helpers/Pure";
import s from "./Post.module.css";
import Link from "./Link";
import Overlay from "./Overlay";

const LibraryPost = () => {
  const params = useParams();
  const [contents, setContents] = createSignal([]);
  const [intro, setIntro] = createSignal();

  const data = useRouteData();

  createEffect(() => {
    if (!data()) return;
    const posts = data().library;

    if (!posts) {
      return;
    }
    let post = posts.find((post) => {
      return post.title.rendered === params.book;
    });
    if (!post) return;
    const crb_media = post.crb_media.map((m) => ({
      ...m,
      type: "media",
    }));

    setContents(array_shuffle([...crb_media]));
  });

  const randomClass = (min, max) =>
    `col_${Math.floor(Math.random() * (max - min) + min)}`;

  return (
    <>
      <div class={s.intro_container}>
        <span class="col_2" />
        <span class={`col_9 ${s.intro}`}>{intro()}</span>
      </div>
      <div class={s.content_container}>
        <For each={contents()}>
          {(content) => (
            <>
              <Show when={Math.random() > 0.25}>
                <span class={randomClass(2, 5)} />
              </Show>
              {}
              <Link
                classList={{
                  [randomClass(5, 7)]: true,
                  [s.content]: true,
                  no_fx: true,
                  hasContent: params.all,
                  // selected: params.content === content.url,
                }}
                // href={post.title.rendered}
                href={`/surse${content.url}`}
                noScroll
              >
                <Content content={content} />
              </Link>
              <Show when={Math.random() > 0.5}>
                <span class={randomClass(3, 7)} />
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

export default LibraryPost;
