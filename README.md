# Modern Calc
![screenshot](https://github.com/kaer/gnome-shell-extension-modern-calc/raw/master/modern-calc@kaer/images/modern-calc-v4.png)

## Description

This extension aims to be a modern full featured calculator for gnome-shell.

## Development

This extension is under development and help is wanted. If you are a designer and want to contribute with themes and concepts to improve the extension contact me.

## WARNING

Depending of your system settings this extension should not be used for production.

Known issues:
 - This extension uses gnome-calculator (command line) as cauculus core and in some versions of gnome-calculator like 3.10.2 depending of your locale settings (settings for formating numbers dates and money of a specific region like French or Spain) the decimal mark is removed and decimal numbers are interpreted as integers.

 Try to sum decimal numbers and see if the result it's right otherwise you should not use this extension for computing decimal numbers.

## Dependencies

To run this extension gnome-calculator must be installed.

## Install

Move the directory modern-calc@kaer to ~/.local/share/gnome-shell/extensions/ .

If your running version of gnome-shell is another than 3.10 or 3.12 change the metadata.json content:

"shell-version": ["3.10"]
to
"shell-version": ["YOUR VERSION OF GSHELL"]

Note: This is extension was developed for Gnome Shell 3.10 and may not run in older versions.

## Bugs and wishlist

If you find bugs or want new features report it to the project [bug tracker](https://github.com/kaer/gnome-shell-extension-modern-calc).

## License

This extension is licensed under GPLv2.

##Thanks

I'd like to thank each developer of the following extensions:

 - [GCalcSearch](https://github.com/war1025/GCalcSearch)
 - [Gnote/Tomboy Integration](https://github.com/awamper/gnote-integration)
 - [GPaste Integration](https://github.com/awamper/gpaste-integration)

