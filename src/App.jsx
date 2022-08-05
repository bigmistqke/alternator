import { Link, NavLink, Outlet } from "solid-app-router";

import "./general.css";
import s from "./App.module.css";
import { createEffect, createSignal, onMount } from "solid-js";
import Tracker from "./components/Tracker";
import { useStore } from "./Store";

function Header(props) {
  return (
    <header class={s.header}>
      <div class={s.row}>
        <span class="col_3"></span>
        <div class="col_3">
          <NavLink href="/biennial">biennial</NavLink>
        </div>
        <div class="col_4">
          <NavLink href="/surse">surse</NavLink>
        </div>
        <div class="col_1">
          <a>notepad</a>
        </div>
      </div>
      <div class={s.row}>
        <div class="col_4">
          <Link href="/" class="no_fx">
            <img src="/logo.png" class={s.logo} style="/*! margin-top: 5; */" />
            alternator
          </Link>
        </div>
        <div class="col_3">
          <NavLink href="/in situ">in situ</NavLink>
        </div>
        <div class="col_4">
          <NavLink href="/exhibitions">exhibitions</NavLink>
        </div>
        <div class="col_1">
          <NavLink href="/about">about</NavLink>
        </div>
      </div>
      <div class={s.row}>
        <span class="col_5"></span>
        <div class="col_3">
          <NavLink href="/documents">documents</NavLink>
        </div>
        <div class="col_4">
          <NavLink href="cursor">
            <span class="minHide">show</span> cursor{" "}
            <span class="minHide">data</span>
          </NavLink>
        </div>
      </div>
    </header>
  );
}

function App() {
  const [store, setStore] = useStore();

  onMount(() => {});

  createEffect(() => {
    window.scroll(0, parseInt(store.scroll_top));
  }, []);
  return (
    <>
      <div class={s.topLayer}>
        <Header page="test" />
        <Outlet />
      </div>
      <Tracker />
    </>
  );
}

export default App;
