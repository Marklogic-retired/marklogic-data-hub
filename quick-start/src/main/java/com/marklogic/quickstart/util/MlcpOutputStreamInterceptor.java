package com.marklogic.quickstart.util;

import com.marklogic.hub.StatusListener;

import java.io.OutputStream;
import java.io.PrintStream;
import java.util.Arrays;

/**
 * This class intercepts the Mlcp stdout and pipes it to a listener while
 * also sending to the original stdout
 */
public class MlcpOutputStreamInterceptor extends OutputStream {
    private StatusListener listener;
    private PrintStream oldStream;

    private int currentPc = 0;
    public MlcpOutputStreamInterceptor(StatusListener listener, PrintStream oldStream) {
        this.listener = listener;
        this.oldStream = oldStream;
    }

    @Override
    public synchronized void write(int b) {
        oldStream.write(b);
    }

    @Override
    public synchronized void write(byte b[], int off, int len) {
        oldStream.write(b, off, len);
        if ((off < 0) || (off > b.length) || (len < 0) ||
                ((off + len) - b.length > 0)) {
            throw new IndexOutOfBoundsException();
        }

        byte[] buf = Arrays.copyOfRange(b, off, off + len - 1);
        String status = new String(buf);
        if (status.contains("ERROR")) {
            listener.onError();
        }

        try {
            int pc = Integer.parseInt(status.replaceFirst(".*completed (\\d+)\\%", "$1"));
            // don't send 100% because more stuff happens after 100% is reported here
            if (pc > currentPc && pc != 100) {
                currentPc = pc;
            }
        }
        catch(NumberFormatException e) {}
        listener.onStatusChange(currentPc, status);
    }

}
