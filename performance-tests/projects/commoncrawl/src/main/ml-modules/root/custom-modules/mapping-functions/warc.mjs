'use strict';

function retrieveLocation(ip) {
  var sb = fn.tokenize(ip, "\\.").toArray ();
  var v=16777216* xs.int(sb[0])+ 65536*xs.int(sb[1]) + 256*xs.int(sb[2]) + xs.int(sb[3]);
  var l = cts.elementValues("ip_to", v, ("ascending", "limit=1"));
  var result = fn.head(cts.search(cts.elementRangeQuery("ip_to", "=", l), "unfiltered"));
  return result.root.envelope.instance;
}

function retrieveRecord (uri, type) {
  var doc =  fn.head(cts.search ((
     cts.andQuery (
       [
         cts.jsonPropertyValueQuery("WARC-Target-URI", uri),
         cts.jsonPropertyValueQuery("WARC-Type", type),
       ]
     )
  )))
  return doc.root.envelope.instance.Envelope
}


function retrieveSocialInfo(meta) {
   meta = meta["Head"]
   if (meta != null) 
       meta=meta["Metas"]
   var socialInfo = {}
   if (meta != null) {
    var keys = new Set(['og:site_name', 'twitter:site', 'fb:app_id', 'google-site-verification'])
    for (var i = 0; i < meta.length; ++i) {
      var item = meta[i]
      var name = item.name
      if (name == null)  {
         name = item.property 
      }
      if (name != null) {
         name = name.toString()
        if (name != null && keys.has(name)) {
            var l = Math.max(name.indexOf(":"), name.indexOf("-"));
            var n = name.slice(0, l);
            socialInfo[n] = item.content
         }
      }   
     }
   }
   return xdmp.toJSON(socialInfo)  
}


function retrieveMetadata(uri) {
    var doc = retrieveRecord (uri, "metadata")
    var warcRecords = doc["Payload-Metadata"]["WARC-Metadata-Metadata"]["Metadata-Records"]
    var warcInfo = {}
    for (var i = 0; warcRecords != null && i < warcRecords.length; ++i) {
       var item = warcRecords[i]
       var name = item.Name.toString()
       if (name == "languages-cld2") {
         var languages = JSON.parse(item.Value).languages
         var res = [];
         for (var l = 0; languages != null && l < languages.length; ++l) {
           res.push ( languages[l].name)
         }  
         warcInfo ["languages"] = res
      } else {
         warcInfo[name.replace ("-", "_")] = item.Value
      }
    }
    return xdmp.toJSON(warcInfo)

}


function retrieveHost(uri) {
    var doc = retrieveRecord (uri, "request")
   
    return doc["Payload-Metadata"]["HTTP-Request-Metadata"]["Headers"]["Host"]
   
}


function normalizeServer (server) {
  server = server.toString().split(" ") [0]
  server = server.split("/") [0]
  return server
}

function getLocation(href) {
    // source: https://stackoverflow.com/questions/736513/how-do-i-parse-a-url-into-hostname-and-path-in-javascript
    // apparently URL is not defined in v8.
    var match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
    return match && {
        href: href,
        protocol: match[1],
        host: match[2],
        hostname: match[3],
        port: match[4],
        pathname: match[5],
        search: match[6],
        hash: match[7]
    }
}

function retrieveLinks (metadata) {
  var links = metadata.Links
  var res = new Set([])
   for (var i = 0; links != null && i < links.length; ++i) {
     var l = links[i]
     if (l.url != null) l = l.url
     else if (l.href != null)  l = l.href
     if (l != null) { 
       const url = getLocation(l.toString());
       if (url != null) res.add(url.hostname)
     }  
  }
  res = { "references":  Array.from(res)}
  return xdmp.toJSON(res)

}


export {
   retrieveLocation, retrieveMetadata, retrieveSocialInfo, retrieveHost, normalizeServer, retrieveLinks
}
