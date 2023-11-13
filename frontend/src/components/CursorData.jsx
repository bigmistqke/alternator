import { useRouteData } from "solid-app-router"
import { createEffect, For, onMount } from "solid-js"
import { useStore } from "../Store"
import Intro from "./Intro"
import s from "./CursorData.module.css"

const CursorData = () => {
  const [store, setStore] = useStore()
  const data = useRouteData()

  onMount(() => {
    setStore("page_height", document.body.offsetHeight)
    document.body.classList.remove("darkMode")
    setStore("darkMode", false)
  })
  return (
    <>
      <Intro />
      <div class={s.container}>
        <For each={store.tracked_points}>
          {(point) => (
            <>
              <span class="col_sm" />
              <span class="col_1">{parseInt(point.x)}</span>
              <span class="col_1">{parseInt(point.y)}</span>
              <span class="col_sm" />
            </>
          )}
        </For>
      </div>
    </>
  )
}
export default CursorData
