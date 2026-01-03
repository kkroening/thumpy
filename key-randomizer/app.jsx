// app.jsx
const keys = ['C', 'G', 'D', 'A', 'E', 'B', 'G♭', 'D♭', 'A♭', 'E♭', 'B♭', 'F'];
const modesOrder = [
  'Lydian',
  'Ionian',
  'Mixolydian',
  'Dorian',
  'Aeolian',
  'Phrygian',
  'Locrian',
];
const hands = ['Left', 'Right'];
const keyColors = {
  C: '#FF0000',
  G: '#FF7F00',
  D: '#FFFF00',
  A: '#7FFF00',
  E: '#00FF00',
  B: '#00FF7F',
  'G♭': '#00FFFF',
  'D♭': '#007FFF',
  'A♭': '#0000FF',
  'E♭': '#7F00FF',
  'B♭': '#FF00FF',
  F: '#FF007F',
};
const modeColors = {
  Lydian: '#FFD700',
  Ionian: '#FFFF00',
  Mixolydian: '#FFA500',
  Dorian: '#98FB98',
  Aeolian: '#4169E1',
  Phrygian: '#FF4500',
  Locrian: '#483D8B',
};
const flatToSharp = {
  'G♭': 'F#',
  'D♭': 'C#',
  'A♭': 'G#',
  'E♭': 'D#',
  'B♭': 'A#',
};
const sharpToFlat = {
  'C#': 'D♭',
  'D#': 'E♭',
  'F#': 'G♭',
  'G#': 'A♭',
  'A#': 'B♭',
};
const octaveNotes = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];
const modeDegrees = {
  Ionian: 1,
  Dorian: 2,
  Phrygian: 3,
  Lydian: 4,
  Mixolydian: 5,
  Aeolian: 6,
  Locrian: 7,
};
const semitonesToDegree = {
  1: 0,
  2: 2,
  3: 4,
  4: 5,
  5: 7,
  6: 9,
  7: 11,
};
const modeIntervals = {
  Ionian: [2, 2, 1, 2, 2, 2, 1],
  Dorian: [2, 1, 2, 2, 2, 1, 2],
  Phrygian: [1, 2, 2, 2, 1, 2, 2],
  Lydian: [2, 2, 2, 1, 2, 2, 1],
  Mixolydian: [2, 2, 1, 2, 2, 1, 2],
  Aeolian: [2, 1, 2, 2, 1, 2, 2],
  Locrian: [1, 2, 2, 1, 2, 2, 2],
};
const leftFingerings = {
  C: '14321321',
  'D♭': '32143213',
  D: '14321321',
  'E♭': '32143213',
  E: '14321321',
  F: '14321321',
  'G♭': '43213214',
  G: '14321321',
  'A♭': '32143213',
  A: '14321321',
  'B♭': '32143213',
  B: '13214321',
};
const rightFingerings = {
  C: '12312341',
  'D♭': '23123412',
  D: '12312341',
  'E♭': '31234123',
  E: '12312341',
  F: '12341231',
  'G♭': '23412312',
  G: '12312341',
  'A♭': '34123123',
  A: '12312341',
  'B♭': '41231234',
  B: '12312341',
};

function getContrastColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

function getRelativeKey(tonic, semitonesDown) {
  const note = flatToSharp[tonic] || tonic;
  const idx = octaveNotes.indexOf(note);
  const newIdx = (idx - semitonesDown + 120) % 12;
  const newNote = octaveNotes[newIdx];
  return sharpToFlat[newNote] || newNote;
}

function getScaleNotes(tonic, mode) {
  const note = flatToSharp[tonic] || tonic;
  let current = octaveNotes.indexOf(note);
  const scale = [octaveNotes[current % 12]];
  const intervals = modeIntervals[mode];
  for (let i = 0; i < 7; i++) {
    current = (current + intervals[i]) % 12;
    scale.push(octaveNotes[current]);
  }
  return scale.map((n) => sharpToFlat[n] || n);
}

