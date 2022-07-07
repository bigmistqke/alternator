import {
  Link,
  NavLink,
  Outlet,
  useParams,
  useRouteData,
} from "solid-app-router";
import { createEffect, createSignal, For, onMount } from "solid-js";
import s from "./Page.module.css";

const Test = () => <span>test</span>;

const PostLink = (props) => (
  <li class={s.post_title}>
    <div class="col_1" />
    <div class="col_9">
      <NavLink href={`/${props.page}/${props.post}`}>{props.post}</NavLink>
    </div>
  </li>
);

const Page = (props) => {
  const params = useParams();
  const data = useRouteData();
  return (
    <>
      <Show when={params.page && data() && data().pages}>
        <ul class={s.post_titles}>
          <For each={data().pages[params.page]}>
            {(post) => (
              <PostLink post={post.title.rendered} page={params.page} />
            )}
          </For>
        </ul>
      </Show>
      <Outlet />
    </>
  );
};

export default Page;
