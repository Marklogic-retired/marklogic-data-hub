(:
  Copyright 2012-2016 MarkLogic Corporation

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
:)
xquery version "1.0-ml";

module namespace s = "http://marklogic.com/hub-in-a-box/swagger-lib";

(:import module namespace hul = "http://marklogic.com/hub-in-a-box/hub-utils-lib"
  at "/com.marklogic.hub/lib/hub-utils-lib.xqy";:)

declare option xdmp:mapping "false";

declare function s:collector()
{
  map:entry(
    "/collector",
    map:new((
      map:entry(
        "post",
        map:new((
          map:entry("tags", json:to-array(("collector"))),
          map:entry("summary", "Runs a Collector by name."),
          map:entry("consumes", json:to-array(("application/json"))),
          map:entry("produces", json:to-array(("application/json"))),
          map:entry("parameters", json:to-array((
            map:new((
              map:entry("name", "rs:name"),
              map:entry("in", "query"),
              map:entry("description", "the name of the collector to run"),
              map:entry("required", fn:true()),
              map:entry("type", "string")
            )),
            map:new((
              map:entry("name", "body"),
              map:entry("in", "body"),
              map:entry("description", "the options to pass to the collector"),
              map:entry("required", fn:true()),
              map:entry("schema", map:new((
                map:entry("$ref", "#/definitions/CollectorOptions")
              )))
            ))
          )))
        ))
      ),

      map:entry(
        "get",
        map:new((
          map:entry("tags", json:to-array(("collector"))),
          map:entry("summary", "Runs a Collector with a Flow Config."),
          map:entry("produces", json:to-array(("application/json"))),
          map:entry("parameters", json:to-array((
            map:new((
              map:entry("name", "rs:flow-name"),
              map:entry("in", "query"),
              map:entry("description", "the name of the flow to use"),
              map:entry("required", fn:true()),
              map:entry("type", "string")
            ))
          )))
        ))
      )
    ))
  )
};

declare function s:transformer()
{
  map:entry(
    "/transformer",
    map:new((
      map:entry(
        "post",
        map:new((
          map:entry("tags", json:to-array(("transformer"))),
          map:entry("summary", "Runs a Transformer by name."),
          map:entry("consumes", json:to-array(("application/json"))),
          map:entry("produces", json:to-array(("application/json"))),
          map:entry("parameters", json:to-array((
            map:new((
              map:entry("name", "rs:name"),
              map:entry("in", "query"),
              map:entry("description", "the name of the transformer to run"),
              map:entry("required", fn:true()),
              map:entry("type", "string")
            )),
            map:new((
              map:entry("name", "rs:id"),
              map:entry("in", "query"),
              map:entry("description", "the id of the item to transformer"),
              map:entry("required", fn:true()),
              map:entry("type", "string")
            )),
            map:new((
              map:entry("name", "body"),
              map:entry("in", "body"),
              map:entry("description", "the options to pass to the transformer"),
              map:entry("required", fn:true()),
              map:entry("schema", map:new((
                map:entry("$ref", "#/definitions/TransformerOptions")
              )))
            ))
          )))
        ))
      ),

      map:entry(
        "get",
        map:new((
          map:entry("tags", json:to-array(("transformer"))),
          map:entry("summary", "Runs a Transformer with a Flow Config."),
          map:entry("produces", json:to-array(("application/json"))),
          map:entry("parameters", json:to-array((
            map:new((
              map:entry("name", "rs:flow-name"),
              map:entry("in", "query"),
              map:entry("description", "the name of the flow to use"),
              map:entry("required", fn:true()),
              map:entry("type", "string")
            ))
          )))
        ))
      )
    ))
  )
};

declare function s:swagger-path($name)
{
  map:entry(
    "/" || $name || "/test",
    map:new((
      map:entry(
        "post",
        map:new((
          map:entry("tags", json:to-array(($name))),
          map:entry("summary", "Test the " || $name || " transformer."),
          map:entry("consumes", json:to-array(("application/json", "text/xml"))),
          map:entry("produces", json:to-array(("application/json", "text/xml"))),
          map:entry("parameters", json:to-array((
            map:new((
              map:entry("name", "body"),
              map:entry("in", "body"),
              map:entry("description", "the document to process"),
              map:entry("required", fn:true()),
              map:entry("schema", map:new((
                map:entry("$ref", "#/definitions/Transformer")
              )))
            ))
          )))
        ))
      )
    ))
  )
};

declare function s:swagger-json()
{
  map:new((
    map:entry("swagger", "2.0"),
    map:entry("info", map:new((
      map:entry("description", "hi"),
      map:entry("title", "Hub in a Box"),
      map:entry("version", "1.0.0")
    ))),
    map:entry("host", xdmp:get-request-header("Host", xdmp:host-name())),
    map:entry("basePath", "/v1/resources"),
    map:entry("consumes", json:to-array(("application/json", "applicaiton/xml"))),
    map:entry("produces", json:to-array(("application/json", "text/xml", "text/html"))),
    map:entry("tags", json:to-array(())),
    map:entry("schemes", json:to-array(("http"))),
    map:entry("paths",
      map:new((
        s:collector(),
        s:transformer()
(:
        for $x in "blah"
        return
          s:swagger-path($x):)
      ))
    ),
    map:entry("securityDefinitions", ""),
    map:entry("definitions", map:new((
      map:entry("Transformer", map:new((
        map:entry("type", "object"),
        map:entry("required", json:to-array(("options", "input"))),
        map:entry("properties", map:new((
          map:entry("options", map:new((
            map:entry("type", "object"),
            map:entry("properties", map:new((
              map:entry("root", map:new((
                map:entry("type", "object"),
                map:entry("required", json:to-array(("ns", "name"))),
                map:entry("properties", map:new((
                  map:entry("ns", map:new((
                    map:entry("type", "string"),
                    map:entry("example", "http://customer.com/envelope")
                  ))),
                  map:entry("name", map:new((
                    map:entry("type", "string"),
                    map:entry("example", "envelope")
                  )))
                )))
              ))),
              map:entry("header", map:new((
                map:entry("type", "object"),
                map:entry("properties", map:new((
                  map:entry("xpath-extract", map:new((
                    map:entry("type", "object"),
                    map:entry("properties", map:new((
                      map:entry("src", map:new((
                        map:entry("type", "string"),
                        map:entry("example", "/path/to/element")
                      ))),
                      map:entry("ns", map:new((
                        map:entry("type", "string"),
                        map:entry("example", "http://customer.com/ns/for/target/element")
                      ))),
                      map:entry("dst", map:new((
                        map:entry("type", "string"),
                        map:entry("example", "target-element-name")
                      )))
                    )))
                  )))
                )))
              )))
            )))
          ))),
          map:entry("input", map:new((
            map:entry("type", "string")
          )))
        )))
      )))
    ))),
    map:entry("externalDocs", "")
  )) ! xdmp:to-json(.)
};