function computeFingerPositions(
  currentKey,
  currentMode,
  currentHand,
  allNotes,
) {
  if (!currentKey || !currentMode || !currentHand) return [];
  const degree = modeDegrees[currentMode];
  const semitonesDown = semitonesToDegree[degree];
  const relativeKey = getRelativeKey(currentKey, semitonesDown);
  const fingeringStr =
    currentHand === 'Left'
      ? leftFingerings[relativeKey]
      : rightFingerings[relativeKey];
  const base = fingeringStr.substring(0, 7);
  const offset = degree - 1;
  const rotated = base.substring(offset) + base.substring(0, offset);
  const fingering = rotated + rotated.charAt(0);
  const fingers = fingering.split('');
  const scaleNotes = getScaleNotes(currentKey, currentMode);
  const ionianTonic =
    sharpToFlat[flatToSharp[relativeKey] || relativeKey] || relativeKey;
  const tonicNote = flatToSharp[currentKey] || currentKey;
  const tonicIdx = octaveNotes.indexOf(tonicNote);
  const octaveOffset = currentHand === 'Left' ? 0 : 12;
  let startIndex = tonicIdx + octaveOffset;
  if (startIndex + 12 >= allNotes.length) {
    startIndex -= 12;
  }
  const positions = [];
  let currentPos = startIndex;
  positions.push(currentPos);
  const intervals = modeIntervals[currentMode];
  for (let i = 0; i < 7; i++) {
    currentPos += intervals[i];
    positions.push(currentPos);
  }
  const result = [];
  for (let i = 0; i < 8; i++) {
    const pos = positions[i];
    if (pos >= allNotes.length) continue;
    const finger = fingers[i];
    const isIonianTonic = scaleNotes[i] === ionianTonic;
    result.push({ position: pos, finger, isIonianTonic });
  }
  return result;
}

const KeyItem = ({ keyName, checked, onChange }) => {
  const id = `key-${keyName.replace('♭', 'b')}`;
  return (
    <div
      className="key-item"
      style={{
        '--item-color': keyColors[keyName],
        '--symbol-color': getContrastColor(keyColors[keyName]),
      }}
    >
      <input type="checkbox" id={id} checked={checked} onChange={onChange} />
      <label htmlFor={id}>{keyName}</label>
    </div>
  );
};

const ModeItem = ({ mode, checked, onChange }) => {
  const id = `mode-${mode}`;
  return (
    <div
      className="mode-item"
      style={{
        '--item-color': modeColors[mode],
        '--symbol-color': getContrastColor(modeColors[mode]),
      }}
    >
      <input type="checkbox" id={id} checked={checked} onChange={onChange} />
      <label htmlFor={id}>{mode.substring(0, 3)}</label>
    </div>
  );
};

