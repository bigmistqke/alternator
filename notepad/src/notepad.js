import wrappers from "../js_modules/wrappers.js"
import { Archive, Content, Post, Category, Media, Collection, Focus } from "./classes"
wrappers();
function ajax(url, datas, progress) {
    let promise = new Promise(function(resolve, reject) {
        var xhttp = new XMLHttpRequest();
        var formData = new FormData();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                resolve(this.responseText);
            }
        };
        if (datas) {
            for (var key in datas) {
                if (Array.isArray(datas[key])) {
                    for (let file of datas[key]) {
                        formData.append(key + "[]", file);
                    }
                } else {
                    formData.append(key, datas[key]);
                }
            }
        }
        xhttp.upload.onprogress = progress;
        xhttp.open("POST", "http://www.alternator.space/php/" + url + ".php", true);
        xhttp.send(formData);
    })
    return promise;
}
function getQueryPath(path) {

    let queryPath = path.replace("http://www.alternator.space/content/", "").replace(/\//g, ":");
    return queryPath;
}
String.prototype.escapeSpecialChars = function() {
    return this.replace(/\\n/g, "\\n")
        .replace(/\\'/g, "\\'")
        .replace(/\\"/g, '\\"')
        .replace(/\\&/g, "\\&")
        .replace(/\\r/g, "\\r")
        .replace(/\\t/g, "\\t")
        .replace(/\\b/g, "\\b")
        .replace(/\\f/g, "\\f");
};
function initGlobalVariables() {
    function initGlobalTemplates() {
        g.templates = {};
        for (var template of eId("templates").children) {

            g.templates[template.getAttribute("data-template")] = template;
        }
    }
    window.g = {};
    g.archive;
    g.focus;
    g.notepad;
    g.resultOpen = false;
    g.url = "http://www.alternator.space/"
    initGlobalTemplates();
}
function getContent() {
    return new Promise(function(resolve) {
        var xmlhttp = new XMLHttpRequest();
        var url = "http://www.alternator.space/JSON/content.json";
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let content = JSON.parse(this.responseText);

                resolve(content);
            }
        };
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    })
}
function getExtension(filename) {
    return (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename) : undefined;
}
function checkExtension(filename) {
    var extension = getExtension(filename);
    if (extension) {
        extension = extension[0];
        for (var key in g.extensions) {
            if (g.extensions[key].indexOf(extension) != -1) {
                return key;
            }
        }
    }
    return "NONE FOUND?";
}
function initArchive() {
    function createCategory(label) {
        var radio = document.createElement("div");
        radio.className = "radio";
        var selected = document.createElement("div");
        selected.className = "selected";
        var tag = document.createElement("div");
        tag.innerHTML = label;
        tag.className = "tag hover";
        var div = document.createElement("div");
        div.className = "label";
        div.addEventListener("mousedown", function() {
            var category = div.getElementsByClassName("tag")[0].innerHTML;
            if (selected.style.opacity == 0) {
                selected.style.opacity = 1;
                g.categorySelection[label] = true;
            } else {
                selected.style.opacity = 0;
                g.categorySelection[label] = false;
            }
        })
        radio.appendChild(selected);
        div.appendChild(radio);
        div.appendChild(tag);
        document.getElementById("categories").appendChild(div);
    }
    for (var label in g.labels) {
        g.categorySelection[label] = false;
    }
}
function initNotepad() {
    var toolbarOptions = [
        ['italic', 'strike', 'bold'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'align': '' }, { 'align': 'center' }, { 'align': 'right' }, { 'align': 'justify' }],
    ];
    var options = {
        modules: {
            toolbar: toolbarOptions
        },
        theme: 'snow'
    };
    g.notepad = new Quill('#notepad', options);
    g.notepad.root.setAttribute('spellcheck', false);
    g.notepad.on('text-change', function(delta, oldDelta, source) {
        updateCookie(JSON.stringify(g.notepad.getContents()));
    })
    document.getElementById("save").addEventListener("mousedown", function() {

        var formData = new FormData();
        var contents = JSON.stringify(g.notepad.getContents());
        contents = contents.replace(/\\n/g, "<br>");
        ajax("saveNote", { hash: g.hash, note: contents }).then(function(response) {

        })
    });
}
function initQuill() {
    var Blot = Quill.import('blots/embed');
    class MediaLink extends Blot {
        static create(value) {

            var node = super.create(value);

            if (JSON.stringify(value) === "true") return false;

            node.setAttribute("path", value);
            let span = document.createElement("span");
            let name = value.split('/').reverse()[0];
            node.innerHTML = `[${name}]`;
            node.classList.add("link");
            node.classList.add("button");
            node.addEventListener("mousedown", () => {
                let queryPath = getQueryPath(value);
                let splittedQuery = queryPath.split(":");

                g.content.openFromQuery(splittedQuery);
            })
            return node;
        }
        static value(node) {
            return node.getAttribute('path');
        }
    }
    MediaLink.blotName = 'media-link';
    MediaLink.tagName = 'a';
    Quill.register(MediaLink, true);
}
function initSplit() {
    Split(['#left', '#right'], {
        direction: 'horizontal',
        sizes: [50, 50],
        gutterSize: 4,
        cursor: 'column-resize'
    });
}
function readURLQuery() {
    var urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('id')) return;
    return urlParams.get("id");
}
function updateCookie(text) {
    text = escape(text);
    let hash = g.hash;
    document.cookie = `text=${text}; expires=Sun, 1 Feb 2150 12:00:00 UTC`;
}
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function initHash() {
    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    let hash = readURLQuery();



    let textCookie = getCookie("text");

    if (!hash) {
        hash = getCookie("id");
        if (hash)
            window.history.pushState(null, null, "?id=" + hash);
    };


    if (hash) {
        g.hash = hash;
        ajax("openHash", { hash: g.hash }).then(function(response) {

            response = JSON.parse(response);

            if (response.exists) {

                g.notepad.setContents(JSON.parse(response.note.replace(/<br>/g, "\\n")));
            }
        });
    } else {
        function createHash() {
            var hash = uuidv4();
            ajax("openHash", { hash: hash }).then(function(response) {

                response = JSON.parse(response);
                if (response.exists) {
                    createHash(callback);
                } else {
                    g.hash = hash;
                    window.history.pushState(null, null, "?id=" + hash);
                    document.cookie = "id=" + hash + "; expires=Sun, 1 Feb 2150 12:00:00 UTC";
                }
            })
        }
        createHash();
    }
}
function addMediaLabelsToGlobalLabels(media_instance) {}
function processContent(content_data) {
    g.archive = new Archive;
    g.content = new Content();
    for (let category_data of content_data) {
        let category_instance = new Category(g.content, category_data);
        for (let post_data of category_data.data) {
            let post_instance = new Post(category_instance, post_data);
            if (post_data.name.includes("bout")) {
                let media_instance = new Media(post_instance, post_data);
                g.archive.addToLabels(media_instance);
            } else if (!post_data.name.includes("ibrary")) {
                for (let media_data of post_data.data) {
                    let media_instance = new Media(post_instance, media_data);
                    g.archive.addToLabels(media_instance);
                }
            } else {
                for (let collection_data of post_data.data) {
                    let collection_instance = new Collection(post_instance, collection_data.name);
                    for (let media_data of collection_data.data) {
                        let media_instance = new Media(collection_instance, media_data);
                        addMediaLabelsToGlobalLabels(media_instance);
                    }
                }
            }
        }
    }
}
function initMainMenu() {
    let buttons = document.querySelector("#l-main-menu").querySelectorAll(".button");
    for (let button of buttons) {
        button.addEventListener("mousedown", () => {
            let path = button.getAttribute("data-path");
            if (!path) return;
            let url = `http://www.alternator.space/?path=${path}`;
            location.replace(url);
        })
    }
}
function initFocus() {
    g.focus = new Focus();
}
function checkIfMobile() {
    return false;
}
function init() {

    initGlobalVariables();
    let isMobile = checkIfMobile();
    if (!isMobile) document.body.classList.add("no-mobile");
    getContent()
        .then(processContent)
    initArchive();
    initFocus();
    initNotepad();
    initQuill();
    initSplit();
    initHash();
    initMainMenu();
}
init();