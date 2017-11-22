# Data Hub Framework Website
This branch contains the code that generates the github.io website for the DHF.

Before you can get going you must have a recent version of Ruby installed.

This project also has .ruby-version and .ruby-gem files if you are using [RVM](https://rvm.io/).

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

# Coding

This website is written using [Jekyll](https://jekyllrb.com/) and Markdown. You can read about creating github pages websites [here](https://pages.github.com/).

### Run the Jekyll Server
```bash
jekyll serve --incremental
```


### Updating the Live website
There is a travis job that builds and deploys the website every time a push is made to the **dhf-website** branch.
