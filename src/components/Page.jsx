import {
  Link,
  NavLink,
  Outlet,
  useParams,
  useRouteData,
} from "solid-app-router";
import { createEffect, createSignal, For, onMount } from "solid-js";
import { useStore } from "../Store";
import s from "./Page.module.css";

const Test = () => <span>test</span>;

const PostLink = (props) => {
  return (
    <li class={s.post_title}>
      <div class="col_1" />
      <div class="col_9">
        <NavLink href={`/${props.page}/${props.post}`}>{props.post}</NavLink>
      </div>
    </li>
  );
};
const Page = (props) => {
  const params = useParams();
  const data = useRouteData();
  const [store, setStore] = useStore();

  return (
    <>
      <Show when={params.page && data()}>
        <ul class={s.post_titles}>
          <For each={data()}>
            {(post) => <PostLink post={post.title} page={params.page} />}
          </For>
        </ul>
      </Show>
      <Outlet />
    </>
  );
};

export default Page;
