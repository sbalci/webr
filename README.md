# webR-quarto-demos

This is a fork of https://github.com/coatless-r-n-d/webR-quarto-demos. I moved the setup code into separate html and qmd files and then use includes in the qmd.

To make your own version:

* Fork
* Turn on GitHub Pages at main branch.
* Go to your <yourusername>.github.io repo. Copy the files `webr-serviceworker.js` and `webr-worker.js` into them. I don't know why. But somehow the html can't find them otherwise. I am assuming you have GitHub Pages on for that repo so `<yourusername>.github.io` exists.
* Your demo will now be visible at `<yourusername>.github.io/webR-quarto-demos/webr-quarto.html`

I tried a few ways to get the html page to find the `webr-serviceworker.js` and `webr-worker.js` files in this demo repo, but no luck. I don't know html well enough.

Example: 

* [rverse-tutorials.github.io/webR-quarto-demos/webr-quarto.html](rverse-tutorials.github.io/webR-quarto-demos/webr-quarto.html)
* [rverse-tutorials.github.io/webR-quarto-demos/webr-quarto-html-demo.html](rverse-tutorials.github.io/webR-quarto-demos/webr-quarto-html-demo.html)

## Acknowledgements

This is a fork of work by James J Balamuta:
- [Quarto HTML Document with WebR](https://github.com/coatless-r-n-d/webR-quarto-demos)
]
To explore use of WebR in Quarto. [WebR v0.1.0](https://twitter.com/gwstagg/status/1633821049329537025) was launched on March 9th
by George Stagg ([georgestagg](https://github.com/georgestagg)) and Lionel Henry ([lionel-](https://github.com/lionel-)). 

The `_webr-setup.qmd` and `webr-setup.html` files are the key setup files and are all the work of James J Balamuta in this [file](https://github.com/coatless-r-n-d/webR-quarto-demos/blob/main/webr-quarto-html-demo.qmd).
