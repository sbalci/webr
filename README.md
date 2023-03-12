# webr

## resources

- [WebR Website](https://docs.r-wasm.org/webr/latest/)

- [WebR GitHub](https://github.com/r-wasm/webr/)

- [WebR Code Extension for Quarto](https://github.com/coatless/quarto-webr)

- [hrbrmstr/webr-experiments](https://github.com/hrbrmstr/webr-experiments)

- [rud.is/webr-dash/](https://rud.is/webr-dash/)

- <https://jupyter.r-wasm.org/lab/index.html>

- [WebR Utility Functions](https://observablehq.com/@hrbrmstr/webr-utility-functions)




## js file locations on main <user>github.io repo

- <https://github.com/sbalci/sbalci.github.io/blob/master/webr-serviceworker.js>

- <https://github.com/sbalci/sbalci.github.io/blob/master/webr-worker.js>

- <https://github.com/sbalci/sbalci.github.io/blob/master/webr.js>

- <https://github.com/sbalci/sbalci.github.io/blob/master/webr.mjs>


## working examples


- example from r-wasm webr: <https://sbalci.github.io/webr/deneme.html>

- webr demo: <https://sbalci.github.io/webr/webr-demo/index.html>

- quarto demo as a single file: <https://sbalci.github.io/webr/webr-quarto-html-demo.html>

- quarto demo setup separated (separate qmd and html necessary) : <https://sbalci.github.io/webr/webr-quarto.html>

- quarto extension: <https://sbalci.github.io/webr/webr2.html>


---

# Copied from repos below: 



## [webR-quarto-demos](https://github.com/coatless-r-n-d/webR-quarto-demos)

This repository houses experiments with generating a standalone [Quarto Document](https://quarto.org/) using [WebR](https://docs.r-wasm.org/webr/latest/).

- [Quarto HTML Document with WebR](https://rd.thecoatlessprofessor.com/webR-quarto-demos/webr-quarto-html-demo.html) ([Source](webr-quarto-html-demo.qmd))

### Background

[WebR v0.1.0](https://twitter.com/gwstagg/status/1633821049329537025) was launched on March 9th
by George Stagg ([georgestagg](https://github.com/georgestagg)) and Lionel Henry ([lionel-](https://github.com/lionel-)). The goal of webR is to: 

> run R code in the browser without the need for an R server to execute the code

This is an _amazing_ advancement of _R_ and has major implications with teaching R to the masses in an active learning context!

### Acknowledgements

This repository leans _heavily_ on the webR developers public-facing examples:

- [Source of Tidyverse Blog Post](https://github.com/tidyverse/tidyverse.org/pull/617/files) and [Minor fix](https://github.com/tidyverse/tidyverse.org/commit/72bb2dd7ca0b2f211498a891aa54f55ddcad5014)
- [webR documentation landing page](https://github.com/r-wasm/webr/blob/53acd8861c44f1f167941d0a40f62b0cc23852da/src/docs/index.qmd#L23-L68) ([Live page](https://docs.r-wasm.org/webr/latest/))









---




## [webR-quarto-demos](https://github.com/RVerse-Tutorials/webR-quarto-demos)

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

### Acknowledgements

This is a fork of work by James J Balamuta:
- [Quarto HTML Document with WebR](https://github.com/coatless-r-n-d/webR-quarto-demos)
]
To explore use of WebR in Quarto. [WebR v0.1.0](https://twitter.com/gwstagg/status/1633821049329537025) was launched on March 9th
by George Stagg ([georgestagg](https://github.com/georgestagg)) and Lionel Henry ([lionel-](https://github.com/lionel-)). 

The `_webr-setup.qmd` and `webr-setup.html` files are the key setup files and are all the work of James J Balamuta in this [file](https://github.com/coatless-r-n-d/webR-quarto-demos/blob/main/webr-quarto-html-demo.qmd).


