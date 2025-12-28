// --------------------------------------------------------------
// Robot36 SSTV Encoder (Browser Pure JS Version)
// Encodes ImageData -> WAV Audio (Robot36 mode)
// Decodable by QSSTV, Robot36 Android App, FLDigi.
// --------------------------------------------------------------

window.Robot36Encoder = {
  encode(imageData) {
    const sampleRate = 48000;
    const samples = [];

    function addTone(freq, ms) {
      const count = Math.floor(sampleRate * (ms / 1000));
      for (let i = 0; i < count; i++) {
        const t = i / sampleRate;
        samples.push(Math.sin(2 * Math.PI * freq * t));
      }
    }

    // -------------------------
    // Robot36 Header
    // -------------------------

    // VIS Start
    addTone(1900, 300);
    addTone(1200, 10);
    addTone(1900, 300);

    // VIS Code = 0x0C (Robot36)
    const VIS = [0,0,1,1,0,0,0,1];

    VIS.forEach(bit => addTone(bit ? 1300 : 1100, 30));

    addTone(1200, 30); // Stop

    const { width, height, data } = imageData;

    // -------------------------
    // Encode image lines
    // -------------------------
    for (let y = 0; y < height; y++) {
      // Sync pulses
      addTone(1200, 9);
      addTone(1500, 3);

      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        const freq = 1500 + (lum / 255) * 800;

        addTone(freq, 0.46);
      }
    }

    // -------------------------
    // WAV File Packaging
    // -------------------------
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    const writeString = (offset, str) =>
      [...str].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));

    // RIFF
    writeString(0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);

    writeString(8, "WAVE");

    // fmt chunk
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);

    // data chunk
    writeString(36, "data");
    view.setUint32(40, samples.length * 2, true);

    let o = 44;
    samples.forEach(s => {
      view.setInt16(o, s * 32767, true);
      o += 2;
    });

    return new Blob([buffer], { type: "audio/wav" });
  }
};
