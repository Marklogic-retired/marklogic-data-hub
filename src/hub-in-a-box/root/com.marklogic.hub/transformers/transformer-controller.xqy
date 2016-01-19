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

declare namespace tc = "http://marklogic.com/hub-in-a-box/transformer-controller";

import module namespace flow = "http://marklogic.com/hub-in-a-box/flow-lib"
  at "/com.marklogic.hub/lib/flow-lib.xqy";

(:import module namespace hul = "http://marklogic.com/hub-in-a-box/hub-utils-lib"
  at "/com.marklogic.hub/lib/hub-utils-lib.xqy";
:)
(:import module namespace json="http://marklogic.com/xdmp/json"
 at "/MarkLogic/json/json.xqy";:)

import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
    at "/MarkLogic/rest-api/lib/endpoint-util.xqy";

declare option xdmp:mapping "false";

declare variable $transformer-name := xdmp:get-request-field("transformer-name", ());
declare variable $action := xdmp:get-request-field("action", "test");

declare function tc:swagger()
{
  xdmp:set-response-content-type("application/json"),
  map:new((
    map:entry("swagger", "2.0"),
    map:entry("info", map:new((
      map:entry("description", "hi"),
      map:entry("title", $transformer-name),
      map:entry("version", "1.0.0")
    ))),
    map:entry("host", xdmp:get-request-header("Host", xdmp:host-name())),
    map:entry("basePath", "/hub/transformers"),
    map:entry("consumes", json:to-array(("application/json", "applicaiton/xml"))),
    map:entry("produces", json:to-array(("application/json", "text/xml", "text/html"))),
    map:entry("tags", json:to-array(())),
    map:entry("schemes", json:to-array(("http"))),
    map:entry("paths",
      map:new((
        map:entry(
          "/" || $transformer-name,
          map:new((
            map:entry(
              "get",
              map:new((
                map:entry("tags", json:to-array(($transformer-name))),
                map:entry("summary", "info page about " || $transformer-name),
                map:entry("produces", json:to-array(("text/html")))
              ))
            )
          ))
        ),
        map:entry(
          "/" || $transformer-name || "/test",
          map:new((
            map:entry(
              "post",
              map:new((
                map:entry("tags", json:to-array(($transformer-name))),
                map:entry("summary", "Test the " || $transformer-name || " transformer."),
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
  ))
};

declare function tc:swagger-ui()
{
  xdmp:set-response-content-type("text/html"),
  '<!DOCTYPE html>',
  <html>
    <head>
      <meta charset="UTF-8"/>
      <title>Swagger UI</title>
      <link href='swagger/css/typography.css' media='screen' rel='stylesheet' type='text/css'/>
      <link href='swagger/css/reset.css' media='screen' rel='stylesheet' type='text/css'/>
      <link href='swagger/css/screen.css' media='screen' rel='stylesheet' type='text/css'/>
      <link href='swagger/css/reset.css' media='print' rel='stylesheet' type='text/css'/>
      <link href='swagger/css/print.css' media='print' rel='stylesheet' type='text/css'/>
      <script src='swagger/lib/jquery-1.8.0.min.js' type='text/javascript'>{" "}</script>
      <script src='swagger/lib/jquery.slideto.min.js' type='text/javascript'>{" "}</script>
      <script src='swagger/lib/jquery.wiggle.min.js' type='text/javascript'>{" "}</script>
      <script src='swagger/lib/jquery.ba-bbq.min.js' type='text/javascript'>{" "}</script>
      <script src='swagger/lib/handlebars-2.0.0.js' type='text/javascript'>{" "}</script>
      <script src='swagger/lib/underscore-min.js' type='text/javascript'>{" "}</script>
      <script src='swagger/lib/backbone-min.js' type='text/javascript'>{" "}</script>
      <script src='swagger/lib/swagger-ui.js' type='text/javascript'>{" "}</script>
      <script src='swagger/lib/highlight.7.3.pack.js' type='text/javascript'>{" "}</script>
      <script src='swagger/lib/jsoneditor.min.js' type='text/javascript'>{" "}</script>
      <script src='swagger/lib/marked.js' type='text/javascript'>{" "}</script>

      <script type="text/javascript">
        $(function () {{
          window.swaggerUi = new SwaggerUi({{
            url: '/hub/transformers/{$transformer-name}/swagger.json',
            dom_id: "swagger-ui-container",
            supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
            onComplete: function(swaggerApi, swaggerUi){{
              $('pre code').each(function(i, e) {{
                hljs.highlightBlock(e);
              }});
            }},
            docExpansion: 'none',
            jsonEditor: false,
            apisSorter: 'alpha',
            defaultModelRendering: 'schema',
            showRequestHeaders: false,
            validatorUrl: null
          }});

          window.swaggerUi.load();
      }});
      </script>
    </head>

    <body class="swagger-section">
      <div id='header'>
        <div class="swagger-ui-wrap">
          <a id="logo" href="http://swagger.io">MarkLogic</a>
          <span class="header-title">Data Hub in a Box</span>
        </div>
      </div>

      <div id="message-bar" class="swagger-ui-wrap">&nbsp;</div>
      <div id="swagger-ui-container" class="swagger-ui-wrap"></div>
    </body>
  </html>
};


declare function tc:index()
{
  xdmp:set-response-content-type("text/html"),
  <html>
    <body>
      <h1>{$transformer-name}</h1>
      <h2>Headers</h2>
      <ul>
      {
        for $h in xdmp:get-request-header-names()
        return
          <li>{$h || " => " || xdmp:get-request-header($h)}</li>
      }
      </ul>
      <ul>
        <li><a href="{$transformer-name}/swagger">swagger docs</a></li>
        <li><a href="{$transformer-name}/run">Run it</a></li>
        <li><a href="{$transformer-name}/test">Test it</a></li>
      </ul>
    </body>
  </html>
};

declare function tc:run()
{
  ()
};

declare function tc:test()
{
  ()
(:  let $body :=
    let $b := xdmp:get-request-body()
    return
      if ($b/object-node()) then $b
        (:json:transform-from-json($b):)
      else
        $b/*
  let $options := $body/*:options
  let $doc :=
    document {
      $body/*:input/node()
    }
  let $flow :=
    if ($options instance of object-node()) then
      document {
        object-node {
          "transformers": array-node {
            object-node {
              "module": $transformer-name,
              "options": $options
            }
          }
        }
      }
    else
      flow:to-json(
        <flow xmlns="http://marklogic.com/hub-in-a-box">
          <transformers>
            <transformer module="{$transformer-name}" function="transform">
              {$options}
            </transformer>
          </transformers>
        </flow>)
  let $resp := flow:run-transformers($flow, "/test", $doc)
  return
    map:get($resp, "value"):)
};

xdmp:log(("action:", $action)),
switch ($action)
  case "run" return
    tc:run()
  case "test" return
    tc:test()
  case "swagger.json" return
    tc:swagger()
  case "swagger" return
    tc:swagger-ui()
  default return
    tc:index()
