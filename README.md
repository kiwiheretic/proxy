# Proxy

phantom proxy with django front end

To clone: git clone --recursive https://github.com/kiwiheretic/proxy.git  
If you forget to use --recursive you have to cd into the submodule 
directory and

```
$ git submodule update --init --recursive
```

currently this is optparse-js/ and sprintf/ folders.  

This should satisfy any git module dependencies  

To setup django for first time:  

```
$ virtualenv ~/venvs/proxy
$ source ~/venvs/proxy/bin/activate
$ pip install -r requirements.txt
$ ./manage.py migrate
```

To run:  

```
$ export PRXY_OUTPUT_DIR="<your output directory"  
$ phantomjs proxy.js --port 5001
```

To run django front end:  

```
$ virtualenv ~/venvs/proxy
$ source ~/venvs/proxy/bin/activate
$ ./manage.py runserver 0.0.0.0:5000
```

access via web browser url

http://\<ip\>:5000

