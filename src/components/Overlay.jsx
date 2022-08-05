import { useParams, useRouteData } from "solid-app-router";
import { createEffect, createMemo, createSignal } from "solid-js";
import { Portal, PropAliases } from "solid-js/web";

import s from "./Overlay.module.css";
import dragHelper from "../helpers/dragHelper";
import { useStore } from "../Store.jsx";

import Link from "./Link.jsx";
import Player from "./Player.jsx";
import Content from "./Content.jsx";

const Overlay = () => {
  const params = useParams();
  const data = useRouteData();

  const [max, setMax] = createSignal(false);
  const [offset, setOffset] = createSignal({ x: 0, y: 0 });
  const [dragging, setDragging] = createSignal(false);

  const [store, setStore] = useStore();

  const startDrag = async ({ clientX: start_x, clientY: start_y }) => {
    if (max()) return;
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

  createEffect(() => {
    setStore("content", params.content);
  });

  const transform = createMemo(
    () =>
      `translate(calc(-50% + ${max() ? 0 : offset().x * -1}px), calc(-50% + ${
        max() ? 0 : offset().y * -1
      }px))`
  );

  return (
    <Show when={data()}>
      <Portal>
        <div
          classList={{
            [s.Overlay]: true,
            [s.max]: max(),
          }}
          style={{
            transform: transform(),
          }}
          onMouseDown={startDrag}
        >
          <header class={s.title}>{data().name}</header>
          <div
            classList={{
              [s.content_container]: true,
              [s.with_description]: data().description,
            }}
          >
            <Content
              content={data()}
              overlay={true}
              classList={{
                [s.content_overlay]: true,
                [s.with_description]: data().description,
              }}
            />
          </div>
          <Show when={data().description}>
            <div class={s.description}>{data().description}</div>
          </Show>

          <footer>
            <div>
              <span>connections:</span>
              <For each={data().connections}>
                {({ category, post, content }, index) => (
                  <Link href={`/${category}/${post}/${content}`}>
                    {index()}
                  </Link>
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
