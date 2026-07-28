+++
title = "trip and fell not in the wishing well"
date = 2026-07-15
template = "post.html"

[taxonomies]
tags = ["zola", "yap"]

[extra]
sidebar_heading = "well"
sidebar_text = "about the rabbit hole i fell into and zola."
+++

hello pretty peeps! hope everyone is doing good. so, im back like really back not that i figured out something but if this keeps going future me is gonna take some hard hit. but anyways im not here to yap about that(or maybe i am).

so these past few months more like since last year vacation i fell into this rabbit hole called gaming. i spent quite some unhealthy amount of time gaming away i still am and i will admit it is fun. i am still yet to see the consequences of this addiction but i know what they can be and i am not fool enough to just wait for them. so, yeah i have started a new game red dead redemption 2 after completing the legends of zelda: breath of the wild (amazing game btw)  you can check out the games i have completed <a href="https://bckl.gg/tDaH" target="_blank" rel="noopener">here</a>.

<img src="/blogs/images/gmow/link.png" alt="what?" class="post-image"/>

anyways this site has underwent a little change as well i moved away from writing raw html to <a href="https://www.getzola.org/" target="_blank" rel="noopener">zola</a>. for those of ye fellers who dont know what this is its a static site engine, blazing fast (as their site claims) its written in rust or so i was told. anyways my opinion about is in good words.

```term
.
├── CNAME
├── config.toml
├── content
│   ├── about.md
│   ├── blog
│   ├── _index.md
│   └── photo.md
├── public
│   ├── blogs
│   ├── CNAME
│   ├── darkmode.js
│   ├── favicon.ico
│   ├── footer-cat.gif
│   ├── graph.js
│   ├── graph.json
│   └── styles.css
├── scripts
│   └── generate_graph.py
├── static
│   ├── blogs
│   ├── CNAME
│   ├── darkmode.js
│   ├── favicon.ico
│   ├── footer-cat.gif
│   ├── graph.js
│   ├── graph.json
│   └── styles.css
└── templates
    ├── 404.html
    ├── base.html
    ├── blog.html
    ├── index.html
    ├── page.html
    ├── post.html
    └── tags
```

so this is the structure of the folder. config.toml is some of zola config that is fun to play around with ig so, public folder just pops up when you finally upload your site for the world to see. it is created automatically, scripts holds a python script which is used to update the graph.json file in the static, static mostly contains the stuff that you dont really touch unless you are feeling lucky(just kidding), same with templates it contains the different .html structure for different things. inside content/blog is where you write blog in .md format.

```markdown
+++
title = ""
date = 2025-01-01
template = "post.html"

[taxonomies]
tags = []

[extra]
sidebar_heading = ""
sidebar_text = ""
+++
```

this stays at the very top of the .md file. tags is just the tags i put for my blog and zola automatically creates a index for whatever posts fall under that tag you can play with it in the config.toml i mentioned earlier. extra is well just extra stuff. there is also a little something that i have set up in my .bashrc so i dont have to copy paste this thing on every .md file i create for a blog.

```bash
tem() {
  if [ -z "$1" ]; then
    echo "Error: provide some name."
    return 1
  fi

  cp ~/blog-tem.md ~/asethcore.github.io/content/blog/"$1.md"
  python3 ~/asethcore.github.io/scripts/generate_graph.py
  echo "voila"
}
```

this was all that i did and i was doing, ig enough for this one. take care yall.

"dont overthink it" -the voidz
