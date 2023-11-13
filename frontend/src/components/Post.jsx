import { Outlet, useRouteData } from "solid-app-router"
import { onMount, onCleanup, createEffect } from "solid-js"
import Content from "./Content"

import Link from "./Link"
import Intro from "./Intro"

import s from "./Post.module.css"
import { useStore } from "../Store"
import getRandomClass from "../helpers/getRandomClass"
import fals from "fals"

const ContentContainer = (props) => {
  const [store, setStore] = useStore()
  const random = getRandomClass(2, 5)
  let ref

  const updatePageHeight = () => {
    setTimeout(() => {
      setStore("page_height", document.body.offsetHeight)
    }, 50)
  }

  const onLoad = () => {
    updatePageHeight()

    if (store.content === props.content.name) {
      setTimeout(() => {
        if (!fals(document.documentElement.scrollTop)) {
          document.documentElement.scrollTop =
            ref.getBoundingClientRect().top + document.documentElement.scrollTop
        } else {
          document.body.scrollTop =
            ref.getBoundingClientRect().top + document.body.scrollTop
        }
      }, 50)
    }
  }

  onMount(() => {
    updatePageHeight()
    setTimeout(() => {
      window.getSelection().empty()
    }, 0)
  })

  onCleanup(updatePageHeight)

  return (
    <Link
      classList={{
        [random]: true,
        [s.content]: true,
        no_fx: true,
      }}
      href={props.content.name}
      noScroll
      ref={ref}
      style={{
        "padding-bottom": `${(100 / 12) * (parseInt(Math.random() * 2) + 1)}vw`,
      }}
    >
      <Content content={props.content} onLoad={onLoad} />
    </Link>
  )
}

const RandomPadding = () => (
  <Show when={Math.random() > 0.25}>
    <span class={getRandomClass(2, 5)} />
  </Show>
)

const Post = () => {
  const data = useRouteData()

  return (
    <>
      <Intro />

      <div class={s.content_container}>
        <For each={data()?.content}>
          {(content) => (
            <>
              <RandomPadding />
              <ContentContainer ref={ref} content={content} />
              <RandomPadding />
            </>
          )}
        </For>
      </div>
      <Outlet />
    </>
  )
}

export default Post
