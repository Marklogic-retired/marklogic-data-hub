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

xdmp:set-response-content-type("text/html"),
document {
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
            url: '/hub/v1/config/entities',
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
          <a id="logo" href="http://www.marklogic.com">MarkLogic</a>
          <span class="header-title">Data Hub in a Box</span>
        </div>
      </div>

      <div id="message-bar" class="swagger-ui-wrap">&nbsp;</div>
      <div id="swagger-ui-container" class="swagger-ui-wrap"></div>
    </body>
  </html>
}
