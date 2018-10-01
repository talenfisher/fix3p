# FiX3P
FiX3P is a web application for editing header information within X3P files.  A hosted version is located at https://talenfisher.github.io/fix3p/

# Installation
## From Docker
```bash
PORT=80
docker pull talenfisher/fix3p
docker run -itd -p $PORT:80 --name fix3p talenfisher/fix3p
```
## From Source
```bash
git clone git@github.com:talenfisher/fix3p.git
bin/build
bin/start [PORT#]
```
If the port number is omitted, it will default to 80.  The image will mount the current working directory as a volume.  Furthermore, it will watch for changes made to sass and javascript files and rebuild the bundles.