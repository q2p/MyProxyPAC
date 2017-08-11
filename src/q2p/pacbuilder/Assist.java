package q2p.pacbuilder;

import javax.swing.*;
import java.awt.*;
import java.io.Closeable;
import java.nio.channels.FileLock;

public final class Assist {
	public static final boolean headless = GraphicsEnvironment.isHeadless();
	
	public static void safeClose(final Closeable closeable) {
		try {
			closeable.close();
		} catch(final Exception ignore) {}
	}
	
	public static void safeRelease(final FileLock lock) {
		try {
			lock.release();
		} catch(final Exception ignore) {}
	}
	
	public static void inform(final String message, final int wType) {
		inform(message, message, wType);
	}
	
	public static void inform(final String cMessage, final String wMessage, final int wType) {
		if(headless)
			System.out.println(cMessage);
		else
			informWindow(wMessage, wType);
	}
	
	public static void informWindow(final String message, final int type) {
		JOptionPane.showMessageDialog(null, message, "PAC Builder", type);
	}
}