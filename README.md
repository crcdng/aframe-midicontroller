# A-Frame MIDI controller example

WORK IN PROGRESS, restored from the ashes of failed experiments 

Example, demonstrating Web MIDI in [A-Frame](https://aframe.io/). Live at https://i3games.github.io/aframe-midicontroller/

I use an [AKAI LPD8](https://www.akaipro.com/lpd8) to interact with the elements in the scene.

MIDI noteOn: 36, 37 (change cube position), 
MIDI noteOn / noteOff: 38 (toggle sphere size)
MIDI CC: 1, 2, 3 (change cylinder colour r g b)

[Web MIDI API](https://www.w3.org/TR/webmidi/) works in [Chrome and related browsers](https://caniuse.com/midi)

Code: [@crcdng](https://twitter.com/crcdng)

At the moment it works as such, probably soon needs a user gesture to start. 

MIT License 

## Third-Party Licenses
Image credits: kin design
A-Frame authors