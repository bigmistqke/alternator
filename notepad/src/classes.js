import { shuffle } from "../general"
import normalizeWheel from 'normalize-wheel';
function getQueryPath(path) {

    let queryPath = path.replace("./content/", "").replace(/\//g, ":");
    return queryPath;
}
function emptyPage() {
    //g.DOM.sub.category.innerHTML = "";
    g.DOM.sub.posts.innerHTML = "";
    g.DOM.sub.collections.innerHTML = "";
    g.DOM.body.innerHTML = "";
    g.DOM.header.style.marginBottom = "";
}
function changeURLQuery(path) {
    window.history.replaceState(null, null, "?path=" + path.replace("./content/", "").replace(/\//g, ":"));
}
class Base {
    getPath() {
        let basePath = "http://www.alternator.space";
        if (this.parent)
            basePath = this.parent.getPath();
        return basePath + "/" + this.data.name;
    }
    openFromQuery(splittedQuery) {



        if (splittedQuery.length == 0) { g.focus.focusOn(this); return; }
        let nextPartQuery = splittedQuery.shift();



        let child = this.children.find((child) => { if (child.data.name === nextPartQuery) { return child } });
        child.openFromQuery(splittedQuery);
    }
}
class Content extends Base {
    constructor() {
        super();
        this.data = {};
        this.data.name = "content";
        this.children = []
    }
}
class Category extends Base {
    constructor(parent, data) {
        super();
        this.data = {};
        this.data.name = data.name;
        this.data.children = data.data;
        this.parent = parent;
        this.parent.children.push(this);
        //
        this.children = [];
        //
        // this.addInteraction();
        // this.createChildren();
    }
}
class Post extends Base {
    getPath() {
        let basePath = this.parent.getPath();
        return basePath + "/" + this.data.name;
    }
    createDOM() {
        let _i = this;
        //
        _i.DOM = g.templates.post.cloneNode(true);
        _i.DOM.querySelector(".l-row__button").innerHTML = this.data.name.replace("'slash'", "/").replace(/([0-9]|[1-9][0-9]). /, "");;
        _i.DOM.querySelector(".l-row__button").addEventListener("mousedown", function() { _i.open() });
        g.DOM.sub.posts.appendChild(_i.DOM);
        return _i.DOM;
    }
    constructor(parent, data) {
        super();
        this.parent = parent;
        this.parent.children.push(this);
        this.children = [];
        //
        this.data = {};
        this.data.name = data.name;
        this.data.children = data.data;
        if (data.description) {
            this.description = data.description;
        }
        // this.createChildren();
    }
}
class Collection extends Base {
    destroy() {
        g.DOM.sub.collections.removeChild(this.DOM);
        this.destroyMedia();
    }
    constructor(parent, collection_data) {
        super();
        this.children = [];
        this.parent = parent;
        this.parent.children.push(this);
        //
        this.data = {};
        this.data.name = collection_data.name;
        this.data.children = collection_data.data;
        // this.createChildren();
    }
}
class Media extends Base {
    getPath() {
        let basePath = this.parent.getPath();
        this.data.path = basePath + "/" + this.data.src;
        this.data.optimizedPath = basePath + "/optimized/" + this.data.src;
        return this.data.path;
    }
    constructor(parent, data) {
        super();
        this.parent = parent;
        this.parent.children.push(this);
        //
        this.data = {};
        this.data.name = data.name;
        this.data.src = data.src;
        this.data.optimizedSrc = parent.getPath() + "/optimized/" + data.src;
        this.data.type = data.type;
        this.data.description = data.description.replace(/(?:\r\n|\r|\n)/g, '<br>');
        this.data.labels = data.labels ? data.labels : [];
        this.data.texts = data.texts ? data.texts : null;
        this.getPath();
        //
        this.DOM;
        this.media;
        this.now;
        this.interval;
        this.playing = false;
    }
}
class MediaPlayer {
    initInteractions() {
        let _i = this;
        _i.playing = false;
        //
        let now = this.DOM.querySelector(".controls__now");
        let play = this.DOM.querySelector(".controls__play");
        let media = this.DOM.querySelector(".media__source");
        let timeline = this.DOM.querySelector(".controls__timeline-container");
        let mouseDown = false;
        //
        media.addEventListener("mousedown", updateLastClick);
        play.addEventListener("mousedown", updateLastClick);
        timeline.addEventListener("mousedown", changeCurrentTime);
        //
        togglePlayer();
        //
        function updateLastClick() {
            let date = new Date();
            mouseDown = date.getTime();
            window.addEventListener("mouseup", togglePlayer);
        }
        function playMedia() {
            _i.playing = true;
            play.innerHTML = "pause";
            media.play();
            _i.update = setInterval(updateTimeline, 100);
        }
        function togglePlayer() {
            let date = new Date();
            let mouseUp = date.getTime();
            if (!mouseDown || (mouseDown && (mouseUp - mouseDown) > 250))
                return
            if (!_i.playing) {
                playMedia();
            } else {
                _i.playing = false;
                play.innerHTML = "play";
                media.pause();
                clearInterval(_i.update);
            }
            mouseDown = false;
            window.removeEventListener("mouseup", togglePlayer);
        }
        function changeCurrentTime(e) {
            let percentage = (e.layerX / this.offsetWidth);
            now.style.left = percentage * 100 + "%";
            media.currentTime = media.duration * percentage;
        }
        //
        function updateTimeline() {
            let percentage = media.currentTime / media.duration;
            now.style.left = percentage * 100 + "%";
        }
        // media.addEventListener("loadeddata", playMedia);
    }
    createDOM(media_instance) {
        if (this.type === "audio")
            this.DOM = g.templates["audioPlayer"].cloneNode(true);
        if (this.type === "video")
            this.DOM = g.templates["videoPlayer"].cloneNode(true);
        this.initInteractions();
        this.media = this.DOM.querySelector(".media__source");
        this.media.src = media_instance.data.path;
        return this.DOM;
    }
    constructor(media_instance) {
        this.type = media_instance.data.type;
        this.createDOM(media_instance);
    }
}
class Archive {
    addLabelToGUI(label) {
        let _i = this;
        let label_DOM = g.templates["label"].cloneNode(true);
        let labelName = label_DOM.querySelector(".thumbnail__name");
        let labelRadio = label_DOM.querySelector(".thumbnail__radio");
        labelName.innerHTML = label;
        labelName.addEventListener("mousedown", function() {
            _i.labels[label].selected = _i.labels[label].selected ? false : true;
            labelRadio.style.opacity = _i.labels[label].selected ? 1 : 0;
        })
        document.querySelector("#labels").appendChild(label_DOM);
    }
    addToLabels(media_instance) {
        let _i = this;
        for (let label of media_instance.data.labels) {
            if (!(label in _i.labels)) {
                _i.addLabelToGUI(label);
                _i.labels[label] = { selected: false, media: [] };
            }
            _i.labels[label].media.push(media_instance);
        }
    }
    filterMedia() {
        g.resultOpen = true;
        function createThumbnail(media_instance) {
            let thumbnail = new Thumbnail(media_instance);
            _i.thumbnails.push(thumbnail);
            return thumbnail;
        }
        let _i = this;
        let noneSelected = true;
        _i.thumbnails = [];
        _i.DOM.themes.innerHTML = "";
        for (let labelName in _i.labels) {
            let label = _i.labels[labelName];
            if (label.selected) {
                noneSelected = false;
                for (let media_instance of label.media) {
                    let filteredThumbnails = _i.thumbnails.filter((thisThumb) => {
                        return thisThumb.path === media_instance.data.path;
                    });
                    let thumbnail = filteredThumbnails.length > 0 ? filteredThumbnails[0] : createThumbnail(media_instance);
                    thumbnail.addLabel(labelName);
                }
                if (_i.DOM.themes.innerHTML != "") _i.DOM.themes.innerHTML += " &#9679; ";
                _i.DOM.themes.innerHTML += labelName;
            }
        }
        if (noneSelected) {
            submit.innerHTML = "NO THEME SELECTED";
            submit.classList.remove("hover");
            submit.classList.add("blink");
            setTimeout(() => {
                submit.innerHTML = "FILTER";
                submit.classList.add("hover");
                submit.classList.remove("blink");
            }, 1000);
        } else {
            let orderedThumbnails = _i.thumbnails.sort((a, b) => a.name.localeCompare(b.name));
            for (let thumbnail of orderedThumbnails) {
                _i.DOM.container.appendChild(thumbnail.DOM);
            }
            _i.DOM.result.style.display = "flex";
            _i.DOM.container.scrollTop = 0;
            _i.DOM.filter.style.display = "none";
        }
    }
    initInteractions() {
        let _i = this;
        submit.addEventListener("mousedown", function() {
            _i.filterMedia();
        });
        document.querySelector("#backToFilter").addEventListener("mousedown", function() {
            document.querySelector(".result").style.display = "";
            document.querySelector(".filter").style.display = "";
            _i.DOM.container.innerHTML = "";
            g.resultOpen = false;
        });
    }
    constructor() {
        this.DOM = {};
        this.DOM.result = document.querySelector(".result");
        this.DOM.container = document.querySelector(".result__container");
        this.DOM.filter = document.querySelector(".filter");
        this.DOM.submit = document.querySelector("#submit");
        this.DOM.themes = document.querySelector(".result__themes");
        this.thumbnails = [];
        this.labels = [];
        this.result = [];
        this.initInteractions();
    }
}
class Focus {
    focusOn(media_class){
        let thumbnail = new Thumbnail(media_class);
        document.querySelector(".focus__container").innerHTML = "";
        document.querySelector(".focus__container").appendChild(thumbnail.DOM);
        document.querySelector(".focus").style.display = "flex";
        document.querySelector(".result").style.display = "none";
        document.querySelector(".filter").style.display = "none";
        if(g.resultOpen){
            document.querySelector(".focus__back").innerHTML = "RETURN TO<br>&#x2190; OTHER MEDIA"
        }else{
            document.querySelector(".focus__back").innerHTML = "RETURN TO<br>&#x2190; FILTER"
        }
    }
    initInteractions() {
        document.querySelector(".focus__back").addEventListener("mousedown", () => {
            document.querySelector(".focus").style.display = "none";
            if (g.resultOpen) {
                document.querySelector(".result").style.display = "flex";
            } else {
                document.querySelector(".filter").style.display = "";
            }
        })
    }
    constructor() {
        this.initInteractions();
    }
}
class Thumbnail {
    addLabel(labelName) {
        let labels_DOM = this.card.querySelector(".thumbnail__labels");

        if (labels_DOM.innerHTML !== "") labels_DOM.innerHTML += " &#9679; ";
        labels_DOM.innerHTML += labelName;
    }
    initInteractions(thumbnail_DOM) {
        let _i = this;
        thumbnail_DOM.querySelector(".thumbnail__add").addEventListener("mousedown", function() {

            let caretPosition = g.notepad.getSelection() ? g.notepad.getSelection().index : 0;

            g.notepad.insertEmbed(caretPosition, "media-link", _i.media_class.getPath())
            /*           let whatever = new Whatever();

                       g.notepad.clipboard.dangerouslyPasteHTML(0, link.outerHTML);*/
        })
        thumbnail_DOM.querySelector(".thumbnail__context").addEventListener("mousedown", function() {

            let pathQuery = getQueryPath(_i.media_class.getPath());
            let base = g.url;
            let url = `${base}?path=${pathQuery}`;
            let win = window.open(url);
            setTimeout(function(){
                win.focus();
            }, 125);
        })
        thumbnail_DOM.querySelector(".thumbnail__maximize").addEventListener("mousedown", function() {
            window.open(_i.media_class.getPath()).focus();
        })
    }
    createDOM(media_class) {
        let _i = this;

        // if (!document.querySelector(url)) {
        let thumbnail_DOM = g.templates["thumbnail"].cloneNode(true);
        thumbnail_DOM.querySelector(".name").innerHTML = _i.name;
        thumbnail_DOM.querySelector(".thumbnail__description").innerHTML = _i.description;
        let media = document.createElement("div");

        switch (_i.type) {
            case "image":
                media = document.createElement("img");
                media.classList.add("media__source-container");
                media.src = media_class.data.optimizedPath;
                break;
            case "video":
                var mediaPlayer = new MediaPlayer(media_class);
                media = mediaPlayer.DOM;
                break;
            case "pdf":
                media = document.createElement("iframe");
                media.src = media_class.data.path;
                break;
            case "audio":
                var mediaPlayer = new MediaPlayer(media_class);
                media = mediaPlayer.DOM;
                break;
        }
        thumbnail_DOM.querySelector(".thumbnail__media").appendChild(media);
        _i.initInteractions(thumbnail_DOM);
        return thumbnail_DOM;
    }
    constructor(media_class) {
        this.media_class = media_class;
        this.type = media_class.data.type;
        this.name = media_class.data.name;
        this.description = media_class.data.description;
        this.selectedLabels = [];
        this.DOM = this.createDOM(media_class);
        this.card = this.DOM.querySelector(".thumbnail__card");
        this.add = this.DOM.querySelector(".thumbnail__add");
    }
}
class _Image extends Media {
    createDOM() {
        this.createBlank();
        this.DOM = g.templates["media--image"].cloneNode(true);
        this.media = this.DOM.querySelector(".media__source");
        return this.addToDOM(this.data.optimizedSrc);
    }
}
class _Video extends Media {
    createDOM() {
        this.createBlank();
        this.DOM = g.templates["media--video"].cloneNode(true);
        this.media = this.DOM.querySelector(".media__source");
        return this.addToDOM(this.data.src);
    }
}
class _Audio extends Media {
    createDOM() {
        this.createBlank();
        this.DOM = g.templates["media--audio"].cloneNode(true);
        this.media = this.DOM.querySelector(".media__source");
        return this.addToDOM(this.data.src);
    }
}
class _Text extends Media {
    createDOM() {
        this.createBlank();
        this.DOM = g.templates["media--text"].cloneNode(true);
        this.media = this.DOM.querySelector(".media__text");
        for (let language in this.data.texts) {
            let div = document.createElement("div");
            let paddingContainer = document.createElement("div");
            div.classList.add("translation");


            let text = this.data.texts[language];
            paddingContainer.innerHTML = text.replace(/(?:\r\n|\r|\n)/g, '<br>');
            div.appendChild(paddingContainer);
            this.DOM.querySelector(".media__text").appendChild(div);
        }
        return this.addToDOM();
    }
}
class _Pdf extends Media {
    createDOM() {

        this.createBlank();
        this.DOM = g.templates["media--pdf"].cloneNode(true);
        this.media = this.DOM.querySelector(".media__source");
        return this.addToDOM(this.data.src);
    }
}
export {
    Archive,
    Category,
    Post,
    Collection,
    Media,
    Content,
    Focus
}