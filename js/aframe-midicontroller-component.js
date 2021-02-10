/* global AFRAME */

if (typeof AFRAME === 'undefined') {
  throw new Error('Component attempted to register before AFRAME was available.');
}

// helper
function mapInterval (x, a, b, c, d) {
  if (b - a === 0) { throw Error('midicontroller: mapInterval division by 0'); }
  return c + ((x - a) * (d - c) / (b - a));
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
    note: { type: 'number' }, // midi note
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
   
    function noteOn (note, velocity) {
      const property = schema.property;
      const value = schema.value;
      if (note === schema.note) {
        console.log(note, schema.note, property, value, element);
        element.setAttribute(property, value);
      }
    }

    function noteOff (note, velocity) {
      // TODO implement
    }

    function controlChange (note, value) {
      if (note === schema.note) {
        const component = schema.c;
        const property = schema.p;
        const fromMin = schema.from[0];
        const fromMax = schema.from[1];
        const toMin = schema.to[0];
        const toMax = schema.to[1];

        const propertyValue = mapInterval(value, fromMin, fromMax, toMin, toMax);

        if (component === 'material.color') {
          const material = element.getAttribute('material');
          const currentColor = material.color;
          // console.log(currentColor);
          let pos;
          if (property === 'r') { pos = 1; }
          if (property === 'g') { pos = 3; }
          if (property === 'b') { pos = 5; console.log('blue'); }
          const len = currentColor.length;
          newColor = (currentColor.slice(0, pos) + numberToHexString(propertyValue) + currentColor.slice(pos + 2, len)).trim();

          element.setAttribute('material', 'color', newColor);
        } else {
          console.log(component + ', ' + property + ', ' + propertyValue);
          element.setAttribute(component, property, propertyValue);
        }
      }
      // TODO implement
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
      console.log(' [channel: ' + channel + ', cmd: ' + cmd + ', type: ' + type + ' , note: ' + note + ' , velocity: ' + velocity + ']');
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
      ).then(function (midiAccess) {
        this.onMIDISuccess(midiAccess, data, el);
      }.bind(this), this.onMIDIFailure);
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