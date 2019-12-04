# FiX3P [![Build Status](https://travis-ci.org/talenfisher/fix3p.svg?branch=master)](https://travis-ci.org/talenfisher/fix3p) ![](https://img.shields.io/github/release-pre/talenfisher/fix3p.svg) ![](https://img.shields.io/david/talenfisher/fix3p.svg)


FiX3P is a web application for editing X3P files, provided by [CSAFE](https://forensicstats.org). A hosted version is located [here](https://talenfisher.github.io/fix3p).  


# Table of Contents

- [FiX3P ![Build Status](https://travis-ci.org/talenfisher/fix3p) ![](https://img.shields.io/github/release-pre/talenfisher/fix3p.svg) ![](https://img.shields.io/david/talenfisher/fix3p.svg)](#fix3p-build-statushttpstravis-ciorgtalenfisherfix3p-httpsimgshieldsiogithubrelease-pretalenfisherfix3psvg-httpsimgshieldsiodavidtalenfisherfix3psvg)
- [Table of Contents](#table-of-contents)
- [Installation](#installation)
  - [Chrome Extension](#chrome-extension)
  - [Docker](#docker)
  - [From Source](#from-source)
- [Usage / Features](#usage--features)
  - [General Usage](#general-usage)
  - [Chrome Extension](#chrome-extension-1)
  - [Settings](#settings)
    - [Crash Reporting](#crash-reporting)
    - [Render Decimation](#render-decimation)
    - [Presets](#presets)

# Installation
Note: if you install the chrome extension, you do not have to install the web application.  They both work independently.  

## Chrome Extension
Visit the [chrome web store](https://chrome.google.com/webstore/detail/fix3p/ffochpnkiambfombejldglggmpebjpjj?utm_source=chrome-ntp-icon) to install the FiX3P chrome extension.  Once installed, complete the [setup instructions](https://talenfisher.github.io/fix3p/setup.html). 

## Docker
```bash
docker pull talenfisher/fix3p
docker run -itd -p $PORT:80 talenfisher/fix3p
```

## From Source
```bash
git clone git@github.com:talenfisher/fix3p.git && cd fix3p
npm install
```

After installing from source, run `npm run develop` to both start the server and watch for changes. 

# Usage / Features

## General Usage
1. Drag-and-drop an X3P file onto the upload stage
2. Edit the manifest file's fields and/or annotate the X3P's surface
3. Click Download or press ctrl-s to save your changes and close the editor
4. Rinse and repeat

## Chrome Extension
- Use your operating system's file explorer or equivalent, use the "open with/open in" option to open X3P files in Google Chrome.
- Quickly access FiX3P via an icon labelled "X3P" next to the omnibar/search bar.  

## Settings
Go to /settings.html on hosted versions or right-click on the FiX3P icon and select "Options" to access the settings page of FiX3P.

### Crash Reporting
To enable automatic crash reporting, [enable the setting.](https://github.com/talenfisher/fix3p/wiki/Crash-Reporting)

### Render Decimation
If you do not have powerful enough hardware to render high-polygon X3P files, you may turn on render decimation.  Control this by moving the render decimation slider left or right on the settings page.  Left = more polygons, right = less polygons.

### Presets
To set default annotations and backgrounds, [use mask & annotation preset files.](https://github.com/talenfisher/fix3p/wiki/Mask-&-Annotation-Presets)