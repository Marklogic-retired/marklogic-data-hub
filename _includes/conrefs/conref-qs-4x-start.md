1. Open a command-line window, and navigate to your DHF project root directory.
1. Run the QuickStart .war.
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
{:.ol-steps}