import { NavLink, useRouteData } from "solid-app-router"
import { createEffect, createSignal, For, onMount } from "solid-js"
import { createStore } from "solid-js/store"
import { useStore } from "../Store"
import s from "./Notepad.module.css"
import Quill from "quill"
import Content from "./Content"
import { getCookie, updateCookie } from "../helpers/cookie"

const Delta = Quill.import("delta")

const Tag = (props) => {
  return (
    <div class={`${s.tag} ${s.border}`}>
      <span classList={{ [s.checkbox]: true, [s.checked]: props.selected }}>
        <span></span>
      </span>
      <label onmousedown={props.select}>{props.tag}</label>
    </div>
  )
}

const Filter = (props) => {
  const [store] = useStore()
  const [error, setError] = createSignal(false)
  let timeout
  const setFilter = () => {
    if (props.filteredTags.length === 0) {
      setError(true)
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => {
        setError(false)
      }, 2000)
      return
    }
    props.setMode("result")
  }

  return (
    <div class={s.filter}>
      <div class={`${s.title} ${s.border} ${s.big}`}>Themes</div>
      <div id="labels" class={`${s.tags} ${s.border}`}>
        <Show when={store.tags}>
          <For each={Object.keys(store.tags)}>
            {(tag) => (
              <Tag
                tag={tag}
                select={() => {
                  props.setFilter(tag, (bool) => !bool)
                }}
                selected={props.filter[tag]}
              />
            )}
          </For>
        </Show>
      </div>
      <div
        id="submit"
        class={`${s.button} ${s.big} ${s.border}`}
        onmousedown={setFilter}
      >
        {error() ? "SELECT A THEME FIRST" : "FILTER"}
      </div>
    </div>
  )
}

const Entry = (props) => {
  const [store] = useStore()
  const data = useRouteData()

  const dataEntry = () => {
    if (!data()?.pages) return

    const page = data().pages[props.page]
    const post = page.find((page) => page.title === props.post)
    if (!post) return false
    const content = [...post.files, ...post.texts].find((c) => {
      return c.name === props.content
    })
    content.type = content.file ? "file" : "text"

    return content
  }

  const getSiteUrl = () => `./${props.page}/${props.post}/${props.content}`
  const getFileUrl = () => `./media/${dataEntry()?.file?.filename}`

  return (
    <div class={s.entry}>
      <div class={s.entry__card}>
        <div class={s.entry__header}>
          <span class={s.entry__name}>{props.content}</span>
          <span class={s.entry__tag}>{props.tag}</span>
        </div>
        <div class={s.entry__content_container}>
          <div
            class={s.entry__content}
            style={{ "max-height": dataEntry().type === "text" ? "50vh" : "" }}
          >
            <Content content={dataEntry()} player={true} />
          </div>
          <Show when={dataEntry().description}>
            <div class={s.entry__description}>{dataEntry().description}</div>
          </Show>
        </div>
        <div class={s.entry__footer}>
          <Show when={dataEntry().type === "file"}>
            <a href={getFileUrl()} target="_blank">
              file
            </a>
          </Show>
          <a href={getSiteUrl()} target="_blank">
            context
          </a>
        </div>
      </div>
      <div
        class={`${s.entry__add} ${s.button}`}
        onmousedown={() =>
          props.addToQuill(props.page, props.post, props.content)
        }
      >
        <div>↑ add to notepad</div>
      </div>
    </div>
  )
}

const Result = (props) => {
  const [store] = useStore()

  return (
    <div class={s.result}>
      <div class={`${s.result__header} ${s.border}`}>
        <div class={`${s.big} ${s.title}`}>
          Themes:{" "}
          <span id="categories" class={`${s.result__themes} ${s.small}`}>
            {props.filteredTags.join(" ● ")}
          </span>
        </div>
        <div
          id="backToFilter"
          class={`${s.button} ${s.result__back}`}
          onmousedown={props.backToFilter}
        >
          FILTER OTHER
          <br />
          &#x2190; THEMES
        </div>
      </div>
      <div class={s.result__container}>
        <For each={props.filteredTags}>
          {(tag) => (
            <For each={store.tags[tag]}>
              {(post) => (
                <Entry {...post} tag={tag} addToQuill={props.addToQuill} />
              )}
            </For>
          )}
        </For>
      </div>
    </div>
  )
}

