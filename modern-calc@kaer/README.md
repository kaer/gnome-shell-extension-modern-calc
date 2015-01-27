# Modern Calc
![screenshot](https://github.com/kaer/gnome-shell-extension-modern-calc/raw/master/modern-calc@kaer/images/modern-calc-v5.png)
![screenshot](https://github.com/kaer/gnome-shell-extension-modern-calc/raw/master/modern-calc@kaer/images/modern-calc-v5-lt.png)

## Description

This extension aims to be a modern full featured calculator for gnome-shell.

## WARNING

Depending of your system settings this extension should not be used for production.

Known issues:
 - This extension uses gnome-calculator (command line) as cauculus core and in some versions of gnome-calculator like 3.10.2 depending of your locale settings (settings for formating numbers dates and money of a specific region like French or Spain) the decimal mark is removed and decimal numbers are interpreted as integers.

Use the termimal to check the accepted decimal mark of gnome-calculator in your system
	test for commas:
 		gnome-calculator -s "2,2+1"
 	test for dots:
 		gnome-calculator -s "2.2+1"

 	If the result of the calculus above is 3.2 (dot is decimal mark) or 3,2 (comma is decimal mark), open the extension settings and change the decimal mark (calculator tab) to the decimal mark recognized by your system. If the result is 23 Don't use this extension for computing decimal numbers.

 	Do not use others separators than decimal mark.

## Dependencies

To run this extension gnome-calculator must be installed.

## Install

Move the directory modern-calc@kaer to ~/.local/share/gnome-shell/extensions/ .

If your running version of gnome-shell is other than 3.10, 3.12 and 3.14 change the metadata.json content:

"shell-version": ["3.10"]
to
"shell-version": ["YOUR VERSION OF GSHELL"]

Note: This is extension was developed for Gnome Shell 3.10-3.14 and may not run in older versions.

## Usage
Check the RELEASE NOTES file to see the accepted shortcuts.


Unit converter

The use of unit converter (UC) is very easy, first you need to select a measurement you wanna to convert and later write the expression to convert.

- The accepted syntax is:
	<value><unit source>
	or
	<value><unit source> > <unit expected>

	e.g:
	 1MPa
	 1mm > m

- Note: UC's expressions are case-sensitive and if you write something like:
	1mm > M

	it won't convert because M (upper case) is the prefix of mega (10e-6) and could be the symbol of another unit.

	- the notation 'X to Y' is no longer accepted.


- Prefixes
	Prefixes k (kilo), M (mega) and others are accepted except for temperatures.
	usage:
		1Mm > mm

## Bugs and wishlist

If you find bugs or want new features report it to the project [bug tracker](https://github.com/kaer/gnome-shell-extension-modern-calc).

## License

This extension is licensed under GPLv2.

##Thanks

I'd like to thank each developer of the following extensions and/or libraries:
 - [js-quantities](https://github.com/gentooboontoo/js-quantities)

 - [GCalcSearch](https://github.com/war1025/GCalcSearch)
 - [Gnote/Tomboy Integration](https://github.com/awamper/gnote-integration)
 - [GPaste Integration](https://github.com/awamper/gpaste-integration)

