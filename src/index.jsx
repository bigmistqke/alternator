/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import App from "./App";
import { Route, Router, Routes } from "solid-app-router";
import Page from "./Page";
import { createResource } from "solid-js";
import Post from "./Post";
import Overlay from "./Overlay";
import Library from "./Library";
import LibraryPost from "./LibraryPost";
import { StoreProvider } from "./Store";
import CursorData from "./CursorData";

const URL = "http://localhost/alternator4/wordpress/wp-json/wp/v2/";

const fetchData = async () => {
  let pages = await fetchPages();
  console.log("PAGES", pages);
  let tags = {};
  Object.entries(pages).forEach(([page_id, page]) => {
    if (!page) {
      console.error("page is falsey ", page_id);
      return;
    }

    page.forEach((post) => {
      if (!post.crb_media) return;
      let content = [];
      if (post.crb_texts) content = [...post.crb_texts];
      if (post.crb_media) content = [...content, ...post.crb_media];
      content.forEach((content) => {
        content.url = `/${page_id}/${post.title.rendered}/${content.crb_title}`;
        if (!content.crb_tags) {
          console.error("no crb_tags", content, page_id, post.title.rendered);
        } else {
          content.crb_tags.forEach((tag) => {
            if (!tags[tag]) tags[tag] = [];
            tags[tag].push(
              `/${page_id}/${post.title.rendered}/${content.crb_title}`
            );
          });
        }
      });
    });
  });

  return { pages, tags };
};

const fetchPages = async () => {
  let pages = [
    "biennial",
    "surse",
    "in_situ",
    "exhibitions",
    "library",
    "documents",
  ];
  pages = await Promise.all(
    pages.map(async (page) => [page, await fetchURL(page)])
  );
  return Object.fromEntries(pages);
};
const fetchURL = async (page) => {
  const res = await fetch(URL + page);
  if (res.status !== 200) return undefined;
  return await res.json();
};

const setData = () => {
  const [user] = createResource(() => 0, fetchData);
  return user;
};

render(
  () => (
    <StoreProvider>
      <Router>
        <Routes>
          <Route path="/" element={<App />} data={setData}>
            <Route path="/" />
            <Route path="/cursor" element={<CursorData />} />
            <Route path="/:page" element={<Page />}>
              <Route path="/" />
              <Route path="/Library" element={<Library />}>
                <Route path="/" />
                <Route path="/:book/*content" element={<LibraryPost />}></Route>
              </Route>
              <Route path="/:post/*content" element={<Post />}></Route>
            </Route>
          </Route>
        </Routes>
      </Router>
    </StoreProvider>
  ),
  document.getElementById("root")
);