const Parameters = ({
  allowedKeys,
  setAllowedKeys,
  allowedModes,
  setAllowedModes,
}) => (
  <div id="parameters">
    <div className="header-title">Modal Piano Scale Trainer</div>
    <div className="params-sections">
      <div id="about-section">
        <div className="title">About</div>
        <div className="description">
          This tool tests your memory by drilling piano scale fingerings, for
          randomized keys and modes. Fingerings are adapted from typical
          textbook 2-octave fingerings, but focused on the octave-crossing
          portion to enable unlimited bidirectional octave extension during
          improvisation.
        </div>
      </div>
      <div id="keys-section">
        <div className="title">Keys</div>
        <div className="keys-list">
          {keys.map((k) => (
            <KeyItem
              key={k}
              keyName={k}
              checked={allowedKeys.includes(k)}
              onChange={(e) =>
                setAllowedKeys((prev) =>
                  e.target.checked ? [...prev, k] : prev.filter((p) => p !== k),
                )
              }
            />
          ))}
        </div>
      </div>
      <div id="modes-section">
        <div className="title">Modes</div>
        <div className="modes-list">
          {modesOrder.map((m) => (
            <ModeItem
              key={m}
              mode={m}
              checked={allowedModes.includes(m)}
              onChange={(e) =>
                setAllowedModes((prev) =>
                  e.target.checked ? [...prev, m] : prev.filter((p) => p !== m),
                )
              }
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const MainDisplay = ({ currentKey, currentMode }) => (
  <div id="main-display">{`${currentKey} ${currentMode}`}</div>
);

const HandDisplay = ({ side, currentHand }) => (
  <div id={`${side}-hand`}>
    {currentHand === side.charAt(0).toUpperCase() + side.slice(1)
      ? `${side.charAt(0).toUpperCase() + side.slice(1)}`
      : ''}
    {currentHand === side.charAt(0).toUpperCase() + side.slice(1) ? (
      <br />
    ) : null}
    {currentHand === side.charAt(0).toUpperCase() + side.slice(1) ? 'Hand' : ''}
  </div>
);

const Controls = ({ onNextKey, currentHand }) => (
  <div id="controls">
    <HandDisplay side="left" currentHand={currentHand} />
    <button onClick={onNextKey}>Next Key</button>
    <HandDisplay side="right" currentHand={currentHand} />
  </div>
);

const PianoKey = ({ note, isBlack, style, fingerInfo }) => {
  const fingerStyle = {
    color: isBlack ? 'white' : 'black',
  };
  if (fingerInfo?.isIonianTonic) {
    fingerStyle.border = '1px solid currentColor';
    fingerStyle.padding = '0px 2px';
    fingerStyle.borderRadius = '2px';
  }
  return (
    <div
      className={`key ${isBlack ? 'black' : 'white'}`}
      style={style}
      data-note={note}
    >
      {fingerInfo && (
        <span className="finger" style={fingerStyle}>
          {fingerInfo.finger}
        </span>
      )}
    </div>
  );
};

const Piano = ({
  allNotes,
  whiteWidth,
  blackWidth,
  whiteHeight,
  blackHeight,
  offset,
  fingerPositions,
}) => {
  let currentLeft = 0;
  const posToFinger = {};
  fingerPositions.forEach(({ position, finger, isIonianTonic }) => {
    posToFinger[position] = { finger, isIonianTonic };
  });
  const keysElems = allNotes.map((note, index) => {
    const isBlack = note.includes('#');
    const keyStyle = {
      left: `${isBlack ? currentLeft - offset : currentLeft}px`,
      width: `${isBlack ? blackWidth : whiteWidth}px`,
      height: `${isBlack ? blackHeight : whiteHeight}px`,
    };
    if (!isBlack) currentLeft += whiteWidth;
    return (
      <PianoKey
        key={index}
        note={note}
        isBlack={isBlack}
        style={keyStyle}
        fingerInfo={posToFinger[index]}
      />
    );
  });
  return <div id="piano">{keysElems}</div>;
};

const App = () => {
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);
  const [allowedKeys, setAllowedKeys] = React.useState(keys);
  const [allowedModes, setAllowedModes] = React.useState(modesOrder);
  const [currentKey, setCurrentKey] = React.useState(null);
  const [currentMode, setCurrentMode] = React.useState(null);
  const [currentHand, setCurrentHand] = React.useState(null);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const numOctaves = windowWidth < 768 ? 2 : 3;
  const allNotes = Array.from({ length: numOctaves }, () => octaveNotes).flat();
  const maxWhiteKeys = numOctaves * 7;
  const defaultWhiteWidth = 40;
  const targetPianoWidth = Math.min(
    windowWidth * 0.95,
    maxWhiteKeys * defaultWhiteWidth,
  );
  const whiteWidth = targetPianoWidth / maxWhiteKeys;
  const blackWidth = whiteWidth * 0.6;
  const whiteHeight = whiteWidth * 4;
  const blackHeight = whiteWidth * 2.4;
  const offset = blackWidth / 2;

  const fingerPositions = computeFingerPositions(
    currentKey,
    currentMode,
    currentHand,
    allNotes,
  );

  const selectRandom = () => {
    const modes = allowedModes.length > 0 ? allowedModes : modesOrder;
    const keyList = allowedKeys.length > 0 ? allowedKeys : keys;
    const mode = modes[Math.floor(Math.random() * modes.length)];
    const hand = hands[Math.floor(Math.random() * hands.length)];
    const key = keyList[Math.floor(Math.random() * keyList.length)];
    setCurrentKey(key);
    setCurrentMode(mode);
    setCurrentHand(hand);
  };

  React.useEffect(() => {
    selectRandom();
  }, []);

  React.useEffect(() => {
    if (currentKey && currentMode) {
      document.body.style.background = `linear-gradient(135deg, ${modeColors[currentMode]} 0%, ${keyColors[currentKey]} 100%)`;
    }
  }, [currentKey, currentMode]);

  return (
    <>
      <Parameters
        allowedKeys={allowedKeys}
        setAllowedKeys={setAllowedKeys}
        allowedModes={allowedModes}
        setAllowedModes={setAllowedModes}
      />
      <div id="center-wrapper">
        <MainDisplay currentKey={currentKey} currentMode={currentMode} />
        <Controls onNextKey={selectRandom} currentHand={currentHand} />
      </div>
      <Piano
        allNotes={allNotes}
        whiteWidth={whiteWidth}
        blackWidth={blackWidth}
        whiteHeight={whiteHeight}
        blackHeight={blackHeight}
        offset={offset}
        fingerPositions={fingerPositions}
      />
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
