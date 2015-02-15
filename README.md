# node-proxy-filter
A Node.JS proxy server for injecting local resources on remote websites. 

## DESCRIPTION

Testing remote websites and replacing resources such as .js, .css files,
image, etc. with local files.

This script opens up local static server, which serves files from the
current working directory. It also opens up a proxy server on port 8080
(this can be changed) which replaces remote files with the ones found 
in the local directory.

## INSTALLATION

```bash
$ sudo npm install -g
```

## USAGE

```bash
$ nproxy
```

The above command will start a proxy server on port 8080.
When the user visits a site via this proxy server, the script will replace
all the remote requested files with the ones found in the local directory.

```
$ nproxy jquery.js
```

In the above command we specify the files we want our proxy server 
to look for in the requests and replace them. These files must reside 
in the current directory.

## TO DO

* Implement HTTPS
* Investigate `getaddrinfo ENOTFOUND` and `connect ECONNREFUSED` errors