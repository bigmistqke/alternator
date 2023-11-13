import { NavLink, Outlet, useRouteData } from "solid-app-router";

import { For } from "solid-js";
import Intro from "./Intro";
import s from "./Page.module.css";

const Library = () => {
  const data = useRouteData();

  return (
    <>
      <Intro />
      <ul>
        <For each={data()}>
          {(item) =>
            <li class={s.post_title}>
              <div class="col_3" />
              <div class="col_7">
                <NavLink href={item.title} noScroll>{item.title}</NavLink>
              </div>
            </li>
          }
        </For>
      </ul>
      <Outlet />
    </>
  );
};

export default Library;
