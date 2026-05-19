import { useEffect, useRef, useState } from 'react';

const wasteCategories = {
  plastic: {
    icon: '🧴',
    color: '#3b82f6',
    bin: 'Blue Bin',
    title: 'Plastic Waste',
    instructions: [
      'Rinse the item before disposing',
      'Remove any food residue',
      'Place in Blue recycling bin',
      'Do not mix with food waste'
    ],
    tip: 'Plastic takes 400+ years to decompose. Always recycle!'
  },
  paper: {
    icon: '📄',
    color: '#f59e0b',
    bin: 'Blue Bin',
    title: 'Paper Waste',
    instructions: [
      'Keep paper dry before disposing',
      'Remove any plastic coating',
      'Place in Blue recycling bin',
      'Shred confidential documents first'
    ],
    tip: 'Recycling one ton of paper saves 17 trees!'
  },
  food: {
    icon: '🍎',
    color: '#22c55e',
    bin: 'Green Bin',
    title: 'Food / Organic Waste',
    instructions: [
      'Place in Green compost bin',
      'Can be used for home composting',
      'Do not mix with plastic or metal',
      'Use within 24 hours of disposal'
    ],
    tip: 'Food waste can be converted to compost for plants!'
  },
  metal: {
    icon: '🥫',
    color: '#6b7280',
    bin: 'Grey Bin',
    title: 'Metal Waste',
    instructions: [
      'Rinse cans and tins before disposing',
      'Crush if possible to save space',
      'Place in Grey bin or metal collection',
      'Sharp metals should be wrapped safely'
    ],
    tip: 'Recycling aluminum saves 95% of the energy needed!'
  },
  glass: {
    icon: '🍾',
    color: '#8b5cf6',
    bin: 'Purple Bin',
    title: 'Glass Waste',
    instructions: [
      'Handle with care, glass is sharp',
      'Rinse bottles and jars',
      'Place in glass recycling bin',
      'Do not mix with ceramics or mirrors'
    ],
    tip: 'Glass can be recycled infinitely without losing quality!'
  },
  electronic: {
    icon: '📱',
    color: '#ef4444',
    bin: 'E-Waste Center',
    title: 'Electronic Waste',
    instructions: [
      'Never throw in regular bin',
      'Take to nearest e-waste collection center',
      'Remove batteries separately',
      'Check manufacturer take-back programs'
    ],
    tip: 'E-waste contains toxic materials harmful to environment!'
  },
  other: {
    icon: '🗑️',
    color: '#6b7280',
    bin: 'Black Bin',
    title: 'General Waste',
    instructions: [
      'Place in general waste black bin',
      'Check if any parts can be recycled',
      'Reduce usage where possible'
    ],
    tip: 'When in doubt, reduce and reuse first!'
  }
};

const allowedCategories = new Set(Object.keys(wasteCategories));

const environmentalImpact = {
  plastic: {
    co2Saved: 0.3,
    waterSaved: 1,
    energySaved: '2.5 hours of TV',
    treesEquivalent: '1 tree per 100 bottles',
    funFact: 'Plastic takes 400+ years to decompose!'
  },
  paper: {
    co2Saved: 0.5,
    waterSaved: 10,
    energySaved: '4 hours of laptop use',
    treesEquivalent: '17 trees per ton recycled',
    funFact: 'Recycling 1 ton of paper saves 17 trees!'
  },
  metal: {
    co2Saved: 0.8,
    waterSaved: 5,
    energySaved: '95% energy saved vs new aluminum',
    treesEquivalent: 'Aluminum recycles infinitely!',
    funFact: 'Recycling aluminum saves 95% energy!'
  },
  glass: {
    co2Saved: 0.2,
    waterSaved: 2,
    energySaved: '1.5 hours of TV',
    treesEquivalent: 'Glass recycles infinitely!',
    funFact: 'Glass can be recycled forever!'
  },
  food: {
    co2Saved: 0.4,
    waterSaved: 0,
    energySaved: 'Composting saves landfill space',
    treesEquivalent: 'Compost = natural fertilizer',
    funFact: 'Food waste = 8% of global emissions!'
  },
  electronic: {
    co2Saved: 1.2,
    waterSaved: 0,
    energySaved: 'Recovers precious metals',
    treesEquivalent: 'E-waste has toxic materials!',
    funFact: '1 million phones = 35kg gold recovered!'
  },
  other: {
    co2Saved: 0.1,
    waterSaved: 0,
    energySaved: 'Reduce reuse recycle!',
    treesEquivalent: 'Every small action counts!',
    funFact: 'Small actions = big impact!'
  }
};

