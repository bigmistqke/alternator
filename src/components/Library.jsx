import { NavLink, Outlet, useParams, useRouteData } from "solid-app-router";
import { createEffect, For } from "solid-js";
import Intro from "./Intro";
import s from "./Page.module.css";

const PostLink = (props) => (
  <li class={s.post_title}>
    <div class="col_3" />
    <div class="col_7">
      <NavLink href={`${props.post}`} innerHTML={props.post} noScroll />
    </div>
  </li>
);

const Library = () => {
  const params = useParams();
  const data = useRouteData();

  createEffect(() => {
    data()?.pages.library.forEach((item) => {});
  });

  return (
    <>
      <Intro />
      <ul>
        <For each={data()?.pages.library}>
          {(item) => <PostLink post={item.title.rendered} />}
        </For>
      </ul>
      <Outlet />
    </>
  );
};

export default Library;
