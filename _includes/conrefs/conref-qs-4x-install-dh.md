1. Open a web browser, and navigate to [`http://localhost:8080`](http://localhost:8080){:target="_blank"}.


{% assign full-imgpath = include.imgpath | append: "qs-4x-install-wiz01-projdir.png" %}
{% include step-collapsed.html
   steptext="Browse to your project root directory. Then click <span class='inline-button'>NEXT</span>."
   stepimg=full-imgpath
   imgclass="img-50"
%}


{% assign full-imgpath = include.imgpath | append: "qs-4x-install-wiz02-projinit-short.png" %}
{% include step-collapsed.html
   steptext="Click <span class='inline-button'>INITIALIZE</span> to initialize your project directory."
   stepimg=full-imgpath
   imgclass="img-50"
%}


{% assign full-imgpath = include.imgpath | append: "qs-4x-install-wiz03-projinit-done.png" %}
{% include step-collapsed.html
   steptext="After initializing your Data Hub Framework project, your project directory contains additional files and directories. Click <span class='inline-button'>NEXT</span>."
   stepimg=full-imgpath
   imgclass="img-50"
%}


{% assign full-imgpath = include.imgpath | append: "qs-4x-install-wiz04-projenv.png" %}
{% include step-collapsed.html
   steptext="Choose the <code>local</code> environment, then click <span class='inline-button'>NEXT</span>."
   stepimg=full-imgpath
   imgclass="img-50"
%}


{% assign full-imgpath = include.imgpath | append: "qs-4x-install-wiz05-login.png" %}
{% include step-collapsed.html
   steptext="Enter your MarkLogic Server credentials, then click <span class='inline-button'>LOGIN</span>."
   stepimg=full-imgpath
   imgclass="img-50"
%}


{% assign full-imgpath = include.imgpath | append: "qs-4x-install-wiz06-instdhf.png" %}
{% include step-collapsed.html
   steptext="Click <span class='inline-button'>INSTALL</span> to install the data hub into MarkLogic."
   stepimg=full-imgpath
   imgclass="img-50"
%}


{% assign full-imgpath = include.imgpath | append: "qs-4x-install-wiz07-dhf-progress-30pc.png" %}
{% include step-collapsed.html
   steptext="Wait for the installation to complete."
   stepimg=full-imgpath
   imgclass="screenshot"
%}


{% assign full-imgpath = include.imgpath | append: "qs-4x-install-wiz08-complete.png" %}
{% include step-collapsed.html
   steptext="When installation is complete, Click <span class='inline-button'>FINISHED</span>."
   stepimg=full-imgpath
   imgclass="img-50"
%}
{:.ol-steps}