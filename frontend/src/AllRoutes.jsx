import { createEffect, createMemo, createResource, untrack } from "solid-js"
import { Route, Router, Routes } from "solid-app-router"

import { array_shuffle } from "./helpers/Pure"
import App from "./App"
import Page from "./components/Page"
import Post from "./components/Post"
import Overlay from "./components/Overlay"
import Library from "./components/Library"
import LibraryPost from "./components/LibraryPost"
import CursorData from "./components/CursorData"

import { useStore } from "./Store"
import { unwrap } from "solid-js/store"
import Intro from "./components/Intro"
import Notepad from "./components/Notepad"
// import "dotenv/config"

const AllRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} data={getData}>
          <Route path="/" />
          <Route path="/about" element={<Intro />} data={getAbout} />
          <Route path="/cursor" element={<CursorData />} data={getCursor} />
          <Route path="/notepad" element={<Notepad />} />
          <Route path="/:page" element={<Page />} data={getPage}>
            <Route path="/" />
            <Route path="/Library" element={<Library />} data={getLibrary}>
              <Route path="/" />
              <Route path="/:post" element={<Post />} data={getPost}>
                <Route path="/" />
                <Route path="/:content" element={<Overlay />} data={getOverlay}>
                  <Route path="/" />
                </Route>
              </Route>
            </Route>
            <Route path="/:post" data={getPost} element={<Post />}>
              <Route path="/" />
              <Route path="/:content" element={<Overlay />} data={getOverlay}>
                <Route path="/" />
              </Route>
            </Route>
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

const fetchJSON = async (url) => {
  const response = await fetch(url)
  if (response.status !== 200) throw response.error
  const json = await response.json()

  return json
}

const getPages = async () => {
  const json = await fetchJSON(
    `${import.meta.env.VITE_API_URL}/api/pages?depth=1`
  )

  const pages = {}
  for (let page of json.docs) {
    const title = page.title.toLowerCase()
    // if (!pages[title]) pages[page] = []
    pages[title] = page.posts
  }

  return pages
}

const getGlobal = (name) =>
  fetchJSON(`${import.meta.env.VITE_API_URL}/api/globals/${name}`)

const fetchData = async () => {
  try {
    const [pages, about, cursor] = await Promise.all([
      await getPages(),
      await getGlobal("about"),
      await getGlobal("cursor"),
    ])

    return { pages, about, cursor }
  } catch (err) {
    console.error(err)
    return {}
  }
}

const setTags = (categories) => {
  const [, setStore] = useStore()

  const tags = {}

  for (const page in categories) {
    const posts = categories[page]

    for (const post of posts) {
      const contents = [...post.files, ...post.texts]
      for (const content of contents) {
        for (const tag of content.tags) {
          const tag_name = tag.value.name
          if (!tags[tag_name]) tags[tag_name] = []
          tags[tag_name].push({
            page,
            post: post.title,
            content: content.name,
          })
        }
      }
    }
  }

  setStore("tags", tags)
}

const getData = () => {
  const [data] = createResource(() => 0, fetchData)
  createEffect(() => {
    if (!data()?.pages) return

    setTags(data().pages)
  })

  return data
}

const getCursor = (props) => createMemo(() => props.data()?.cursor)
const getAbout = (props) => createMemo(() => props.data()?.about)

const getPage = (props) =>
  createMemo(() => {
    if (!props.data()?.pages) return false
    const pages = props.data().pages
    if (props.params.page === "surse")
      return pages.library ? [...pages.surse, [...pages.library]] : pages.surse
    return pages[props.params.page]
  })

const getLibrary = (props) =>
  createMemo(() => props.data()[props.data().length - 1] || [])

const getPost = (props) =>
  createMemo(() => {
    try {
      const posts = props.data()
      if (!posts) throw `data is undefined`

      const post_url = props.params.post ? props.params.post : "library"

      const post = posts.find((post) => post.title === post_url)



      if (!post) throw `no post with title ${post_url}`

      const files = post.files.map((file) => ({ ...file, type: "file" }))
      const texts = post.texts.map((text) => ({ ...text, type: "text" }))

      return {
        description: post.description,
        content: array_shuffle([...files, ...texts]),
      }
    } catch (err) {
      console.error(`getPost:`, err)
      return false
    }
  })

const getOverlay = (props) => {
  const [store] = useStore()

  const getConnections = (content) => {
    if (!store.tags) return []
    if(!content) return []

    const random = Math.floor(Math.random() * (content.tags.length - 1))

    const tag_name = content.tags[random]?.value.name
    if (!tag_name) return []

    const connections = store.tags[tag_name]
      .filter(
        (el) =>
          !(el.page === props.params.page && el.post === props.params.post)
      )
      .map((el) => unwrap(el))

    if (!connections) return []

    return array_shuffle(connections).slice(0, 7)
  }

  return createMemo(() => {
    if (!props.data()) return false
    const content = props
      .data()
      .content.find((el) => el.name === props.params.content)

    if(!content) {
      console.error('can not find content for ', props.params.content, props.data().content);
    }
    const connections = getConnections(content)
    return { ...content, connections }
  })
}

export default AllRoutes
