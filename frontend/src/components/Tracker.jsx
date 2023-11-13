import { createSignal, For, onMount, Show } from "solid-js";
import { useStore } from "../Store";
import s from "./Tracker.module.css";

function Tracker() {
  let [last, setLast] = createSignal(0);

  const [store, setStore] = useStore();

  onMount(() => {
    const track = ({ clientX, clientY }) => {
      if (performance.now() - last() > 250) {
        setStore("tracked_points", (points) => [
          ...points,
          {
            x: clientX,
            y:
              clientY + window.pageYOffset ||
              document.documentElement.scrollTop ||
              document.body.scrollTop ||
              0,
          },
        ]);
        setLast(performance.now());
      }
    };

    // window.onwheel = track;
    window.onmousemove = track;
  });

  return (
    <svg class={s.Tracker} style={{ height: store.page_height + "px" }}>
      <For each={store.tracked_points}>
        {(point, index) => {
          const prev_point = store.tracked_points[index() - 1];
          return (
            <Show when={prev_point}>
              <line
                x1={prev_point.x}
                y1={prev_point.y}
                x2={point.x}
                y2={point.y}
              />
            </Show>
          );
        }}
      </For>
    </svg>
  );
}
export default Tracker;
