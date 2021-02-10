/* global AFRAME */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

// helper
function mapInterval (x, a, b, c, d, toInt) {
  if (b - a === 0) { throw Error('midicontroller: mapInterval division by 0'); }
  const result = c + ((x - a) * (d - c) / (b - a));
  return toInt ? Math.floor(result) : result;
}

function numberToHexString (value) {
  let result = Math.round(value).toString(16);
  if (result.length === 1) { result = '0' + result; }
  result = result.toUpperCase();
  return result;
}

/**
 * A Component for A-Frame.
 */
AFRAME.registerComponent('midicontroller', {
  schema: {
    noteon: { type: 'int' }, // midi note
    noteoff: { type: 'int' }, // midi note
    cc: { type: 'number' }, // midi control change
    property: { type: 'string' }, // property
    type: { type: 'string' }, // type of value
    value: { type: (() => this.type)() }, // // HACK
    from: { type: 'array', default: [0, 127] }, // mapping from (for control change)
    to: { type: 'array', default: [0, 1] } // mapping to (for control change)
  },

  multiple: true,

  init: function () {
  },

  onMIDIFailure: function (e) {
    console.log("No access to MIDI devices or your browser doesn't support WebMIDI API. Please try WebMIDIAPIShim." + e);
  },

  onMIDISuccess: function (midiAccess, schema, element) {
    const property = schema.property;
    const type = schema.type;
    const value = schema.value;

    function noteOn (note, velocity) {
      if (note === schema.noteon) {
        // console.log(note, schema.noteon, property, type, value, element);
        element.setAttribute(property, value);
      }
    }

    function noteOff (note, velocity) {
      if (note === schema.noteoff) {
        // console.log(note, schema.noteoff, property, type, value, element);
        element.setAttribute(property, value);
      }
    }

    function controlChange (cc, value) {
      if (cc === schema.cc) {
        const fromMin = schema.from[0];
        const fromMax = schema.from[1];
        const toMin = schema.to[0];
        const toMax = schema.to[1];

        // console.log(cc, schema.cc, property, type, value, fromMin, fromMax, toMin, toMax, element);
        const mappedValue = mapInterval(value, fromMin, fromMax, toMin, toMax, true);
        if (property.startsWith('material.color')) {
          const material = element.getAttribute('material');
          const currentColor = material.color;
          let pos;
          if (property.endsWith('r')) { pos = 1; }
          if (property.endsWith('g')) { pos = 3; }
          if (property.endsWith('b')) { pos = 5; }
          const len = currentColor.length;
          const newColor = (currentColor.slice(0, pos) + numberToHexString(mappedValue) + currentColor.slice(pos + 2, len)).trim();
          element.setAttribute('material', 'color', newColor);
        }
      }
    }

    function programChange (message) {
      // TODO implement
    }

    function onMIDIMessage (message) {
      const midiData = message.data;
      const cmd = midiData[0] >> 4;
      const channel = midiData[0] & 0xf;
      const type = midiData[0] & 0xf0;
      const note = midiData[1];
      const velocity = midiData[2];

      if (type === 144) { // note on
        noteOn(note, velocity);
      } else if (type === 128) { // note off
        noteOff(note, velocity);
      } else if (type === 176) { // knobs or sliders send CC data
        controlChange(note, velocity);
      } else if (type === 192) { // program change messages
        programChange(note);
      }
      // console.log(' [channel: ' + channel + ', cmd: ' + cmd + ', type: ' + type + ' , note: ' + note + ' , velocity: ' + velocity + ']');
    }

    const inputs = midiAccess.inputs.values();
    for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
      input.value.onmidimessage = onMIDIMessage;
    }
  },

  update: function (oldData) {
    const data = this.data;
    const el = this.el;

    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess(
        { sysex: false }
      ).then((midiAccess) => {
        this.onMIDISuccess(midiAccess, data, el);
      }, this.onMIDIFailure);
    } else {
      console.log('midicontroller: no MIDI support.');
    }
  },

  pause: function () {
  },

  play: function () {
  },

  remove: function () {
  }

});
