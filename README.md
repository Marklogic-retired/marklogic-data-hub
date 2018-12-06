# Data Hub Framework Website

The [Data Hub Framework website](https://marklogic.github.io/marklogic-data-hub/) is published as [GitHub Pages](https://pages.github.com/).

The DHF website contains two types of docs:
- API docs
    - In the `develop` branch. Docs are embedded in the development source code.
    - Built with JavaDocs. The resulting static pages must be checked into the `docs` branch to be combined with the standard pages during the Jekyll build.
    - Different versions of the API docs appear in [the Javadocs page](https://marklogic.github.io/marklogic-data-hub/javadocs/).
- Standard files
    - In the `docs` branch. Topic files are in the `_pages` folder. Images are in the `images` folder.
    - Formatted with [Markdown](https://guides.github.com/features/mastering-markdown/).
    - Built with [Jekyll](https://jekyllrb.com/).

Changes pulled into the `docs` branch automatically trigger a Jekyll build.

The following instructions are for building on a local machine.


# Running the APIdocs Build

## Tools

- [Gradle 4.x+](https://docs.gradle.org/current/userguide/installation.html#installing_gradle)


## Steps

1. In your build machine, download the `develop` branch from GitHub.
1. In a Bash console, go to the root of the `develop` branch.
1. Run:
    ```
    ./gradlew javadoc
    ```
1. Copy the generated Javadoc files from `build/docs/javadoc` to a temporary location.
1. In GitHub,
    a. Create a new branch based on the `docs` branch. Example: `myjavadocs`.
    a. Switch to the `myjavadocs` branch.
1. Copy the Javadoc files from the temporary location to the appropriate version folder in the `javadocs` folder of the `myjavadocs` branch. Example: `javadocs/3.0.0`.
1. Check in and create a pull request for changes to be copied from the `myjavadocs` branch to the `docs` branch.


# Running the Jekyll Build

## Tools

- [Git](https://git-scm.com/downloads) (for commandline use)
- [Ruby v2.4.2 or greater](https://rubyinstaller.org/downloads/)
    - If you are using [RVM](https://rvm.io/), this project already includes .ruby-version and .ruby-gem files.
    - *IMPORTANT:* Run `ruby --v` to determine your Ruby version, and update the `.ruby-version` file with your current version.
- [Jekyll](https://jekyllrb.com/docs/installation/windows/)
    ```bash
    gem install jekyll bundler
    ```
- Ruby gems required by the build
    - To install,
        ```bash
        bundle install
        ```

## Steps

1. In your build machine, download the `docs` branch from GitHub. Then overwrite with locally updated files, including the newly built API docs pages.
1. In a Bash console, go to the root of the `docs` branch.
1. Run:
    ```bash
    jekyll serve
    ```
1. Wait until it says `Server running... press ctrl-c to stop.`
1. To view the built site, go to the specified `Server address". Example: `http://127.0.0.1:4000/marklogic-data-hub/`

### Future builds
In subsequent builds, get the latest versions of the gems first before running the build.
    ```bash
    bundle update
    jekyll serve
    ```

### Troubleshooting the Build
***Q:*** `C:/Ruby25-x64/lib/ruby/gems/2.5.0/gems/bundler-1.17.1/lib/bundler/runtime.rb:319:in `check_for_activated_spec!': You have already activated public_suffix 3.0.3, but your Gemfile requires public_suffix 2.0.5. Prepending `bundle exec` to your command may solve this. (Gem::LoadError)`
***A:*** Use this command instead: `bundle exec jekyll serve`


<!-- TODO: Verify if still true.
### Updating the Live website
There is a travis job that builds and deploys the website every time a push is made to the **dhf-website** branch.
-->
