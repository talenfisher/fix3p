# FiX3P [![Build Status](https://travis-ci.org/talenfisher/fix3p.svg?branch=master)](https://travis-ci.org/talenfisher/fix3p)
FiX3P is a web application for editing X3P files, provided by [CSAFE](https://forensicstats.org). A hosted version is located [here](https://talenfisher.github.io/fix3p).  


# Table of Contents
1. [Installation](#installation)
    1. [Chrome Web Store](#chrome-web-store)
    2. [Docker](#docker)
    3. [From Source](#from-source)
2. [Usage](#usage)
    1. [General Usage](#general-usage)
    2. [Chrome Extension](#chrome-extension)

# Installation
Note: if you install the chrome extension, you do not have to install the web application.  They both work independently.  

## Chrome Extension
Visit the [chrome web store](https://chrome.google.com/webstore/detail/fix3p/ffochpnkiambfombejldglggmpebjpjj?utm_source=chrome-ntp-icon) to install the FiX3P chrome extension.  Once installed, complete the [setup instructions](https://talenfisher.github.io/fix3p/setup.html). 

## Docker
```bash
PORT=80
docker pull talenfisher/fix3p
docker run -itd -p $PORT:80 --name fix3p talenfisher/fix3p
```

## From Source
```bash
port=80
git clone git@github.com:talenfisher/fix3p.git
bin/build
bin/start $PORT
```
If the port number is omitted, it will default to 80.  The image will mount the current working directory as a volume.  Furthermore, it will watch for changes made to sass & javascript files and rebuild the bundles.

# Usage / Features

## General Usage
1. Drag-and-drop an X3P file onto the upload stage
2. Edit the manifest file's fields and/or select vertex regions
3. Click Download or press ctrl-s to save your changes and close the editor
4. Rinse and repeat

## Chrome Extension
- Use your operating system's file explorer or equivalent, use the "open with/open in" option to open X3P files in Google Chrome.
- Quickly access FiX3P via an icon labelled "X3P" next to the omnibar/search bar.  
