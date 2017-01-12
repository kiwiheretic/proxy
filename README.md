## Django Proxy Front End to PhantomJS

### Why?

PhantomJS handling of binary files is broken and therefore is not suitable as a complete proxy.  See https://github.com/ariya/phantomjs/issues/13026.  (Yes, this may be fixed in trunk but its not fixed yet in the binary releases and phantomjs is formidable to compile.)


