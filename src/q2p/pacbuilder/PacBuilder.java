package q2p.pacbuilder;

import javax.swing.*;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.channels.FileLock;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.ListIterator;

public final class PacBuilder {
	private static final ByteBuffer example = StandardCharsets.UTF_8.encode(
		"# This is a comment.\n" +
		"# If line contains \"#\" symbol, then everything after it will be ignored by the program.\n" +
		"#\n" +
		"#\n" +
		"# You have to specify where each host will be redirected.\n" +
		"# On the start you specify the response which will be returned by every next host.\n" +
		"# At the end of the file must be a single response without any hosts after it.\n" +
		"#\n" +
		"# After that you specify every path that will return the response above them;\n" +
		"#\n" +
		"# Responses start with \"> \"\n" +
		"#\n" +
		"#\n" +
		"# Hosts can be written in several patterns\n" +
		"#\n" +
		"# \"_\" works like a wild card for domains. It can only be near the domain separating dots.\n" +
		"# Examples:\n" +
		"#\n" +
		"# \"_.a.com\" will count this hosts:\n" +
		"# a.com, b.a.com, c.b.a.com\n" +
		"#\n" +
		"# \"d._.a.com\" will count this hosts:\n" +
		"# d.a.com, d.b.a.com, d.c.b.a.com\n" +
		"#\n" +
		"#\n" +
		"# \"*\" works like a wild card for symbols.\n" +
		"# Examples:\n" +
		"#\n" +
		"# \"*.a.com\" will count this hosts:\n" +
		"# b.a.com, c.b.a.com\n" +
		"#\n" +
		"# \"d.cdn*.a.com\" will count this hosts:\n" +
		"# d.cdn1.a.com, d.cdn2.b.a.com\n" +
		"#\n" +
		"#\n" +
		"# Example file:\n" +
		"\n" +
		"> SOCKS5 my.proxy.service.com:9024 # Proxy\n" +
		"     example.org                   # Single domain\n" +
		"       _.cdn.net                   # Domain and subdomains\n" +
		"cdn*.megaweb.com                   # Subdomains starting with \"cdn\"\n" +
		"\n" +
		"> DIRECT\n" +
		"\n" +
		"# That file means, that requests to:\n" +
		"# {\n" +
		"#   domain \"example.org\"\n" +
		"#   domain \"cdn.net\" amd any subdomain of \"cdn.net\"\n" +
		"#   subdomains of \"megaweb.com\" which start with cdn\n" +
		"# }\n" +
		"# Will be redirected throuh socks 5 proxy \"my.proxy.service.com\" on the port 9024.\n" +
		"# And every other request will not be redirected. Because of \"> DIRECT\"."
	);
	static {
		example.position(0);
	}
	
	private static BufferedReader reader;
	
	private static ByteBuffer buffer;
	
	public static void main(final String[] args) {
		if(!readFile())
			return;
		
		if(!parseFile())
			return;
		
		writeFile();
		
		Assist.inform("Done.", JOptionPane.INFORMATION_MESSAGE);
	}
	
	private static void writeFile() {
		final FileChannel fc;
		try {
			fc = FileChannel.open(Paths.get("pac.pac"), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING, StandardOpenOption.READ, StandardOpenOption.WRITE);
		} catch(final IOException e) {
			failedToWrite("pac.pac");
			return;
		}
		final FileLock lock;
		try {
			lock = fc.lock();
		} catch(final IOException e) {
			Assist.safeClose(fc);
			failedToWrite("pac.pac");
			return;
		}
		try {
			while(buffer.hasRemaining())
				fc.write(buffer);
			
			fc.force(true);
		} catch(final IOException e) {
			failedToWrite("pac.pac");
		} finally {
			Assist.safeRelease(lock);
			Assist.safeClose(fc);
		}
	}
	
	private static void failedToWrite(final String name) {
		Assist.inform(
			"Failed to write to \""+name+"\" file.",
			JOptionPane.ERROR_MESSAGE
		);
	}
	
	private static boolean parseFile() {
		StringBuilder sb = new StringBuilder("function FindProxyForURL(url,host){");
		
		String response = null;
		
		boolean haveOne = false;
		
		while(true) {
			String line;
			try {
				line = reader.readLine();
			} catch(final IOException ignore) {
				return false;
			}
			
			if(line == null) {
				reader = null;
				break;
			}
			
			int idx = line.indexOf('#');
			if(idx != -1)
				line = line.substring(0, idx);
			
			line = line.trim();
			
			if(line.length() == 0)
				continue;
			
			if(line.startsWith("> ")) {
				if(haveOne) {
					sb.append(")return\'");
					sb.append(response);
					sb.append("\';");
				}
				
				response = line.substring(2);
				
				haveOne = false;
				
				continue;
			}
			
			if(response == null) {
				Assist.inform(
					"Before the list of paths, there must be a response which will be returned.",
					"Before the list of paths,\nthere must be a response which will be returned.",
					JOptionPane.ERROR_MESSAGE
				);
				return false;
			}
			
			if(!expandLine(line)) {
				Assist.inform(
					"Symbol \"_\" cannot be used without dots around it.",
					JOptionPane.ERROR_MESSAGE
				);
				return false;
			}
			
			while(!expanded.isEmpty()) {
				if(haveOne) {
					sb.append("||");
				} else {
					sb.append("if(");
					haveOne = true;
				}
				
				String str = expanded.removeFirst();
				if(str.contains("*")) {
					sb.append("shExpMatch(host,\'");
					sb.append(str);
					sb.append("\')");
				} else {
					sb.append("host==\'");
					sb.append(str);
					sb.append("\'");
				}
			}
		}
		
		if(haveOne) {
			Assist.inform(
				"After the list of paths, there must be a default answer at the very end.",
				"After the list of paths,\nthere must be a default answer at the very end.",
				JOptionPane.ERROR_MESSAGE
			);
			return false;
		}
		
		sb.append("return\'");
		sb.append(response);
		sb.append("\';}");
		
		final String ret = sb.toString();
		
		sb = null;
		
		buffer = StandardCharsets.UTF_8.encode(ret);
		
		buffer.position(0);
		
		return true;
	}
	
