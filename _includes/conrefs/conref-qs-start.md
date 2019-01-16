1. At a command-line window, run the QuickStart .war.
    - To use the default port number for the internal web server (port 8080):
      ```
      java -jar quick-start-{{ site.data.global.hub_version_4x }}.war
      ```
    - To use a custom port number; e.g., port 9000:
      ```
      java -jar quick-start-{{ site.data.global.hub_version_4x }}.war --server.port=9000
      ```
    {:.ol-substeps}

    {% include note-in-list.html type="NOTE" content="If you are using Windows and a firewall alert appears, click `Allow access`." %}

    **Result**

      {% assign full-imgpath = include.imgpath | append: "qs-4x-install.png" %}{% include thumbnail.html imgfile=full-imgpath %}
1. In a web browser, navigate to [`http://localhost:8080`](http://localhost:8080){:target="_blank"} to open the QuickStart UI.
{:.ol-steps}