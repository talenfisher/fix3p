# FiX3P
FiX3P is a web application and chrome extension for editing header information within X3P files.  A hosted version is located at https://talenfisher.github.io/fix3p/.  Developed for [@CSAFE-ISU](https://github.com/CSAFE-ISU)

# Installation
Note: you do not have to install both.  The chrome extension works independently.

## Web App
### From Docker
```bash
PORT=80
docker pull talenfisher/fix3p
docker run -itd -p $PORT:80 --name fix3p talenfisher/fix3p
```
### From Source
```bash
git clone git@github.com:talenfisher/fix3p.git
bin/build
bin/start [PORT#]
```
If the port number is omitted, it will default to 80.  The image will mount the current working directory as a volume.  Furthermore, it will watch for changes made to sass and javascript files and rebuild the bundles.

## Chrome Extension
Visit the [chrome store](https://chrome.google.com/webstore/detail/fix3p/ffochpnkiambfombejldglggmpebjpjj?utm_source=chrome-ntp-icon) to install the FiX3P chrome extension.  Once installed, complete the [setup instructions](https://talenfisher.github.io/fix3p/setup.html).  

# Usage
## Web App
Drag and drop a valid X3P file onto the upload stage, then FiX3P will display an editor.  After editing the fields, you may download the edited file using the download button in the top left corner.

## Chrome Extension
In your operating system's file explorer or equivalent, use the "open with/open in" option to open X3P files in Google Chrome.  The FiX3P editor will automatically display for local X3P files.