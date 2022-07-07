import { useParams, useRouteData } from "solid-app-router";
import { createEffect, createSignal } from "solid-js";
import { Portal } from "solid-js/web";
import Content from "./Content.jsx";
import { array_shuffle } from "./helpers/Pure.js";
import s from "./Overlay.module.css";
import dragHelper from "./helpers/dragHelper";
import Link from "./Link.jsx";
const Overlay = () => {
  const params = useParams();
  const data = useRouteData();
  const [content, setContent] = createSignal();
  const [connections, setConnections] = createSignal();
  const [max, setMax] = createSignal(false);
  const [offset, setOffset] = createSignal({ x: 0, y: 0 });
  const [dragging, setDragging] = createSignal(false);

  const getConnections = (_content) =>
    new Promise((resolve) => {
      const tag =
        _content.crb_tags[Math.floor(Math.random() * _content.crb_tags.length)];

      if (!tag) return 0;
      const attempt = (count) => {
        if (count > 100) resolve(false);
        else count++;

        const connections = array_shuffle([...data().tags[tag]])
          .splice(0, 7)
          .filter((v) => v !== _content.url);

        if (connections.length === 0) attempt(count + 1);
        else resolve(connections);
      };
      attempt(0);
    });

  createEffect(async () => {
    if (!data() || !params.content) return;

    let post = data().pages[params.book ? "library" : params.page].find(
      (v) => v.title.rendered === (params.book ? params.book : params.post)
    );
    if (!post) {
      console.error("no post", params.book, params.page, data().pages.library);
    }
    let _content = post.crb_media.find((v) => v.crb_title === params.content);
    let type = "media";
    if (!_content) {
      _content = post.crb_texts.find((v) => v.crb_title === params.content);
      type = "text";
    }

    setContent({ ..._content, type });
    const connections = await getConnections(_content);
    console.log({ connections });
    if (!connections) return;
    setConnections(connections);
  });

  const startDrag = async ({ clientX: start_x, clientY: start_y }) => {
    const initial = offset();

    await dragHelper(({ clientX: new_x, clientY: new_y }) => {
      setDragging(true);
      setOffset({
        x: initial.x + start_x - new_x,
        y: initial.y + start_y - new_y,
      });
    });
    setDragging(false);
  };

  return (
    <Show when={content()}>
      <Portal>
        <div
          classList={{
            [s.Overlay]: true,
            [s.max]: max(),
          }}
          style={{
            transform: `translate(calc(-50% + 50vw + ${
              offset().x * -1
            }px), calc(-50% + 50vh + ${offset().y * -1}px))`,
            /* transform: "translate(-50%, -50%)",
            left: offset().x * -1 + "px",
            top: offset().y * -1 + "px", */
          }}
          onMouseDown={startDrag}
        >
          <Show when={!content().crb_description}>
            <header class={s.title}>{content().crb_title}</header>
            <Content content={content()} />
          </Show>
          <Show when={content().crb_description}>
            <div class={s.content_description}>
              <div class={s.content_container}>
                <Content content={content()} />
              </div>
              <div class={s.title_description}>
                <header class={s.title}>{content().crb_title}</header>
                <div class={s.description}>{content().crb_description}</div>
              </div>
            </div>
          </Show>

          <footer>
            <div>
              <span>connections:</span>
              <For each={connections()}>
                {(connection, index) => (
                  <Link href={connection}>{index()}</Link>
                )}
              </For>
            </div>
            <div>
              <a
                onMouseDown={(e) => {
                  setMax((b) => !b);
                  e.stopPropagation();
                }}
              >
                {max() ? "min" : "max"}
              </a>
              <Link
                href={
                  params.book
                    ? `/surse/library/${params.book}`
                    : `/${params.page}/${params.post}`
                }
              >
                close
              </Link>
            </div>
          </footer>
        </div>
      </Portal>
    </Show>
  );
};

export default Overlay;
