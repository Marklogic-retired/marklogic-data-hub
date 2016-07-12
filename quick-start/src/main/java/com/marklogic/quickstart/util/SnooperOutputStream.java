package com.marklogic.quickstart.util;

import java.io.OutputStream;
import java.io.PrintStream;
import java.util.Arrays;

import com.marklogic.hub.StatusListener;

public class SnooperOutputStream extends OutputStream {
    private StatusListener listener;
    private PrintStream oldStream;

    private int currentPc = 0;
    public SnooperOutputStream(StatusListener listener, PrintStream oldStream) {
        this.listener = listener;
        this.oldStream = oldStream;
    }

    @Override
    public synchronized void write(int b) {
        oldStream.write(b);
//        listener.onStatusChange(0, this.toString());
    }

    @Override
    public synchronized void write(byte b[], int off, int len) {
        oldStream.write(b, off, len);
        if ((off < 0) || (off > b.length) || (len < 0) ||
                ((off + len) - b.length > 0)) {
            throw new IndexOutOfBoundsException();
        }

//        String status = Arrays.toString(Arrays.copyOfRange(b, off, off + len - 1));
        byte[] buf = Arrays.copyOfRange(b, off, off + len - 1);
        String status = new String(buf);

        try {
            int pc = Integer.parseInt(status.replaceFirst(".*completed (\\d+)\\%", "$1"));
            if (pc > currentPc) {
                currentPc = pc;
            }
        }
        catch(NumberFormatException e) {}
        listener.onStatusChange(currentPc, status);
    }

}
