import { For, onMount } from "solid-js";
import { useStore } from "./Store";

const CursorData = () => {
  const [store, setStore] = useStore();
  onMount(() => setStore("page_height", document.body.offsetHeight));
  return (
    <>
      <For each={store.tracked_points}>
        {(point) => (
          <>
            <div class="col_1">{parseInt(point.x)}</div>
            <div class="col_1">{parseInt(point.y)}</div>
            <div class="col_1" />
          </>
        )}
      </For>
    </>
  );
};
export default CursorData;
