# Installation + Testing

Only tested on Ubuntu 14.04 LTS

Install:

- BGPInspector (e.g. git clone https://github.com/swp15/BGPInspector.git)
- django 1.8 or higher (e.g. with: pip install django)
- virtualenv (e.g. apt-get install python-virtualenv)

Testing:

- cd BGPInspector 
- . ./initDjangoUser.sh
- cd django-py3/BGPInspector
- ./startVirtServer.sh (The webapp should be running unter 'http://127.0.0.1:8000/bgpWebApp/')

Feedback is always appreciated!
