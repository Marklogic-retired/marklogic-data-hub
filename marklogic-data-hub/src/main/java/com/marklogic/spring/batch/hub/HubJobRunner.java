package com.marklogic.spring.batch.hub;

import com.marklogic.hub.HubConfig;
import com.marklogic.spring.batch.Options;
import joptsimple.OptionParser;
import joptsimple.OptionSet;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import java.util.Arrays;
import java.util.Date;
import java.util.List;

public class HubJobRunner extends com.marklogic.spring.batch.Main {

    public JobExecution runJob(String[] args) throws Exception {
        OptionParser parser = buildOptionParser();
        OptionSet options = parser.parse(args);

        if (options.has(Options.HELP)) {
            printHelp(parser, options, args);
        }
        else if (options.has(Options.LIST)) {
            StringBuilder sb = new StringBuilder();
            listConfigs(options, sb);
            System.out.println(sb.toString());
        }
        else {
            ConfigurableApplicationContext ctx = buildApplicationContext(options);
            JobParameters params = buildJobParameters(options);
            JobLauncher launcher = getJobLauncher(ctx);
            Job job = getJobToExecute(ctx, options);
            return launcher.run(job, params);
        }
        return null;
    }

    @Override
    protected OptionParser buildOptionParser() {
        OptionParser parser = new OptionParser();
        parser.acceptsAll(Arrays.asList("h", Options.HELP), "Show help").forHelp();
        parser.accepts(Options.HOST, "Hostname of the destination MarkLogic Server").withRequiredArg().defaultsTo("localhost");
        parser.accepts(Options.PORT, "Port number of the destination MarkLogic Server. There should be an XDBC App Server on this port. The App Server must not be SSL-enabled.").withRequiredArg().ofType(Integer.class).defaultsTo(8000);
        parser.accepts(Options.USERNAME, "The MarkLogic user to authenticate as against the given host and port").withRequiredArg().defaultsTo("admin");
        parser.accepts(Options.PASSWORD, "The password for the MarkLogic user").withRequiredArg();
        parser.accepts(Options.DATABASE, "The name of the destination database. Default: The database associated with the destination App Server identified by -host and -port.").withRequiredArg();
        parser.accepts(Options.AUTHENTICATION, "The authentication to use for the app server on the given port").withRequiredArg();

        parser.accepts(Options.LIST, "List all of the Spring Configuration classes on the classpath");
        parser.accepts(Options.BASE_PACKAGE, "The optional base package to use when using --list to find Spring Configuration classes").withRequiredArg();

        parser.accepts(Options.CONFIG, "The fully qualified classname of the Spring Configuration class to register").withRequiredArg();
        parser.accepts(Options.JOB, "The name of the Spring Batch Job bean to run").withRequiredArg();
        parser.accepts(Options.CHUNK_SIZE, "The Spring Batch chunk size").withRequiredArg();

        parser.accepts(Options.OPTIONS_FILE, "Path to a Java-style properties file that defines additional options").withRequiredArg();
        parser.accepts("project_dir", "Path to the Data Hub Project").withRequiredArg();
        parser.accepts("env", "The target environment (local,dev,qa,prod)").withRequiredArg();

        parser.allowsUnrecognizedOptions();
        return parser;
    }

    @Override
    protected ConfigurableApplicationContext buildApplicationContext(OptionSet options) throws Exception {
        AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext();
        registerDefaultConfigurations(ctx);
        registerConfigurationsFromOptions(ctx, options);

        String projectdir = ".";
        if (options.has("project_dir")) {
            projectdir = (String)options.valueOf("project_dir");
        }

        String environment = "local";
        if (options.has("env")) {
            environment = (String)options.valueOf("env");
        }
        HubConfig config = HubConfig.hubFromEnvironment(projectdir, environment);
        ctx.getBeanFactory().registerSingleton("hubConfig", config);
        ctx.refresh();
        return ctx;
    }

    @Override
    protected JobParameters buildJobParameters(OptionSet options) {
        JobParametersBuilder jpb = new JobParametersBuilder();

        /**
         * Treat non-option arguments as job parameters. Thus, recognized options are considered
         * to be necessary for resolving @Value annotations on the given Job class, whereas
         * unrecognized options are considered to be job parameters.
         */
        List<?> nonOptionArgs = options.nonOptionArguments();
        int size = nonOptionArgs.size();
        for (int i = 0; i < size; i++) {
            String name = nonOptionArgs.get(i).toString();
            i++;
            if (i < size) {
                if (name.startsWith("--")) {
                    name = name.substring(2);
                } else if (name.startsWith("-")) {
                    name = name.substring(1);
                }
                String value = nonOptionArgs.get(i).toString();
                jpb.addString(name, value);
            }
        }

        // this is a cheat to add a unique parameter to the job
        // so a new job instance will be created in MarkLogic
        jpb.addString("timestamp", new Date().toString());
        return jpb.toJobParameters();
    }

    public static void main(String[] args) throws Exception {
        new HubJobRunner().runJob(args);
    }
}
