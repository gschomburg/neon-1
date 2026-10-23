these are gs notes
***********************
- menu button in the header should maybe be aligned right
- audio ideas. clean up music tracks, maybe not every corp needs it's own track. maybe have a 8 main tracks, maybe corps can vary off each one of those. then maybe like 8 specialty tracks for corps like bosses or the higher level corps. maybe 2 tracks reserved for corps with timers. and then a title track and maybe a overworld track.
- music inspirations, anything electronic or synthy. daft punk tron, arcade fire, kavinsky, goblin, blade runner, maybe a little skryilix, ladytron, albumn leaf, NIN, pixel grip, 
- add some mention of a gru in the corp that blacks out.. something like "a wild gru is NEAR!"



ascii
********************
- pull the ascii catalog back out of the repo, set git ignore on them
- how could animations work.. thinking like a sprite sheet text file
- shape tools that can draw a circle or square but do it smart like using / and - and then . in the corners for (rounded) corners. then have a polygon type tool where you make lines and then once you're done with the shape it converts to ascii, maybe it needs asnap to grid option
- flip vertical and horz. and copy paste
- layers maybe?
- pattern fills (brush drawing)
- flood fill?
- noise fill?
- are we currently using pure ascii or is unicode allowed?

- haveing a brush size for drawing tools so that your brush can be wider that a single grid cell AND then the brush can either be filled or stroked (so your brush would either fill all the characters you draw with or it just fills the edges, if it's using the stroke option it would need to generate the outline characters after the brush line has completed (after you release)) a tool like that might also help to have a brush shape and taper option so that the brush gets narrower at the end of the line and maybe thinker in the middle. maybe scale of the brush is based on the length of the line. so there's a min and a max width and maybe a line spread or something so you control the taper to max size

-zooming in and out are good

- setting canvas size is great, but probably also have a out of canvas grid so that you see what's in the canvas and what's out of it still. i'm thinkingt he canvas area is usually centered in the view

- for selection a box select or lasso is cool, and then a shift select to add to slection and a shift alt or whatever the photoshop keybind is for unselect area would be good

- app should have a bunch of premade assets that you can load up

- i liked the one app that had a gallery you could browse and load in. i think for starters don't worry about a gallery just have a bunch of art built in, maybe from the selections.txt (will need to credit where due)

- there should be a setting for which monospace font you want. i like the default one you choose for neon+1

- for the tool palette i think i want that draggable and off to the left by default. i don't mind the info panes on the right for when you select stuff. i would probably want to use the photo shop default paradigm where tool selection is on the left palette, once a tool is selected the tool options are in a pane towards the top.. probably locked, then for some tools where there's more options or layer or selection info or transform type stuff would go over in a bigger info pane on the right. maybe that is repositionable too but locked is maybe fine. global things like zoom level and light dark mode maybe goes up at the top, or lockec down to the bottom outide of the canvas area (lets say top) that could also have menu/file drop downs if we need em like export and save

- in the editor do we add a animation tool? something to preview the animation and then export it with code.. like a way to add in {bar} in the app and then preview and export.. would also add more syntaxt and things

    - in the animation tool there could be a particle generator, like pick an emitter cell, pick a bunch of characters to emit and then initial force and fall off speed and death time! maybe just have a bunch of presets so it doesn't need to be as complex? like it's just one preset covers everything for common stuff like rain or explosion



example reference apps
- https://patorjk.com/ascii-art-sketchpad/ has pretty great drawing and shape tools and options for line style

- https://dnascii.com/ this tool actually has the selection and move option i was thinking of. it also has layers. also i kind of like it's overall look and feel. it also has a github https://github.com/dnisdv/ascii-editor maybe we start with a fork of this and add in our features. then they could be pushed back if they like em. althoguh maybe not this app it's ok, but i think i would want to change the ui way too much. maybe start with it as a reference point. light mode dark mode is nice, maybe have a couple styles, like a toned down blueish one and a lighter mode green one. i kinda like the way this thing uses layers but it's a little confusing. i'm not sure where the flatten layers option is. 

- https://patorjk.com/software/taag/#p=display&f=Patorjk%27s+Cheese&t=NeoN%2B1&x=none&v=1&h=0&w=80&we=false this app has some pretty great type options. the isometric is great. impossible is also interesting, slant relief, swamp land is nice. small isometric 1 is very nice, Tmplr is cool, twisted, 
stronger than all, small ascii 9, big fig, braced, broadway kb, contessa, chunky, cursive, 

- https://asciistudio.app/ this app is a little janky with pasting. i do like it's text typing mode and the general app layout, it's fairly adobe app sort of setup with tool pallet and a bunch of it's tools suck. i like it has a selection tool that you drag to select a box area, once i have a slection i think i would want to be able to arrow it around and drag it. and it wouldn't overwrite the underlying things until i agreed to the finished move and deselect it.. this is sort of a layering feature. as i move the seelction around it maybe shows me when existing characters will be replaced.. blank cells don't count only when 2 non characters are colliding. yeah this app is super frustrating to use and has some interesting ideas but all it's features are missing functionality or are confusing. don't use this much as a reference. 


corp/mod/item ideas
***********************

- have a mod that is a truth meter that will say if the tell is actually in effect. maybe a rep bonus, maybe a thing once you unlock the corp?
- punk corp
- fossil corp [we've been around a long time] it's like digging for fossils? you brush off the nodes, maybe tapping doesn't just break the ice it slowly reveals the glyph and some glyphs are the default glyphs and some are fossils. if you reveal a regular glyph it's ice and it hurts you
- worm
- unicorn very rare corp? all it's mod options are exotic? or it's mod reward gives you a greateer chance at exotics and legendaries? maybe this is just a reputation unlock
- a magic corp? nodes can get sawed in half or disappear? or you're looking for the rabbit.. shell corp might already have tis idea covered

- fork bomb : something recursive
- some mod that adds ice, but they are clearly dumby ice (used in combo with other mods like virus)
- need legendary versions of mods. maybe boss mods just get renamed to legendary or boss get turned to something. or there's a mid greeen tier [scrap white, common green, rare blue, epic purple, legendary orange, exotic gold]