	private static final LinkedList<String> expanded = new LinkedList<>();
	private static boolean expandLine(final String line) {
		if(line.equals("_")) {
			Assist.inform("Single \"_\" symbol is not allowed", JOptionPane.ERROR_MESSAGE);
			return false;
		}
		
		final boolean startsWith = line.startsWith("_");
		final boolean endsWith = line.endsWith("_");
		
		final LinkedList<String> parts = new LinkedList<>();
		
		int pidx = startsWith ? 1 : 0;
		while(pidx < line.length()) {
			int idx = line.indexOf('_', pidx);
			
			if(idx == -1)
				idx = line.length();
			
			parts.addLast(line.substring(pidx, idx));
			
			pidx = idx+1;
		}
		
		ListIterator<String> i = parts.listIterator();
		String word = i.next();
		boolean hasPrev = false;
		while(true) {
			if(word.length() == 0) {
				Assist.inform("\"_\" symbol cannot be written after itself.", JOptionPane.ERROR_MESSAGE);
				return false;
			}
			
			final boolean hasBefore = hasPrev || startsWith;
			final boolean hasAfter = i.hasNext() || endsWith;
			
			hasPrev = true;
			
			if(hasBefore && !word.startsWith(".") || hasAfter && !word.endsWith(".")) {
				Assist.inform("\"_\" symbol cannot be written without any dots around it.", JOptionPane.ERROR_MESSAGE);
				return false;
			}
			
			if(word.equals(".")) {
				if(hasBefore || hasAfter)
					Assist.inform("Single dot around \"_\" without anything else is not allowed.", JOptionPane.ERROR_MESSAGE);
				else
					Assist.inform("Single dot is not allowed.", JOptionPane.ERROR_MESSAGE);
				
				return false;
			}
			
			i.set(word.substring(hasBefore ? 1 : 0, word.length() - (hasAfter ? 1 : 0)));
			
			if(!i.hasNext())
				break;
			
			word = i.next();
		}
		
		recursiveWordAdd(parts, "", endsWith, parts.listIterator());
		
		if(startsWith)
			recursiveWordAdd(parts, "*.", endsWith, parts.listIterator());
		
		return true;
	}
	
	private static void recursiveWordAdd(final List<String> parts, final String prefix, final boolean endsWith, final ListIterator<String> iterator) {
		String next = iterator.next();
			
		if(iterator.hasNext()) {
			final int idx = iterator.nextIndex();
			recursiveWordAdd(parts, prefix+next+".*.", endsWith, iterator);
			recursiveWordAdd(parts, prefix+next+".", endsWith, parts.listIterator(idx));
		} else {
			expanded.addLast(prefix+next);
			
			if(endsWith)
				expanded.addLast(prefix+next+".*");
		}
	}
	
	private static boolean readFile() {
		Path file = Paths.get("source.txt");
		if(!Files.exists(file)) {
			fillExample();
			try {
				Files.createFile(file);
			} catch(final IOException ignore) {}
			
			Assist.inform(
				"Fill \"source.txt\" with desired rules.",
				JOptionPane.INFORMATION_MESSAGE
			);
			return false;
		}
		final FileChannel fc;
		try {
			fc = FileChannel.open(file, StandardOpenOption.READ);
		} catch(final IOException e) {
			return failedToRead();
		}
		try {
			final long length = fc.size();
			
			if(length > 512*1024*1024)
				throw new OutOfMemoryError();
			
			final ByteBuffer ret = ByteBuffer.allocate((int)length);
			
			while(ret.hasRemaining()) {
				if(fc.read(ret) == -1) {
					Assist.safeClose(fc);
					return failedToRead();
				}
			}
			
			reader = new BufferedReader(new InputStreamReader(new ByteArrayInputStream(ret.array())));
			return true;
		} catch(final IOException e) {
			return failedToRead();
		} catch(final OutOfMemoryError e) {
			Assist.inform(
				"File \"source.txt\" is too big.",
				JOptionPane.ERROR_MESSAGE
			);
			return false;
		} finally {
			Assist.safeClose(fc);
		}
	}
	
	private static void fillExample() {
		final FileChannel fc;
		try {
			fc = FileChannel.open(Paths.get("source.txt"), StandardOpenOption.CREATE_NEW, StandardOpenOption.READ, StandardOpenOption.WRITE);
		} catch(final IOException e) {
			return;
		}
		final FileLock lock;
		try {
			lock = fc.lock();
		} catch(final IOException e) {
			Assist.safeClose(fc);
			failedToWrite("source.txt");
			return;
		}
		try {
			while(example.hasRemaining())
				fc.write(example);
			
			fc.force(true);
		} catch(final IOException e) {
			failedToWrite("source.txt");
		} finally {
			Assist.safeRelease(lock);
			Assist.safeClose(fc);
		}
	}
	
	private static boolean failedToRead() {
		Assist.inform(
			"Failed to read from \"source.txt\" file.",
			JOptionPane.ERROR_MESSAGE
		);
		return false;
	}
}