const pointsMap = {
  plastic: 10,
  paper: 8,
  metal: 15,
  glass: 12,
  food: 7,
  electronic: 20,
  other: 5
};

const getLevelInfo = (points) => {
  if (points < 20) return { level: 'Eco Beginner', icon: '🌱', next: 20 };
  if (points < 50) return { level: 'Eco Learner', icon: '🌿', next: 50 };
  if (points < 100) return { level: 'Eco Warrior', icon: '🌍', next: 100 };
  if (points < 200) return { level: 'Eco Champion', icon: '🏆', next: 200 };
  return { level: 'Eco Legend', icon: '⭐', next: null };
};

const speakResult = (category, itemName) => {
  if (!('speechSynthesis' in window)) return;

  const text = `This is ${itemName}. It is ${category} waste. Please dispose it in the correct bin. Thank you for recycling!`;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};

const fileToBase64 = (imageFile) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });

const getErrorMessage = (error) => {
  if (!error) return 'Unknown error';
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  return JSON.stringify(error);
};

function WasteScan() {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [scanCount, setScanCount] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);
  const videoRef = useRef(null);
  const celebrationTimeout = useRef(null);

  const levelInfo = getLevelInfo(totalPoints);
  const impact = result ? environmentalImpact[result.category] || environmentalImpact.other : null;

  useEffect(() => () => {
    if (celebrationTimeout.current) {
      clearTimeout(celebrationTimeout.current);
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  useEffect(() => {
    if (showCamera && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [showCamera, cameraStream]);

  useEffect(() => () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }
  }, [cameraStream]);

  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please choose a JPG, PNG, or WEBP image.');
      return;
    }

    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }

    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setResult(null);
    setError(null);
  };

  const handleImageSelect = (event) => {
    handleImageFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true
      });

      setShowCamera(true);
      setCameraStream(stream);
    } catch (error) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = handleImageSelect;
      input.click();
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }
    setShowCamera(false);
    setCameraStream(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'camera-capture.jpg', {
        type: 'image/jpeg'
      });
      handleImageFile(file);
      closeCamera();
    }, 'image/jpeg');
  };

  const classifyWaste = async (selectedImageFile) => {
    if (!selectedImageFile) return;

    setLoading(true);
    setResult(null);
    setError(null);

    let data;

    try {
      const base64 = await fileToBase64(selectedImageFile);

      console.log('Calling backend...');

      const response = await fetch('http://localhost:5000/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64,
          mediaType: selectedImageFile.type
        })
      });

      console.log('Response status:', response.status);
      data = await response.json();
      console.log('Result:', data);

      if (data.error) {
        console.error('API Error:', data.error);
        setError('Classification failed: ' + getErrorMessage(data.error));
        return;
      }

      const parsed = data;
      const category = allowedCategories.has(parsed.category) ? parsed.category : 'other';

      const nextResult = {
        category,
        itemName: parsed.itemName || 'Unknown item',
        confidence: parsed.confidence || 0,
        ...wasteCategories[category]
      };
      const earnedPoints = pointsMap[category] ?? pointsMap.other;

      setResult(nextResult);
      setTotalPoints((prev) => prev + earnedPoints);
      setScanCount((prev) => prev + 1);
      setPointsEarned(earnedPoints);
      setScanHistory((prev) => [
        {
          item: nextResult.itemName,
          category,
          icon: wasteCategories[category].icon,
          time: new Date().toLocaleTimeString(),
          points: earnedPoints
        },
        ...prev
      ].slice(0, 5));
      speakResult(category, nextResult.itemName);

      if (celebrationTimeout.current) {
        clearTimeout(celebrationTimeout.current);
      }
      celebrationTimeout.current = setTimeout(() => {
        setPointsEarned(null);
      }, 2600);
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Cannot connect to backend. Make sure Flask is running!');
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl(null);
    setImageFile(null);
    setResult(null);
    setError(null);
    setLoading(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    handleImageFile(event.dataTransfer.files?.[0]);
  };

  return (
    <div className="space-y-8">
      {showCamera && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.9)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: '80%',
              maxWidth: '500px',
              borderRadius: '12px',
              border: '2px solid #16a34a'
            }}
          />
          <div style={{
            display: 'flex',
            gap: '20px',
            marginTop: '20px'
          }}>
            <button
              onClick={capturePhoto}
              style={{
                background: '#16a34a',
                color: 'white',
                padding: '15px 30px',
                borderRadius: '50px',
                border: 'none',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Capture Photo
            </button>
            <button
              onClick={closeCamera}
              style={{
                background: '#ef4444',
                color: 'white',
                padding: '15px 30px',
                borderRadius: '50px',
                border: 'none',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <section className="rounded-3xl border border-green-400/20 bg-gradient-to-br from-[#064e3b] to-[#052e2b] p-5 text-white shadow-xl md:p-6">
        <p className="text-sm uppercase tracking-[0.24em] text-green-200">AI Waste Classifier</p>
        <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">Waste Scanner</h1>
        <p className="mt-2 text-slate-200">Scan any waste item to know how to dispose it</p>
      </section>

      <section className="relative overflow-hidden rounded-xl border border-green-500 bg-[#1e293b] p-4 shadow-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-green-200">Your Green Points</p>
            <h2 className="mt-1 text-3xl font-bold text-white">🌟 {totalPoints} pts</h2>
          </div>
          <div className="text-center">
            <p className="text-4xl">{levelInfo.icon}</p>
            <p className="font-bold text-green-500">{levelInfo.level}</p>
            {levelInfo.next && (
              <p className="mt-1 text-xs text-slate-400">{levelInfo.next - totalPoints} pts to next level</p>
            )}
          </div>
          <div className="sm:text-right">
            <p className="text-sm text-slate-400">Items Scanned</p>
            <h2 className="mt-1 text-3xl font-bold text-white">{scanCount}</h2>
          </div>
        </div>
        {pointsEarned && (
          <div className="absolute right-4 top-4 animate-bounce rounded-full bg-green-500 px-4 py-2 text-sm font-bold text-white shadow-lg">
            🎉 +{pointsEarned} Green Points earned!
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-700 bg-[#1e293b] p-4 shadow-xl md:p-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageSelect}
          className="hidden"
        />

        {!imageUrl ? (
          <div
            role="button"
            tabIndex={0}
            onClick={openFilePicker}
            onKeyDown={(event) => event.key === 'Enter' && openFilePicker()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`flex min-h-[260px] w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-5 text-center transition md:min-h-96 md:p-8 ${dragActive ? 'border-green-400 bg-green-500/10' : 'border-slate-600 bg-slate-950/40 hover:border-green-400 hover:bg-green-500/10'}`}
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-5xl shadow-sm">📷</div>
            <h2 className="mt-6 text-xl font-semibold text-white md:text-2xl">Click to upload or drag and drop</h2>
            <p className="mt-2 text-sm text-slate-400">Supports JPG, PNG, WEBP</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.58fr_0.42fr]">
            <div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-950/40">
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Selected waste item"
                className="h-64 w-full object-contain md:h-[420px]"
              />
            </div>
            <div className="flex flex-col justify-center rounded-3xl border border-slate-700 bg-slate-950/40 p-5 md:p-6">
              <h2 className="text-xl font-semibold text-white md:text-2xl">Image ready</h2>
              <p className="mt-2 text-slate-300">Run the AI scan to classify this item and get disposal instructions.</p>
              <button
                type="button"
                onClick={() => classifyWaste(imageFile)}
                disabled={loading}
                className="mt-6 w-full rounded-2xl bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-300"
              >
                Scan Now
              </button>
              <button
                type="button"
                onClick={resetScanner}
                className="mt-4 w-full text-center text-sm font-semibold text-green-300 hover:text-green-200 md:text-left"
              >
                Change Image
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={openFilePicker}
            className="w-full rounded-2xl border border-green-400/30 bg-green-500/15 px-5 py-3 text-sm font-semibold text-green-200 transition hover:bg-green-500/25 sm:w-auto"
          >
            Upload Image
          </button>
          <button
            type="button"
            onClick={openCamera}
            className="w-full rounded-2xl border border-slate-600 bg-slate-950/40 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 sm:w-auto"
          >
            Use Camera
          </button>
        </div>
      </section>

      {error && (
        <section className="rounded-3xl border border-red-400/30 bg-red-500/10 p-5 text-red-200 shadow-inner">
          {error}
        </section>
      )}

      {loading && (
        <section className="rounded-3xl border border-slate-700 bg-[#1e293b] p-8 text-center shadow-xl">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-slate-700 border-t-green-500" />
          <p className="mt-5 text-lg font-semibold text-white">AI is analyzing your waste item...</p>
          <div className="mx-auto mt-5 h-3 max-w-md overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-green-500" />
          </div>
        </section>
      )}

      {result && (
        <section
          className="animate-[fadeIn_0.35s_ease-out] rounded-3xl border border-slate-700 bg-[#1e293b] p-4 shadow-xl md:p-6"
          style={{ borderLeft: `4px solid ${result.color}` }}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <span className="text-6xl">{result.icon}</span>
              <div>
                <p className="text-sm text-slate-400">Detected Item: {result.itemName}</p>
                <h2 className="text-2xl font-bold text-white md:text-3xl">Category: {result.title}</h2>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <span className="rounded-full bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-100">🗑️ {result.bin}</span>
              <span className="rounded-full bg-green-500/15 px-4 py-2 text-sm font-semibold text-green-200 ring-1 ring-green-400/30">Confidence: {result.confidence}%</span>
              <button
                type="button"
                onClick={() => speakResult(result.category, result.itemName)}
                className="rounded-full bg-slate-950/60 px-4 py-2 text-sm font-semibold text-white ring-1 ring-slate-600 transition hover:bg-slate-800"
              >
                🔊 Hear Result
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[0.62fr_0.38fr]">
            <div>
              <h3 className="text-xl font-semibold text-white">How to Dispose:</h3>
              <ul className="mt-4 space-y-3">
                {result.instructions.map((instruction) => (
                  <li key={instruction} className="rounded-2xl border border-slate-700 bg-slate-950/40 px-4 py-3 text-slate-300">
                    ✅ {instruction}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl p-5 text-white" style={{ backgroundColor: result.color }}>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] opacity-80">Did you know?</p>
              <p className="mt-3 text-lg font-semibold">💡 {result.tip}</p>
            </div>
          </div>

          {impact && (
            <div
              className="mt-6 rounded-xl p-5 text-white"
              style={{ background: 'linear-gradient(135deg, #064e3b, #16a34a)' }}
            >
              <h3 className="text-xl font-bold">🌍 Environmental Impact</h3>
              <p className="mt-2 text-sm text-green-50">By recycling this item correctly:</p>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="text-sm text-green-50">💨 CO2 Saved</p>
                  <h3 className="mt-1 text-2xl font-bold">{impact.co2Saved} kg</h3>
                </div>
                <div className="rounded-lg bg-white/10 p-3">
                  <p className="text-sm text-green-50">💧 Water Saved</p>
                  <h3 className="mt-1 text-2xl font-bold">{impact.waterSaved} litres</h3>
                </div>
                <div className="rounded-lg bg-white/10 p-3 sm:col-span-2">
                  <p className="text-sm text-green-50">⚡ Energy Equivalent</p>
                  <h3 className="mt-1 text-xl font-bold">{impact.energySaved}</h3>
                </div>
                <div className="rounded-lg bg-white/10 p-3 sm:col-span-2">
                  <p className="text-sm text-green-50">🌳 Material Impact</p>
                  <h3 className="mt-1 text-xl font-bold">{impact.treesEquivalent}</h3>
                </div>
              </div>

              <div className="mt-3 rounded-lg bg-white/15 p-3 text-sm font-semibold">
                💡 Did You Know? {impact.funFact}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={resetScanner}
            className="mt-8 w-full rounded-2xl bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700 sm:w-auto"
          >
            Scan Another Item
          </button>
        </section>
      )}

      {scanHistory.length > 0 && (
        <section className="rounded-3xl border border-slate-700 bg-[#0f172a] p-4 shadow-xl md:p-6">
          <h3 className="text-xl font-bold text-white">📋 Recent Scans</h3>
          <div className="mt-4 space-y-2">
            {scanHistory.map((scan, index) => (
              <div
                key={`${scan.time}-${scan.item}-${index}`}
                className="flex flex-col gap-2 rounded-lg bg-[#1e293b] p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-semibold text-white">{scan.icon} {scan.item}</span>
                <span className="text-green-500">+{scan.points} pts</span>
                <span className="text-slate-500">{scan.time}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default WasteScan;
