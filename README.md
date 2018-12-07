# Data Hub Framework Website
This branch contains the code that generates the github.io website for the DHF.

Before you can get going you must have Ruby installed. This project has .ruby-version and .ruby-gem files if you are using [RVM](https://rvm.io/).

This process has been tested successfully on Ruby version 2.4.2.

```
$ ruby --version
ruby 2.4.2...
```

# Setup

### Ensure necessary tools are installed
```bash
gem install bundler
gem install jekyll
```

### Install the necessary Ruby gems
```bash
bundle install
```

# Viewing the Website

This website is written using [Jekyll](https://jekyllrb.com/) and Markdown. You can read about creating github pages websites [here](https://pages.github.com/).

### Run the Jekyll Server
```bash
jekyll serve
```

Open the docs website at the server address displayed in the terminal, e.g.: 

`http://127.0.0.1:4000/marklogic-data-hub/`

### Making Content Changes

Most of the content is located in `_pages` with screenshots in `images`. Making changes to files in the site prompts Jekyll to regenerate the website.

### Updating the Live website
There is a travis job that builds and deploys the website every time a push is made to the **dhf-website** branch.

# Building DHF Javadocs

You can run a Gradle task to build [Javadoc](https://en.wikipedia.org/wiki/Javadoc) pages for the Data Hub Framework. From the project root of, for example, the develop branch (_not_ the docs branch) run the following:
  
```
./gradlew javadoc
```
  
The static Javadoc files are generated in the following folder:

```
marklogic-data-hub/build/docs/javadoc
```

## Adding to the Documentation

You can commit those files to a version folder on the docs branch to display them in the DHF documentation, e.g.:
  
```
javadocs/3.0.0
```
  
Links to the different versions are dynamically displayed on the Docs > Javadocs documentation page.
