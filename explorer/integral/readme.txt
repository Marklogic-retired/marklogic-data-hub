IntegralApp is a small system that does integration tests of explorer's API.
(Note that the API encompasses all of the functionality present in explorer.)

As such, it relies upon a properly-configured copy of MarkLogic 10.0-2.1 and
requires DataHub to have been installed in order to ensure the proper roles
and privileges exist.  Appropriate users need to be defined and then
application.conf needs to be updated in order to present valid names for
testing -- some of which must not exist.

The test relies upon http connections; modifications will need to be made
in order to support https.  The modifications are adding protocol to the
application.conf then referencing it from within the step definitions.  It's
worth noting that there is no fundamental issue in handling http vs https
other than ensuring that appropriate certificates are present.  The ones used
by explorer itself are just fine.

How It Works

This version relies upon coded tests -- actually, configured tests and the
backing code is all the same -- but Java and Jackson are apparently still in
a state where there is only partial support for Optional (a Java 8 feature)
and enums.  There is work to do in order to get the enums to play nicely with
Jackson.  The good news is that the code is small, the Step is the only real
thing that needs to be configured although it's convenient to create Test and
Suite implementations -- and the code does just that -- and there is very little
code.  The code uses Java 11 versions of java.net.http so it's likely to be
useful for some time.

By design, all of the tests are run all of the time.  IO defaults to the console
but an output file can be specified in application.conf.

The file "example_output.txt" in the project root is a sample output file.  It's
also a real output file.

Possibly Confusing Things

In a sense, Integral is emulating a browser in that it needs to maintain a
cookie in order to be able to work with MarkLogic.  This is the same value
returned by MarkLogic at login; what it means is that in practice the client
needs to persist for all but the most trivial test.  The writer of a test need
do nothing other than set the appropriat4e value to true when defining a step.

You will notice liberal use of "var" and "final" in this code.  If this is
puzzling, think of "const auto" whenever you see "final var" -- unless your C++
is non-existent.  Use of Optional is also liberal.  As it happens, Oracle did a
bad job with Optional (in addition to the extra verbosity endemic to Java) so
there are some warnings appearing that you can safely ignore.

What's Left to be Done

The biggest thing to do from a code perspective is to configure IDEA in a way
such that it will use our code style.  Why doesn't it work?  I don't know.
This might be the result of the IDEA environment interacting with the very
basic gradle definition.
