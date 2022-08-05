import { createEffect, createMemo, createResource } from "solid-js";
import { Route, Router, Routes } from "solid-app-router";

import { array_shuffle } from "./helpers/Pure";
import App from "./App";
import Page from "./components/Page";
import Post from "./components/Post";
import Overlay from "./components/Overlay";
import Library from "./components/Library";
import LibraryPost from "./components/LibraryPost";
import CursorData from "./components/CursorData";

import { useStore } from "./Store";
import { unwrap } from "solid-js/store";

const fetchData = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/posts?depth=1");
    if (response.status !== 200) throw response.error;

    const json = await response.json();
    const pages = {};
    for (let post of json.docs) {
      const category = post.category.name.toLowerCase();
      if (!pages[category]) pages[category] = [];
      pages[category].push(post);
    }

    return pages;
  } catch (err) {
    console.error(err);
    return {};
  }
};

const setTags = (categories) => {
  const [, setStore] = useStore();

  const tags = {};

  for (const category in categories) {
    const posts = categories[category];
    for (const post of posts) {
      const contents = [...post.files, ...post.texts];
      for (const content of contents) {
        for (const tag of content.tags) {
          const tag_name = tag.value.name;
          if (!tags[tag_name]) tags[tag_name] = [];
          tags[tag_name].push({
            category,
            post: post.title,
            content: content.name,
          });
        }
      }
    }
  }

  setStore("tags", tags);
};

const getData = () => {
  const [data] = createResource(() => 0, fetchData);

  createEffect(() => {
    if (!data()) return;
    setTags(data());
  });

  return data;
};

const getPage = (props) => {
  const page = createMemo(() =>
    props.data() ? props.data()[props.params.page] : false
  );
  return page;
};

const getPost = (props) =>
  createMemo(() => {
    try {
      const posts = props.data();
      if (!posts) throw `data is undefined`;

      const post_url = props.params.post ? props.params.post : "Library";
      const post = posts.find((post) => post.title === post_url);

      if (!post) throw `no post with title ${post_url}`;

      const files = post.files.map((file) => ({ ...file, type: "file" }));
      const texts = post.texts.map((text) => ({ ...text, type: "text" }));

      return array_shuffle([...files, ...texts]);
    } catch (err) {
      console.error(`getPost:`, err);
      return false;
    }
  });

const getOverlay = (props) => {
  const [store] = useStore();

  const getConnections = (content) => {
    if (!store.tags) return [];

    const random = Math.floor(Math.random() * (content.tags.length - 1));

    const tag_name = content.tags[random].value.name;

    const connections = store.tags[tag_name]
      .filter(
        (el) =>
          !(el.category === props.params.page && el.post === props.params.post)
      )
      .map((el) => unwrap(el));

    if (!connections) return [];

    return array_shuffle(connections).slice(0, 7);
  };

  return createMemo(() => {
    if (!props.data()) return false;
    const content = props.data().find((el) => el.name === props.params.content);
    const connections = getConnections(content);
    return { ...content, connections };
  });
};

const AllRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} data={getData}>
          <Route path="/" />
          <Route path="/cursor" element={<CursorData />} />
          <Route path="/:page" element={<Page />} data={getPage}>
            <Route path="/" />
            {/* <Route path="/Library" element={<Library />}>
              <Route path="/" />
              <Route path="/:book" element={<LibraryPost />}>
                <Route path="/" />
                <Route
                  path="/:content"
                  element={<Overlay />}
                  data={getOverlay}
                ></Route>
              </Route>
            </Route> */}
            <Route path="/:post" element={<Post />} data={getPost}>
              <Route path="/" />
              <Route path="/:content" element={<Overlay />} data={getOverlay}>
                <Route path="/" />
              </Route>
            </Route>
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default AllRoutes;
