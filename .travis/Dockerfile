FROM centos:centos7

ENV LANG C.UTF-8
ENV JAVA_VERSION 8u141
ENV BUILD_VERSION b15
ENV SUM 336fa29ff2bb4ef291e347e091f7f4a7

# Get any CentOS updates then clear the Docker cache
RUN yum makecache fast && \
    yum -y update && yum clean all

# Install MarkLogic dependencies
RUN yum -y install glibc.i686 \
    gdb.x86_64 redhat-lsb.x86_64 vim \
    bzip2 \
    unzip \
    xz-utils 2>&1 > /dev/null \
    && yum clean all

# Install the initscripts package so MarkLogic starts ok
RUN yum -y install initscripts && yum clean all

# Downloading Java
RUN curl -s -L -C - -b "oraclelicense=accept-securebackup-cookie" -o /tmp/jdk-8-linux-x64.rpm http://download.oracle.com/otn-pub/java/jdk/$JAVA_VERSION-$BUILD_VERSION/$SUM/jdk-$JAVA_VERSION-linux-x64.rpm
RUN yum -y install /tmp/jdk-8-linux-x64.rpm

RUN alternatives --install /usr/bin/java jar /usr/java/latest/bin/java 200000
RUN alternatives --install /usr/bin/javaws javaws /usr/java/latest/bin/javaws 200000
RUN alternatives --install /usr/bin/javac javac /usr/java/latest/bin/javac 200000

ENV JAVA_HOME /usr/java/latest

# Set the Path
ENV PATH /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/opt/MarkLogic/mlcmd/bin

# Install MarkLogic
COPY .travis/install-ml-8.sh /tmp/install-ml-8.sh
COPY .travis/install-ml-9.sh /tmp/install-ml-9.sh
COPY .travis/install-ml-10.sh /tmp/install-ml-10.sh
COPY .travis/install-ml.sh /tmp/install-ml.sh

ARG MLBUILD_USER
ARG MLBUILD_PASSWORD
ARG ML_VERSION

RUN chmod 755 /tmp/install-ml.sh
RUN /tmp/install-ml.sh "$MLBUILD_USER" "$MLBUILD_PASSWORD" "$ML_VERSION"

# Expose MarkLogic Server ports - add additional ones for your REST, etc
# endpoints
EXPOSE 7997-8020
EXPOSE 5005

# init
COPY .travis/startml.sh /tmp/startml.sh
RUN chmod 755 /tmp/startml.sh
COPY .travis/setup.sh /tmp/setup.sh
RUN chmod 755 /tmp/setup.sh
RUN /tmp/setup.sh

VOLUME /marklogic-data-hub
ADD ./ /marklogic-data-hub
WORKDIR /marklogic-data-hub

RUN ./gradlew resolveAllDependencies

# Start MarkLogic from init.d script.
# Define default command (which avoids immediate shutdown)
CMD /tmp/startml.sh && ./gradlew clean && ./gradlew test
