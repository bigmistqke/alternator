import { Link, NavLink, Outlet } from "solid-app-router"

import "./general.css"
import s from "./App.module.css"
import { createEffect, createSignal, onMount } from "solid-js"
import Tracker from "./components/Tracker"
import { useStore } from "./Store"

function Header(props) {
  const [store, setStore] = useStore()

  return (
    <>
      <Show when={store.menu_opened}>
        <Portal>
          <div
            classList={{
              [s.menu]: true,
              [s.darkMode]: store.darkMode,
            }}
          >
            <NavLink
              href="/biennial"
              onclick={() => setStore("menu_opened", false)}
            >
              biennial
            </NavLink>
            <NavLink
              href="/surse"
              onclick={() => setStore("menu_opened", false)}
            >
              surse
            </NavLink>
            <NavLink
              href="/in situ"
              onclick={() => setStore("menu_opened", false)}
            >
              in situ
            </NavLink>
            <NavLink
              href="/exhibitions"
              onclick={() => setStore("menu_opened", false)}
            >
              exhibitions
            </NavLink>
            <NavLink
              href="/documents"
              onclick={() => setStore("menu_opened", false)}
            >
              documents
            </NavLink>
            <NavLink
              href="/cursor"
              onclick={() => setStore("menu_opened", false)}
            >
              show cursor data
            </NavLink>
            <NavLink
              href="/notepad"
              onclick={() => setStore("menu_opened", false)}
            >
              notepad
            </NavLink>
            <Link
              href="https://www.nutesuparafrate.info"
              target="_blank"
              onclick={() => setStore("menu_opened", false)}
            >
              Nu te supăra, frate!
            </Link>
            <Link
              href="https://www.arhive-narative.ro"
              target="_blank"
              onclick={() => setStore("menu_opened", false)}
            >
              arhive-narative.ro
            </Link>
            <NavLink href="/about">about</NavLink>
          </div>
        </Portal>
      </Show>
      <header class={s.headerBig}>
        <div class={s.row}>
          <span class="col_2"></span>
          <div class="col_3">
            <NavLink href="/biennial">biennial</NavLink>
          </div>
          <div class="col_3">
            <NavLink href="/surse">surse</NavLink>
          </div>
          <div class="col_2">
            <NavLink href="/notepad">notepad</NavLink>
          </div>
          <div class="col_2">
            <NavLink href="/about">about</NavLink>
          </div>
        </div>
        <div class={s.row}>
          <div class="col_3">
            <Link
              href="/"
              class="no_fx"
              onmousedown={() => {
                setStore("tracked_points", [])
                document.body.classList.remove("darkMode")
                setStore("darkMode", false)
              }}
            >
              <img
                src="/logo.png"
                class={s.logo}
                style="/*! margin-top: 5; */"
              />
              alternator
            </Link>
          </div>
          <div class="col_3">
            <NavLink href="/in situ">in situ</NavLink>
          </div>
          <div class="col_3">
            <NavLink href="/exhibitions">exhibitions</NavLink>
          </div>
          <div class="col_3">
            <NavLink href="cursor">cursor data</NavLink>
          </div>
        </div>
        <div class={s.row}>
          <span class="col_4"></span>
          <div class="col_3">
            <NavLink href="/documents">documents</NavLink>
          </div>
          <div class="col_3">
            <Link href="https://www.nutesuparafrate.info" target="_blank">
              Nu te supăra, frate!
            </Link>
          </div>
          <div class="col_2">
            <Link href="https://www.arhive-narative.ro" target="_blank">
              arhive-narative.ro
            </Link>
          </div>
        </div>
      </header>
      <header class={s.headerSmall}>
        <div class={s.row}>
          <div class="col_12" />
        </div>
        <div class={s.row}>
          <div class="col_10">
            <Link
              href="/"
              class="no_fx"
              onmousedown={() => {
                setStore("tracked_points", [])
                document.body.classList.remove("darkMode")
                setStore("darkMode", false)
              }}
            >
              <img src="/logo.png" class={s.logo} />
              alternator
            </Link>
          </div>
          <div class="col_2">
            <a onmousedown={() => setStore("menu_opened", true)}>menu</a>
          </div>
        </div>
      </header>
    </>
  )
}

function App() {
  const [store, setStore] = useStore()

  onMount(() => {
    window.scroll(0, parseInt(store.scroll_top))
  })

  return (
    <>
      <div classList={{ [s.topLayer]: true, [s.darkMode]: store.darkMode }}>
        <Header page="test" />
        <Outlet />
      </div>
      <Tracker />
    </>
  )
}

export default App