let quill

export default () => {
  const [store, setStore] = useStore()

  const [mode, setMode] = createSignal("filter")
  const [savedIndicator, setSavedIndicator] = createSignal(false)
  const [filter, setFilter] = createStore({})

  const data = useRouteData()

  let notepad_ref

  const initQuill = () => {
    // ExtendedLink.PROTOCOL_WHITELIST = ["http", "https", "mailto", "tel"]

    var toolbarOptions = [
      ["italic", "strike", "bold"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ size: ["small", false, "large", "huge"] }],
      [
        { align: "" },
        { align: "center" },
        { align: "right" },
        { align: "justify" },
      ],
    ]
    var options = {
      modules: {
        toolbar: toolbarOptions,
      },
      theme: "snow",
    }
    quill = new Quill(notepad_ref, options)

    let cookie = getCookie("notepad")

    if (cookie) quill.setContents(JSON.parse(cookie))
  }

  createEffect(() => {
    if (!store.tags) return
    Object.keys(store.tags).forEach((tag) => {
      setFilter("tag", false)
    })
  })

  onMount(() => {
    setStore("darkMode", true)
    document.body.classList.add("darkMode")
    initQuill()
  })

  const filteredTags = () =>
    Object.entries(filter)
      .filter(([tag, selected]) => selected)
      .map(([tag]) => tag)

  const saveNotepad = () => {
    if (quill) updateCookie("notepad", JSON.stringify(quill.getContents()))
    setSavedIndicator(true)
    setTimeout(() => {
      setSavedIndicator(false)
    }, 1000)
  }

  const addToQuill = (page, post, content) => {
    const range = quill.getSelection()
    const delta = {
      ops: [
        { insert: "\n" },
        {
          insert: `[${content}]`,
          attributes: {
            link: `/${page}/${post}/${content}`,
          },
        },
        { insert: "\n\n" },
      ],
    }
    quill.updateContents(new Delta().retain(range?.index || 0).concat(delta))
  }

  return (
    <div id={s.content}>
      <div classList={{ [s.half]: true, [s.left]: true }}>
        <Show when={mode() === "filter"}>
          <Filter
            filter={filter}
            setFilter={setFilter}
            setMode={setMode}
            filteredTags={filteredTags()}
          />
        </Show>
        <Show when={mode() === "result"}>
          <Result
            filteredTags={filteredTags()}
            backToFilter={() => setMode("filter")}
            addToQuill={addToQuill}
          />
        </Show>
        <Show when={mode() === "focus"}>
          <div class={s.focus}>
            <div class={`${s.focus__header} ${s.border}`}>
              <div class={`${s.title} ${s.big}`}>
                Focus:{" "}
                <span
                  id="categories"
                  class={`${s.focus__name} ${s.small}`}
                ></span>
              </div>
              <div class={`${s.button} ${s.focus__back}`}>BACK</div>
            </div>
            <div class={s.focus__container}></div>
          </div>
        </Show>
      </div>

      <div id="right" class={`${s.half} ${s.right}`}>
        <div class={`${s.title} ${s.big} ${s.border}`}>Notepad</div>
        <div ref={notepad_ref} class={s.notepad}></div>
        <div class={s.bottom} id="notebook_bottom">
          <div
            id="save"
            class={`${s.big} ${s.button}`}
            onmousedown={saveNotepad}
          >
            {savedIndicator() ? "Saved" : "Save"}
          </div>
        </div>
      </div>
    </div>
  )
}
