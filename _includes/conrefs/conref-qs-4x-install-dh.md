In the QuickStart UI,


{% assign full-imgpath = include.imgpath | append: "qs-4x-install-wiz01-projdir.png" %}
{% include step-collapsed.html
   steptext="Browse to your project root directory. Then click <span class='inline-button'>NEXT</span>."
   stepimg=full-imgpath
%}


{% assign full-imgpath = include.imgpath | append: "qs-4x-install-wiz02-projinit-short.png" %}
{% include step-collapsed.html
   steptext="Click <span class='inline-button'>INITIALIZE</span> to initialize your project directory."
   stepimg=full-imgpath
%}


{% assign full-imgpath = include.imgpath | append: "qs-4x-install-wiz03-projinit-done.png" %}
{% include step-collapsed.html
   steptext="After initializing your Data Hub Framework project, your project directory contains additional files and directories. Click <span class='inline-button'>NEXT</span>."
   stepimg=full-imgpath
%}


{% assign full-imgpath = include.imgpath | append: "qs-4x-install-wiz04-projenv.png" %}
{% include step-collapsed.html
   steptext="Choose the <code>local</code> environment, then click <span class='inline-button'>NEXT</span>."
   stepimg=full-imgpath
%}


{% assign full-imgpath = include.imgpath | append: "qs-4x-install-wiz05-login.png" %}
{% include step-collapsed.html
   steptext="Enter your MarkLogic Server credentials, then click <span class='inline-button'>LOGIN</span>."
   stepimg=full-imgpath
%}


{% assign full-imgpath = include.imgpath | append: "qs-4x-install-wiz06-instdhf.png" %}
{% include step-collapsed.html
   steptext="Click <span class='inline-button'>INSTALL</span> to install the data hub into MarkLogic."
   stepimg=full-imgpath
%}
{:.ol-steps}


Progress information is displayed while the Data Hub Framework is installed and your data hub is initialized.
  {% assign full-imgpath = include.imgpath | append: "qs-4x-install-wiz07-dhf-progress-30pc.png" %}{% include thumbnail.html imgfile=full-imgpath alttext="" tab="  " %}
  