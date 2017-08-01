# AirConsole Construct3
An AirConsole plugin for Construct 3

This plugin is in beta state and subject to a lot of changes

You can find a c3p exemple file of our good old Pong game

You can use the backward compatibility plugin to import any games you made with Construct2

Prefer to use the normal plugin for new Construct3 projects

Please report any bugs you encounter

## Installation for new Construct3 projects
[Download the plugin](plugin/airconsole.c3addon) and add it to your Construct3 project

## Installation for Construct2 imported games
[Download the backward compatible plugin](backwardCompatibility/c3airconsole-backcomp.c3addon) and add it to your Construct3 project


## Export your games and try them
As of now I couldn't import airconsole script in the Construct3 plugin, as C3 sdk doesn't yet offer this possibility. This will be solved in the coming months.

But for now, 2 solutions:
* Use our provided tool: [Download AirConsole.bat](AirConsole.bat). Place it in your C3 game exported directory and simply run it.
* Or edit your "screen.html" ("index.html") and add, after line 16:

```html
<script type="text/javascript" src="https://www.airconsole.com/api/airconsole-1.7.0.js"></script>
```

Save your file and enjoy a working game on AirConsole!
